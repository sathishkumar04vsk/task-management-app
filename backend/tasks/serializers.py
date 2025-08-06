from rest_framework import serializers
from .models import Task, Role, User

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']

class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), source='role', write_only=True, allow_null=True
    )

    class Meta:
        model = User
        fields = ['id', 'username','password', 'email', 'role', 'role_id','is_active']
        extra_kwargs = {'password': {'write_only': True}, 'is_active': {'read_only': True}}
    
    def create(self, validated_data):
        role = validated_data.pop('role', None)
        password = validated_data.pop('password', None)
        if not password:
            raise serializers.ValidationError({'password': 'This field is required.'})
        user = User(**validated_data)
        user.set_password(password)  # Ensure password is hashed
        user.is_active = True  # Ensure user can log in
        user.role = role
        user.save()
        return user

    def update(self, instance, validated_data):
        role = validated_data.pop('role', None)
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        instance.role = role
        instance.save()
        return instance
    
class TaskSerializer(serializers.ModelSerializer):
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='assigned_to', write_only=True, allow_null=True
    )
    assigned_to = UserSerializer(read_only=True, default=None)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'due_date', 'priority', 'status', 
                 'created_by', 'assigned_to', 'created_at', 'updated_at', 'assigned_to_id']