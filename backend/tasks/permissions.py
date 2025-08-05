from rest_framework import permissions
from .models import User

class RoleBasedPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        role = request.user.role.name if request.user.role else None
        if not role:
            return False

        # Admin has full access
        if role == 'admin':
            return True

        # Task Manager can perform CRUD and assign tasks
        if role == 'task manager' and view.action in ['list', 'retrieve', 'create', 'update', 'partial_update', 'destroy']:
            return True

        # User can view and edit their own tasks
        if role == 'user' and view.action in ['list', 'retrieve']:
            return True

        return False

    def has_object_permission(self, request, view, obj):
        role = request.user.role.name if request.user.role else None
        if not role:
            return False

        # Admin has full access
        if role == 'admin':
            return True

        # Task Manager can perform CRUD and assign tasks
        if role == 'task manager':
            return True

        # User can only edit their own tasks
        if role == 'user' and view.action in ['retrieve', 'update', 'partial_update']:
            return obj.assigned_to == request.user

        return False