from django.urls import path
from .views import usuario_por_uid
from rest_framework import routers
from .views import ClienteViewSet, DespachadorViewSet, ConductorViewSet

router = routers.DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'despachadores', DespachadorViewSet)
router.register(r'conductores', ConductorViewSet)

urlpatterns = [
    path('usuario_por_uid/<str:uid>/', usuario_por_uid),
]
urlpatterns += router.urls