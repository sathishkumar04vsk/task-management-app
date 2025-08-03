import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Task
from .serializers import TaskSerializer

class TaskConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add('tasks', self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard('tasks', self.channel_name)

    async def task_update(self, event):
        task_id = event['task_id']
        action = event['action']
        task_data = None
        
        if action != 'deleted':
            try:
                task = Task.objects.get(id=task_id)
                task_data = TaskSerializer(task).data
            except Task.DoesNotExist:
                task_data = None

        await self.send(text_data=json.dumps({
            'type': 'task_update',
            'action': action,
            'task_id': task_id,
            'task': task_data
        }))