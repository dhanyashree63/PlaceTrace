from django.core.mail import send_mail
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from config.permissions import IsAdminUserRole
from config.throttling import (
    AccountDeletionRateThrottle,
    DataExportRateThrottle,
    EmailResendRateThrottle,
    EmailVerifyRateThrottle,
    LoginRateThrottle,
    PasswordResetRateThrottle,
)
from .models import AuditLog, InviteCode, Notification, User, log_audit_event
from .serializers import (
    AuditLogSerializer,
    InviteCodeSerializer,
    LoginSerializer,
    NotificationSerializer,
    RegisterSerializer,
    UserSerializer,
)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = User.objects.create_user(
            email=data["email"],
            full_name=data["full_name"],
            password=data["password"],
            role=data["role"],
        )
        token = user.generate_verification_token()

        invite = data.get("_invite_obj")
        if invite:
            invite.is_used = True
            invite.used_by = user
            invite.save(update_fields=["is_used", "used_by"])

        if user.role == User.Role.STUDENT:
            from apps.students.models import StudentProfile, ActivityLog
            from apps.study.models import Topic, StudentTopicProgress

            usn = data.get("usn") or f"1RN23{data.get('branch', 'CS')[:2].upper()}{str(user.id)[:4].upper()}"
            profile = StudentProfile.objects.create(
                user=user,
                usn=usn,
                college_name=data.get("college_name", "RNS Institute of Technology"),
                branch=data.get("branch", "CSE"),
                cgpa=data.get("cgpa", 8.50),
                graduation_year=data.get("graduation_year", 2027),
            )
            ActivityLog.objects.create(
                student=profile,
                activity_type="PROFILE",
                title="Joined PlaceTrace & initialized student profile",
            )
            for topic in Topic.objects.all():
                StudentTopicProgress.objects.get_or_create(student=profile, topic=topic)

        Notification.objects.create(
            user=user,
            title="Welcome to PlaceTrace!",
            message="Complete your profile, upload your resume, and start tracking your placement readiness.",
            notification_type=Notification.Type.SYSTEM,
            link="/profile",
        )

        log_audit_event(
            actor=user,
            action="USER_REGISTERED",
            target_model="User",
            target_id=user.id,
            details={"role": user.role},
            request=request,
        )

        try:
            verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
            send_mail(
                subject="Verify your PlaceTrace account",
                message=f"Hello {user.full_name},\n\nVerify your email here: {verify_url}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception:
            pass

        tokens = get_tokens_for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": tokens,
                "verification_token_preview": token if settings.DEBUG else None,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()
        password = serializer.validated_data["password"]

        user = User.objects.filter(email=email).first()
        if not user:
            return Response(
                {"detail": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if user.locked_until and user.locked_until > timezone.now():
            remaining = int((user.locked_until - timezone.now()).total_seconds() // 60) + 1
            return Response(
                {"detail": f"Account temporarily locked due to failed login attempts. Try again in {remaining} minutes."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not user.check_password(password):
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                user.locked_until = timezone.now() + timezone.timedelta(minutes=15)
                log_audit_event(
                    actor=user,
                    action="ACCOUNT_LOCKED_FAILED_LOGINS",
                    target_model="User",
                    target_id=user.id,
                    request=request,
                )
            user.save(update_fields=["failed_login_attempts", "locked_until"])
            return Response(
                {"detail": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {"detail": "User account is deactivated."},
                status=status.HTTP_403_FORBIDDEN,
            )

        user.failed_login_attempts = 0
        user.locked_until = None
        user.save(update_fields=["failed_login_attempts", "locked_until"])

        log_audit_event(
            actor=user,
            action="USER_LOGIN",
            target_model="User",
            target_id=user.id,
            request=request,
        )

        tokens = get_tokens_for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": tokens,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass
        log_audit_event(
            actor=request.user,
            action="USER_LOGOUT",
            target_model="User",
            target_id=request.user.id,
            request=request,
        )
        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)


class VerifyEmailView(views.APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [EmailVerifyRateThrottle]

    def post(self, request):
        token = request.data.get("token", "").strip()
        if not token:
            return Response({"detail": "Verification token is required."}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.filter(verification_token=token).first()
        if not user:
            return Response({"detail": "Invalid or expired verification token."}, status=status.HTTP_400_BAD_REQUEST)
        user.is_email_verified = True
        user.verification_token = ""
        user.save(update_fields=["is_email_verified", "verification_token"])
        log_audit_event(
            actor=user,
            action="EMAIL_VERIFIED",
            target_model="User",
            target_id=user.id,
            request=request,
        )
        return Response({"detail": "Email verified successfully.", "user": UserSerializer(user).data})


class ResendVerificationView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [EmailResendRateThrottle]

    def post(self, request):
        user = request.user
        if user.is_email_verified:
            return Response({"detail": "Email is already verified."})
        token = user.generate_verification_token()
        try:
            verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
            send_mail(
                subject="Verify your PlaceTrace account",
                message=f"Verify your email: {verify_url}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception:
            pass
        return Response({"detail": "Verification email sent."})


class ForgotPasswordView(views.APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [PasswordResetRateThrottle]

    def post(self, request):
        email = request.data.get("email", "").lower().strip()
        user = User.objects.filter(email=email).first()
        if user:
            token = user.generate_reset_token()
            try:
                reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
                send_mail(
                    subject="Reset your PlaceTrace password",
                    message=f"Reset your password: {reset_url}",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True,
                )
            except Exception:
                pass
            log_audit_event(
                actor=user,
                action="PASSWORD_RESET_REQUESTED",
                target_model="User",
                target_id=user.id,
                request=request,
            )
        return Response(
            {"detail": "If an account with that email exists, password reset instructions have been sent."}
        )


class ResetPasswordView(views.APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [PasswordResetRateThrottle]

    def post(self, request):
        token = request.data.get("token", "").strip()
        new_password = request.data.get("new_password", "")
        if not token or len(new_password) < 8:
            return Response(
                {"detail": "Valid token and password (minimum 8 characters) are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = User.objects.filter(
            reset_password_token=token,
            reset_token_expires_at__gt=timezone.now(),
        ).first()
        if not user:
            return Response(
                {"detail": "Invalid or expired password reset token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.set_password(new_password)
        user.reset_password_token = ""
        user.reset_token_expires_at = None
        user.failed_login_attempts = 0
        user.locked_until = None
        user.save()
        log_audit_event(
            actor=user,
            action="PASSWORD_RESET_COMPLETED",
            target_model="User",
            target_id=user.id,
            request=request,
        )
        return Response({"detail": "Password has been reset successfully."})


class CurrentUserView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)[:40]


class NotificationMarkReadView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk=None):
        if pk:
            Notification.objects.filter(user=request.user, pk=pk).update(is_read=True)
        else:
            Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"detail": "Notifications marked as read."})


class DataExportView(views.APIView):
    """Exports only the authenticated user's own placement & career data."""

    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [DataExportRateThrottle]

    def get(self, request):
        user = request.user
        export_payload = {
            "exported_at": timezone.now().isoformat(),
            "user": UserSerializer(user).data,
        }
        if hasattr(user, "student_profile"):
            profile = user.student_profile
            from apps.students.serializers import StudentProfileDetailSerializer
            from apps.applications.serializers import ApplicationSerializer
            from apps.projects.serializers import ProjectSerializer
            from apps.study.serializers import StudyTaskSerializer
            from apps.quizzes.serializers import QuizAttemptSerializer

            export_payload["student_profile"] = StudentProfileDetailSerializer(profile).data
            export_payload["applications"] = ApplicationSerializer(
                profile.applications.select_related("job", "job__company").all(), many=True
            ).data
            export_payload["projects"] = ProjectSerializer(profile.projects.all(), many=True).data
            export_payload["study_tasks"] = StudyTaskSerializer(profile.study_tasks.all(), many=True).data
            export_payload["quiz_attempts"] = QuizAttemptSerializer(
                profile.quiz_attempts.select_related("quiz").all(), many=True
            ).data

        log_audit_event(
            actor=user,
            action="USER_DATA_EXPORTED",
            target_model="User",
            target_id=user.id,
            request=request,
        )
        return Response(export_payload, status=status.HTTP_200_OK)


class DeleteAccountView(views.APIView):
    """Requires password confirmation and protects the last administrator account."""

    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [AccountDeletionRateThrottle]

    @transaction.atomic
    def post(self, request):
        user = request.user
        password = request.data.get("password", "")
        if not password or not user.check_password(password):
            return Response(
                {"detail": "Password confirmation failed. Please enter your current password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.role == User.Role.ADMIN or user.is_superuser:
            active_admins = User.objects.filter(role=User.Role.ADMIN, is_active=True).count()
            if active_admins <= 1:
                return Response(
                    {"detail": "Cannot delete the last active administrator account."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        log_audit_event(
            actor=None,
            action="USER_ACCOUNT_DELETED",
            target_model="User",
            target_id=user.id,
            details={"deleted_email": user.email, "role": user.role},
            request=request,
        )
        user.delete()
        return Response({"detail": "Your account and associated personal records have been deleted."}, status=status.HTTP_200_OK)


# Admin Management Endpoints
class AdminUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminUserRole]
    queryset = User.objects.all()
    filterset_fields = ["role", "is_active", "is_email_verified"]
    search_fields = ["email", "full_name"]


class AdminUserUpdateView(views.APIView):
    permission_classes = [IsAdminUserRole]

    def patch(self, request, pk):
        target_user = generics.get_object_or_404(User, pk=pk)
        new_role = request.data.get("role")
        is_active = request.data.get("is_active")
        custom_permissions = request.data.get("custom_permissions")

        if target_user.role == User.Role.ADMIN and (
            (new_role and new_role != User.Role.ADMIN) or is_active is False
        ):
            active_admins = User.objects.filter(role=User.Role.ADMIN, is_active=True).count()
            if active_admins <= 1:
                return Response(
                    {"detail": "Cannot demote or deactivate the last active administrator."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        changes = {}
        if new_role in dict(User.Role.choices):
            changes["old_role"] = target_user.role
            changes["new_role"] = new_role
            target_user.role = new_role
        if is_active is not None:
            changes["is_active"] = bool(is_active)
            target_user.is_active = bool(is_active)
        if custom_permissions is not None and isinstance(custom_permissions, list):
            changes["custom_permissions"] = custom_permissions
            target_user.custom_permissions = custom_permissions

        target_user.save()
        log_audit_event(
            actor=request.user,
            action="ADMIN_UPDATED_USER",
            target_model="User",
            target_id=target_user.id,
            details=changes,
            request=request,
        )
        return Response(UserSerializer(target_user).data)


class AdminInviteCodeListCreateView(generics.ListCreateAPIView):
    serializer_class = InviteCodeSerializer
    permission_classes = [IsAdminUserRole]
    queryset = InviteCode.objects.all()

    def perform_create(self, serializer):
        invite = serializer.save(created_by=self.request.user)
        log_audit_event(
            actor=self.request.user,
            action="ADMIN_CREATED_INVITE_CODE",
            target_model="InviteCode",
            target_id=invite.id,
            details={"code": invite.code, "role": invite.role},
            request=self.request,
        )


class AdminAuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminUserRole]
    queryset = AuditLog.objects.all()
    search_fields = ["actor_email", "action", "target_model"]
