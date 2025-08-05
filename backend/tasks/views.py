from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import User, Task, Role
from .serializers import UserSerializer, TaskSerializer, RoleSerializer
from .permissions import RoleBasedPermission
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
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