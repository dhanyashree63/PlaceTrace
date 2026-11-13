from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    AdminAuditLogListView,
    AdminInviteCodeListCreateView,
    AdminUserListView,
    AdminUserUpdateView,
    CurrentUserView,
    DeleteAccountView,
    ForgotPasswordView,
    LoginView,
    LogoutView,
    NotificationListView,
    NotificationMarkReadView,
    RegisterView,
    ResendVerificationView,
    ResetPasswordView,
    VerifyEmailView,
    DataExportView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("verify-email/", VerifyEmailView.as_view(), name="auth-verify-email"),
    path("resend-verification/", ResendVerificationView.as_view(), name="auth-resend-verification"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="auth-forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="auth-reset-password"),
    path("me/", CurrentUserView.as_view(), name="auth-me"),
    path("notifications/", NotificationListView.as_view(), name="auth-notifications"),
    path("notifications/read/", NotificationMarkReadView.as_view(), name="auth-notifications-read-all"),
    path("notifications/<int:pk>/read/", NotificationMarkReadView.as_view(), name="auth-notification-read"),
    path("export-data/", DataExportView.as_view(), name="auth-export-data"),
    path("delete-account/", DeleteAccountView.as_view(), name="auth-delete-account"),
    # Admin user, invite code, and audit log endpoints
    path("admin/users/", AdminUserListView.as_view(), name="admin-users"),
    path("admin/users/<uuid:pk>/", AdminUserUpdateView.as_view(), name="admin-user-update"),
    path("admin/invite-codes/", AdminInviteCodeListCreateView.as_view(), name="admin-invite-codes"),
    path("admin/audit-logs/", AdminAuditLogListView.as_view(), name="admin-audit-logs"),
]
