import secrets
import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, full_name, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, full_name=full_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_email_verified", True)
        extra_fields.setdefault("role", User.Role.ADMIN)
        return self.create_user(email, full_name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        STUDENT = "STUDENT", "Student"
        TPO = "TPO", "Training & Placement Officer"
        ADMIN = "ADMIN", "Administrator"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=150)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
        db_index=True,
    )
    avatar_url = models.URLField(blank=True, default="")
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=128, blank=True, default="")
    reset_password_token = models.CharField(max_length=128, blank=True, default="")
    reset_token_expires_at = models.DateTimeField(null=True, blank=True)
    failed_login_attempts = models.PositiveSmallIntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    custom_permissions = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["email", "role"]),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.email})"

    def generate_verification_token(self):
        self.verification_token = secrets.token_urlsafe(32)
        self.save(update_fields=["verification_token"])
        return self.verification_token

    def generate_reset_token(self):
        self.reset_password_token = secrets.token_urlsafe(32)
        self.reset_token_expires_at = timezone.now() + timezone.timedelta(hours=1)
        self.save(update_fields=["reset_password_token", "reset_token_expires_at"])
        return self.reset_password_token


class InviteCode(models.Model):
    code = models.CharField(max_length=32, unique=True, db_index=True)
    role = models.CharField(
        max_length=20,
        choices=User.Role.choices,
        default=User.Role.TPO,
    )
    department = models.CharField(max_length=100, blank=True, default="")
    is_used = models.BooleanField(default=False)
    used_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="used_invite_codes",
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_invite_codes",
    )
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.code} ({self.role})"


class Notification(models.Model):
    class Type(models.TextChoices):
        APPLICATION = "APPLICATION", "Application Update"
        JOB_MATCH = "JOB_MATCH", "Recommended Job"
        TASK = "TASK", "Upcoming Study Task"
        INTERVIEW = "INTERVIEW", "Interview Stage"
        SELECTION = "SELECTION", "Selection"
        REJECTION = "REJECTION", "Application Status"
        RESUME = "RESUME", "Resume Analysis"
        SYSTEM = "SYSTEM", "System Notification"

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=30,
        choices=Type.choices,
        default=Type.SYSTEM,
    )
    link = models.CharField(max_length=255, blank=True, default="")
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "is_read", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.user.email}: {self.title}"


class AuditLog(models.Model):
    actor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )
    actor_email = models.CharField(max_length=255, blank=True, default="")
    action = models.CharField(max_length=150, db_index=True)
    target_model = models.CharField(max_length=100, blank=True, default="")
    target_id = models.CharField(max_length=100, blank=True, default="")
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.created_at}] {self.actor_email} -> {self.action}"


def log_audit_event(actor, action, target_model="", target_id="", details=None, request=None):
    ip = None
    if request:
        x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
        ip = x_forwarded.split(",")[0].strip() if x_forwarded else request.META.get("REMOTE_ADDR")
    return AuditLog.objects.create(
        actor=actor if actor and getattr(actor, "is_authenticated", False) else None,
        actor_email=getattr(actor, "email", "anonymous"),
        action=action,
        target_model=target_model,
        target_id=str(target_id),
        details=details or {},
        ip_address=ip,
    )
