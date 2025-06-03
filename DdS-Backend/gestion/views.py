from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
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


@api_view(['GET'])
def usuario_por_uid(request, uid):
    for Model, rol in [(Conductor, 'conductor'), (Despachador, 'despachador'), (Cliente, 'cliente')]:
        try:
            user = Model.objects.get(firebase_uid=uid)
            return Response({
                'id': user.id,
                'nombre': user.nombre,
                'correo': user.correo,
                'rol': rol
            })
        except Model.DoesNotExist:
            continue
    return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)