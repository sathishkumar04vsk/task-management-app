import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'apiserver.settings')
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from tasks.consumers import TaskConsumer

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter([
            path('ws/tasks/', TaskConsumer.as_asgi()),
        ])
    ),
})