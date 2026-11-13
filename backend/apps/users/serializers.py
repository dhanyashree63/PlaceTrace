import secrets
from django.utils import timezone
from rest_framework import serializers
from .models import User, InviteCode, Notification, AuditLog


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "role",
            "avatar_url",
            "is_active",
            "is_email_verified",
            "custom_permissions",
            "created_at",
        ]
        read_only_fields = ["id", "email", "role", "is_email_verified", "created_at"]


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=User.Role.choices, default=User.Role.STUDENT)
    invite_code = serializers.CharField(required=False, allow_blank=True, default="")
    # Optional initial student profile fields
    college_name = serializers.CharField(required=False, default="RNS Institute of Technology")
    branch = serializers.CharField(required=False, default="CSE")
    cgpa = serializers.DecimalField(max_digits=4, decimal_places=2, required=False, default=8.50)
    graduation_year = serializers.IntegerField(required=False, default=2027)
    usn = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_email(self, value):
        email = value.lower().strip()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def validate(self, attrs):
        role = attrs.get("role", User.Role.STUDENT)
        invite_code_str = attrs.get("invite_code", "").strip()
        if role in (User.Role.TPO, User.Role.ADMIN):
            if not invite_code_str:
                raise serializers.ValidationError(
                    {"invite_code": f"An active invite code is required to register as {role}."}
                )
            invite = InviteCode.objects.filter(
                code=invite_code_str,
                role=role,
                is_used=False,
                expires_at__gt=timezone.now(),
            ).first()
            if not invite:
                raise serializers.ValidationError(
                    {"invite_code": "Invalid, expired, or already used invite code."}
                )
            attrs["_invite_obj"] = invite
        return attrs


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    remember_me = serializers.BooleanField(required=False, default=False)


class InviteCodeSerializer(serializers.ModelSerializer):
    created_by_email = serializers.CharField(source="created_by.email", read_only=True, default="")
    used_by_email = serializers.CharField(source="used_by.email", read_only=True, default="")

    class Meta:
        model = InviteCode
        fields = [
            "id",
            "code",
            "role",
            "department",
            "is_used",
            "used_by_email",
            "created_by_email",
            "expires_at",
            "created_at",
        ]
        read_only_fields = ["id", "code", "is_used", "used_by_email", "created_by_email", "created_at"]

    def create(self, validated_data):
        validated_data["code"] = f"PT-{secrets.token_hex(4).upper()}"
        return super().create(validated_data)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "notification_type",
            "link",
            "is_read",
            "created_at",
        ]
        read_only_fields = ["id", "title", "message", "notification_type", "link", "created_at"]


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = [
            "id",
            "actor_email",
            "action",
            "target_model",
            "target_id",
            "details",
            "ip_address",
            "created_at",
        ]
