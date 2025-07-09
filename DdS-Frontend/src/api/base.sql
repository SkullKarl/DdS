-- Tabla ADMIN
create table ADMIN (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  contraseña text not null,
  correo text not null unique,
  telefono text,
  estado text
);
 
-- Tabla CONDUCTOR
create table CONDUCTOR (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  contraseña text not null,
  correo text not null unique,
  telefono text,
  estado text,
  licencencia text,
  vehiculo text
);
 
-- Tabla DESPACHADOR
create table DESPACHADOR (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  correo text not null unique,
  contraseña text not null,
  telefono text
);
 
-- Tabla CLIENTE
create table CLIENTE (
  id_cliente uuid primary key default gen_random_uuid(),
  nombre text not null,
  contraseña text not null,
  correo text not null unique,
  telefono text,
  direccion text,
  preferencia_notificacion text
);
 
-- Tabla INFORME
create table INFORME (
  id_informe uuid primary key default gen_random_uuid(),
  tiempo timestamp not null,
  entrego_todos boolean,
  vueltas int,
  id_admin uuid references ADMIN(id),
  id_conductor uuid references CONDUCTOR(id)
  id_ruta uuid references RUTA(id)

);
 
-- Tabla RUTA
create table RUTA (
  id_ruta uuid primary key default gen_random_uuid(),
  distancia numeric,
  puntos_referencia text,
  origen text 
);
 
-- Tabla ENVIO
create table ENVIO (
  id_envio uuid primary key default gen_random_uuid(),
  paquetes_totales int,
  id_ruta uuid references RUTA(id_ruta)
);
 
-- Tabla ASIGNACION
create table ASIGNACION (
  id_despachador uuid references DESPACHADOR(id),
  id_conductor uuid references CONDUCTOR(id),
  id_envio uuid references ENVIO(id_envio),
  primary key (id_despachador, id_conductor, id_envio)
);
 
-- Tabla PAQUETE
create table PAQUETE (
  id_paquete uuid primary key default gen_random_uuid(),
  fecha_e date,
  direccion_entrega text,
  estado text check (estado in ('en bodega', 'en camino', 'entregado')),
  id_envio uuid references ENVIO(id_envio),
  id_cliente uuid references CLIENTE(id_cliente),
  peso numeric,
  dimensiones text
);