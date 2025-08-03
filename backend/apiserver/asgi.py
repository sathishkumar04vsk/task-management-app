import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from tasks.consumers import TaskConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'task_manager.settings')

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter([
            path('ws/tasks/', TaskConsumer.as_asgi()),
        ])
    ),
})