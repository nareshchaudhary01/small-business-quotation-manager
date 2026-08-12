from rest_framework.decorators import api_view
from rest_framework.response import Response

from .db import check_connection


@api_view(["GET"])
def health_check(request):
    connected = check_connection()
    status = "connected" if connected else "disconnected"
    return Response({"status": "ok", "database": status})
