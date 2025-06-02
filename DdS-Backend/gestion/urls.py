from rest_framework import routers
from .views import ClienteViewSet, DespachadorViewSet, ConductorViewSet

router = routers.DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'despachadores', DespachadorViewSet)
router.register(r'conductores', ConductorViewSet)

urlpatterns = router.urls

urlpatterns = list(router.urls)