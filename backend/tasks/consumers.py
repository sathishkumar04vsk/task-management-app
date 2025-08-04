import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
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
            task = await self.get_task(task_id)
            if task:
                task_data = await self.serialize_task(task)

        await self.send(text_data=json.dumps({
            'type': 'task_update',
            'action': action,
            'task_id': task_id,
            'task': task_data
        }))

    @sync_to_async
    def get_task(self, task_id):
        try:
            return Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return None

    @sync_to_async
    def serialize_task(self, task):
        return TaskSerializer(task).data
