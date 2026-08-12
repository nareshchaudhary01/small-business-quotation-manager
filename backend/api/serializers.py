from rest_framework import serializers


class CustomerSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=50, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)


class ProductSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    sku = serializers.CharField(required=False, allow_blank=True)
    price = serializers.FloatField(min_value=0)
    stock = serializers.IntegerField(min_value=0, required=False)


class QuotationItemSerializer(serializers.Serializer):
    product_id = serializers.CharField(required=False, allow_blank=True)
    name = serializers.CharField(max_length=255)
    unit_price = serializers.FloatField(min_value=0)
    quantity = serializers.IntegerField(min_value=1)
    total_price = serializers.FloatField(min_value=0)


class QuotationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    customer_id = serializers.CharField()
    status = serializers.ChoiceField(choices=["draft", "sent", "accepted"], default="draft")
    notes = serializers.CharField(required=False, allow_blank=True)
    items = QuotationItemSerializer(many=True)
    discount = serializers.FloatField(min_value=0, required=False, default=0)
    tax = serializers.FloatField(min_value=0, required=False, default=0)
    subtotal = serializers.FloatField(read_only=True)
    total = serializers.FloatField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


class OrderSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    quotation_id = serializers.CharField(required=False, allow_blank=True)
    customer_id = serializers.CharField()
    status = serializers.ChoiceField(choices=["pending", "processing", "completed", "cancelled"], default="pending")
    notes = serializers.CharField(required=False, allow_blank=True)
    items = QuotationItemSerializer(many=True)
    discount = serializers.FloatField(min_value=0, required=False, default=0)
    tax = serializers.FloatField(min_value=0, required=False, default=0)
    subtotal = serializers.FloatField(read_only=True)
    total = serializers.FloatField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
