from rest_framework import serializers
from .models import Cliente, Despachador, Conductor

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

class DespachadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Despachador
        fields = '__all__'

class ConductorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conductor
        fields = '__all__'