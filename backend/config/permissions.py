from rest_framework import permissions


class IsStudent(permissions.BasePermission):
    """Allow access only to authenticated Student users."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "STUDENT"
        )


class IsTPO(permissions.BasePermission):
    """Allow access to Training & Placement Officers (TPO) or Admins."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ("TPO", "ADMIN")
        )


class IsAdminUserRole(permissions.BasePermission):
    """Allow access strictly to Admin users."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == "ADMIN" or request.user.is_superuser)
        )


class IsOwnerOrTPOOrAdmin(permissions.BasePermission):
    """Students can only access their own records; TPO/Admin have read or permitted write access."""

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in ("TPO", "ADMIN") or request.user.is_superuser:
            return True
        owner = getattr(obj, "user", None)
        if owner is None and hasattr(obj, "student"):
            owner = getattr(obj.student, "user", None)
        return owner == request.user
