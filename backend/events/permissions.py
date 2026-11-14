from rest_framework import permissions

class IsOrganizerOrReadOnly(permissions.BasePermission):
    """Read is public; writes require organizer role."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == "organizer"

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.organizer_id == request.user.id
    