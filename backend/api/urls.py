from django.urls import path

from .views import customer_detail, customer_list_create, health_check

urlpatterns = [
    path("health/", health_check, name="health_check"),
    path("customers/", customer_list_create, name="customer_list_create"),
    path("customers/<str:customer_id>/", customer_detail, name="customer_detail"),
]
