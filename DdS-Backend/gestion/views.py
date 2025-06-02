from rest_framework import viewsets
from .models import Cliente, Despachador, Conductor
from .serializers import ClienteSerializer, DespachadorSerializer, ConductorSerializer

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class DespachadorViewSet(viewsets.ModelViewSet):
    queryset = Despachador.objects.all()
    serializer_class = DespachadorSerializer

class ConductorViewSet(viewsets.ModelViewSet):
    queryset = Conductor.objects.all()
    serializer_class = ConductorSerializer