from django.urls import path

from .auth import login, register
from .views import (
    customer_detail,
    customer_list_create,
    health_check,
    order_detail,
    order_list_create,
    product_detail,
    product_list_create,
    quotation_convert_to_order,
    quotation_detail,
    quotation_list_create,
)

urlpatterns = [
    path("health/", health_check, name="health_check"),
    path("auth/register/", register, name="auth_register"),
    path("auth/login/", login, name="auth_login"),
    path("customers/", customer_list_create, name="customer_list_create"),
    path("customers/<str:customer_id>/", customer_detail, name="customer_detail"),
    path("products/", product_list_create, name="product_list_create"),
    path("products/<str:product_id>/", product_detail, name="product_detail"),
    path("quotations/", quotation_list_create, name="quotation_list_create"),
    path("quotations/<str:quotation_id>/", quotation_detail, name="quotation_detail"),
    path("quotations/<str:quotation_id>/convert/", quotation_convert_to_order, name="quotation_convert_to_order"),
    path("orders/", order_list_create, name="order_list_create"),
    path("orders/<str:order_id>/", order_detail, name="order_detail"),
]
