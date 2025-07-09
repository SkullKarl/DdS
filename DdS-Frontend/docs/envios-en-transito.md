# Sistema de Envíos en Tránsito

## Descripción

Este sistema permite manejar automáticamente el estado de los envíos cuando los paquetes son puestos en tránsito, y mostrar dinámicamente el envío en tránsito en el mapa del conductor.

## Funcionalidades Implementadas

### 1. Cambio de Estado Automático

- Cuando un paquete se cambia a "en tránsito", **todos los paquetes del mismo envío** se cambian automáticamente a "en tránsito"
- El ID del envío en tránsito se guarda en el estado global de la aplicación

### 2. Visualización Dinámica en el Mapa

- `HomeDriverScreen` ahora muestra dinámicamente el envío que está en tránsito
- Si no hay envíos en tránsito, muestra un mensaje informativo
- El mapa se actualiza automáticamente cuando cambia el envío en tránsito

### 3. Estado Global Reactivo

- `EnvioStateService` maneja el estado global del envío actual en tránsito
- Los componentes pueden suscribirse a cambios en este estado
- Se inicializa automáticamente al obtener el ID del conductor

## Archivos Modificados

### 1. `EnvioStateService.ts` (NUEVO)

- Servicio para manejar el estado global del envío en tránsito
- Permite suscribirse a cambios en el envío actual
- Métodos principales:
  - `setCurrentEnvioId()`
  - `getCurrentEnvioId()`
  - `subscribe()`
  - `clearCurrentEnvioId()`

### 2. `ShipmentService.ts`

- **Modificado**: `updatePackageStatus()` - Ahora actualiza todos los paquetes del envío cuando se cambia a "en tránsito"
- **Nuevo**: `initializeCurrentEnvioInTransit()` - Inicializa el estado al cargar la aplicación
- **Nuevo**: `getCurrentEnvioInTransit()` - Obtiene el envío actual en tránsito
- **Nuevo**: `subscribeToCurrentEnvioChanges()` - Suscripción a cambios del envío actual
- **Nuevo**: `checkAndClearEnvioIfCompleted()` - Limpia el estado cuando todos los paquetes son entregados

### 3. `HomeDriverScreen.tsx`

- **Modificado**: Ahora recibe dinámicamente el ID del envío en tránsito
- Se suscribe a cambios en el envío actual
- Muestra mensaje cuando no hay envíos en tránsito

### 4. `MyShipmentsScreen.tsx`

- **Modificado**: `handleStatusUpdate()` - Actualiza localmente todos los paquetes del envío cuando se cambia a "en tránsito"
- **Modificado**: `getCurrentDriverId()` - Inicializa el estado del envío en tránsito

### 5. `components/map/index.tsx`

- **Nuevo**: Configuración correcta para importación multiplataforma del componente Map

## Flujo de Funcionamiento

1. **Inicialización**:

   - Al obtener el ID del conductor, se verifica si hay envíos en tránsito
   - Si los hay, se establece como el envío actual

2. **Cambio a "En Tránsito"**:

   - Usuario cambia un paquete a "en tránsito" en `MyShipmentsScreen`
   - `ShipmentService.updatePackageStatus()` actualiza **todos** los paquetes del mismo envío
   - Se establece el envío como el actual en tránsito
   - `HomeDriverScreen` se actualiza automáticamente para mostrar este envío

3. **Finalización del Envío**:
   - Cuando un paquete se cambia a "entregado"
   - Se verifica si quedan paquetes en tránsito en ese envío
   - Si no quedan, se limpia el envío actual del estado global

## Beneficios

- ✅ Consistencia: Todos los paquetes de un envío tienen el mismo estado
- ✅ Automatización: No es necesario cambiar cada paquete individualmente
- ✅ Visualización dinámica: El mapa siempre muestra el envío correcto
- ✅ Estado reactivo: Los componentes se actualizan automáticamente
- ✅ Persistencia: El estado se mantiene durante la sesión de la aplicación
