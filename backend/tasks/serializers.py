from rest_framework import serializers
from .models import Task
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff']

class TaskSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    # assigned_to_id = serializers.PrimaryKeyRelatedField(
    #     queryset=User.objects.all(), source='assigned_to', write_only=True, allow_null=True
    # )

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'due_date', 'priority', 'status', 
                 'created_by', 'assigned_to', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']