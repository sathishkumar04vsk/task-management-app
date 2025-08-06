from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import User, Task, Role
from .serializers import UserSerializer, TaskSerializer, RoleSerializer
from .permissions import RoleBasedPermission
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework import status
import json
from rest_framework.views import APIView
from rest_framework.response import Response

def notify_task_update(task_id, action):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'tasks',
        {
            'type': 'task_update',
            'task_id': task_id,
            'action': action,
        }
    )

class InitializeSuperuserView(APIView):
    authentication_classes = []  # No authentication required
    permission_classes = []     # No permissions required

    def post(self, request):
        # Check if superuser already exists to prevent abuse
        if User.objects.filter(is_superuser=True).exists():
            return Response(
                {"detail": "Superuser already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create roles if they don't exist
        roles = ['admin', 'task manager', 'user']
        for role_name in roles:
            Role.objects.get_or_create(name=role_name)

        # Create superuser
        superuser_data = {
            "username": request.data.get("username", "admin"),
            "email": request.data.get("email", "admin@example.com"),
            "password": request.data.get("password", "adminpassword"),
            "role_id": Role.objects.get(name="admin").id,
            "is_active": True,
            "is_staff": True,
            "is_superuser": True
        }

        serializer = UserSerializer(data=superuser_data)
        if serializer.is_valid():
            serializer.save()  # Uses UserSerializer.create with set_password
            return Response(
                {"detail": "Superuser and roles initialized successfully"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]

    def get_queryset(self):
        # Only admins can access user list
        if self.request.user.role.name == 'admin':
            return User.objects.all()
        return User.objects.none()

       
class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]

    def get_queryset(self):
        user = self.request.user
        role = user.role.name if user.role else None
        if role == 'admin' or role == 'task manager':
            return Task.objects.all()
        return Task.objects.filter(assigned_to=user)

    def perform_create(self, serializer):
        task = serializer.save()
        notify_task_update(task.id, 'created')

    def perform_update(self, serializer):
        task = serializer.save()
        notify_task_update(task.id, 'updated')

    def perform_destroy(self, instance):
        task_id = instance.id
        instance.delete()
        notify_task_update(task_id, 'deleted')

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]

    def get_queryset(self):
        # Only admins can access roles
        if self.request.user.role.name == 'admin':
            return Role.objects.all()
        return Role.objects.none()