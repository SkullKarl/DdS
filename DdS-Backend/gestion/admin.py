from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Admin, Conductor, Cliente, Informe, Ruta, Envio, Paquete, Asignacion, Despachador

admin.site.register(Admin)
admin.site.register(Conductor)
admin.site.register(Cliente)
admin.site.register(Informe)
admin.site.register(Ruta)
admin.site.register(Envio)
admin.site.register(Paquete)
admin.site.register(Asignacion)
admin.site.register(Despachador)