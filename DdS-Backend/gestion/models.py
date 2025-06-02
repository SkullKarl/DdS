from django.db import models

class Admin(models.Model):
    nombre = models.CharField(max_length=100)
    contraseña = models.CharField(max_length=128)
    correo = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20)
    estado = models.CharField(max_length=20)

class Conductor(models.Model):
    nombre = models.CharField(max_length=100)
    contraseña = models.CharField(max_length=128)
    correo = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20)
    estado = models.CharField(max_length=20)
    licencia = models.CharField(max_length=50)
    vehiculo = models.CharField(max_length=100)
    firebase_uid = models.CharField(max_length=128, blank=True, null=True)  


class Despachador(models.Model):
    nombre = models.CharField(max_length=100)
    correo = models.EmailField(unique=True)
    contraseña = models.CharField(max_length=128)
    telefono = models.CharField(max_length=20)
    firebase_uid = models.CharField(max_length=128, blank=True, null=True)  


class Cliente(models.Model):
    nombre = models.CharField(max_length=100)
    contraseña = models.CharField(max_length=128)
    correo = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20)
    direccion = models.CharField(max_length=200)
    preferencia_notificacion = models.CharField(max_length=50)
    firebase_uid = models.CharField(max_length=128, blank=True, null=True)  


class Informe(models.Model):
    tiempo = models.DurationField()
    entrego_todos = models.BooleanField()
    vueltas = models.IntegerField()
    admin = models.ForeignKey(Admin, on_delete=models.CASCADE)
    conductor = models.ForeignKey(Conductor, on_delete=models.CASCADE)

class Ruta(models.Model):
    distancia = models.FloatField()
    puntos_referencia = models.CharField(max_length=200)
    origen = models.CharField(max_length=100)
    informe = models.ForeignKey(Informe, on_delete=models.SET_NULL, null=True, blank=True)

class Envio(models.Model):
    paquetes_totales = models.IntegerField()
    ruta = models.ForeignKey(Ruta, on_delete=models.CASCADE)

class Asignacion(models.Model):
    despachador = models.ForeignKey(Despachador, on_delete=models.CASCADE)
    conductor = models.ForeignKey(Conductor, on_delete=models.CASCADE)
    envio = models.ForeignKey(Envio, on_delete=models.CASCADE)
    class Meta:
        unique_together = ('despachador', 'conductor', 'envio')  # Asegura ternaria única

class Paquete(models.Model):
    ESTADO_CHOICES = [
        ('en bodega', 'En bodega'),
        ('en camino', 'En camino'),
        ('entregado', 'Entregado'),
    ]
    fecha_e = models.DateField()
    direccion_entrega = models.CharField(max_length=200)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES)
    envio = models.ForeignKey(Envio, on_delete=models.CASCADE)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    peso = models.FloatField()
    dimensiones = models.CharField(max_length=100)
