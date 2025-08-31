# Sistema de Cajas Actualizado - Documentación

## Resumen de Cambios

Se ha refactorizado completamente el sistema de control de cajas para trabajar exclusivamente con API, eliminando la dependencia de localStorage y implementando nuevos endpoints optimizados.

## Arquitectura del Sistema

### Componentes Principales

1. **BillingPage.vue**: Página principal que controla el estado de las cajas
2. **CashBoxDialog.vue**: Modal para gestión de cajas (crear, abrir, cerrar)

### Flujo de Trabajo

#### 1. Verificación Inicial
- Al cargar `BillingPage.vue`, se ejecuta `checkCashBoxStatus()`
- Consulta `GET /cashier-init` para verificar si existe sesión activa
- Actualiza el estado del botón dinámicamente

#### 2. Estados del Botón
- **Caja Abierta**: Muestra "Cerrar Caja" (botón rojo)
- **Caja Cerrada**: Muestra "Abrir Caja" (botón verde)

#### 3. Modal de Gestión
- **Sin cajas**: Modal para crear nueva caja
- **Una caja**: Autoselección automática  
- **Múltiples cajas**: Selector con iconos de estado

## Endpoints API

### GET /cashier-init
Verifica el estado actual de la sesión del cajero.

**Respuesta exitosa:**
```json
{
  "id": "session_id",
  "cashbox_id": 1,
  "user_id": 123,
  "open": true,
  "status": "active",
  "init_balance": 1000.00
}
```

**Sin sesión activa:** HTTP 404

### GET /cashboxes
Lista todas las cajas disponibles con filtros de seguridad.

**Parámetros de filtro:**
- `branch_office_id`: ID de la sucursal (obligatorio)
- `status`: Filtro por estado (activo/inactivo)

**Respuesta:**
```json
[
  {
    "id": 1,
    "name": "Caja Principal",
    "branch_office_id": 1,
    "open": false,
    "status": "active",
    "deleted_at": null
  }
]
```

### POST /cashboxes
Crea una nueva caja.

**Payload:**
```json
{
  "name": "Nueva Caja",
  "branch_office_id": 1,
  "initial_balance": 1000.00
}
```

### POST /cashier-open
Abre una sesión de caja.

**Payload:**
```json
{
  "cashbox_id": 1,
  "initial_balance": 1000.00
}
```

### PUT /cashier-close/{id}
Cierra una sesión de caja.

**Payload:**
```json
{
  "final_balance": 1500.00,
  "notes": "Cierre normal del turno"
}
```

## Funciones Principales

### BillingPage.vue

#### `checkCashBoxStatus()`
```javascript
// Verifica estado actual desde API
// Actualiza isUserBoxOpen y cashBoxState
// Si no hay caja abierta, carga cajas disponibles
```

#### `loadAvailableCashBoxes()`
```javascript
// Carga todas las cajas de la sucursal
// Filtra por branch_office_id, status='active', no eliminadas
// Incluye campo 'open' para indicadores visuales
```

#### `handleBoxOpened(boxData)`
```javascript
// Maneja evento de apertura de caja
// Actualiza estado local con datos de sesión
// Limpia lista de cajas disponibles
```

#### `handleBoxClosed(closeData)`
```javascript
// Maneja evento de cierre de caja  
// Limpia estado local
// Recarga cajas disponibles
```

### CashBoxDialog.vue

#### Estados del Modal
- **Crear**: Formulario para nueva caja
- **Seleccionar**: Lista con iconos de estado
- **Cerrar**: Formulario con balance final

#### Indicadores Visuales
- 🔴 **Icono Rojo**: Caja abierta (`radio_button_checked`)
- 🟢 **Icono Verde**: Caja cerrada (`radio_button_unchecked`)

## Validaciones de Seguridad

### Por Sucursal
- Todas las operaciones filtran por `branch_office_id`
- Solo se muestran cajas de la sucursal actual
- Validación antes de abrir/cerrar

### Estado de Cajas
- Solo una caja abierta por sucursal
- No se pueden eliminar cajas abiertas
- Validación de pertenencia antes de operaciones

### Balances
- Balance inicial debe ser >= 0
- Balance final debe ser >= 0
- Validación numérica en formularios

## Manejo de Errores

### Códigos de Estado
- **404**: Sin sesión activa (comportamiento normal)
- **400**: Validaciones fallidas
- **500**: Errores del servidor

### Notificaciones
- Éxito: Notificaciones verdes con Quasar
- Error: Notificaciones rojas con detalles
- Validación: Mensajes en formularios

## Variables Reactivas

### BillingPage.vue
```javascript
data() {
  return {
    isUserBoxOpen: false,        // Estado del botón
    cashBoxState: null,          // Datos de sesión activa
    availableCashBoxes: [],      // Lista de cajas disponibles
    showCashBoxDialog: false     // Control del modal
  }
}
```

### CashBoxDialog.vue
```javascript
data() {
  return {
    boxAlreadyOpen: false,       // Estado heredado
    selectedCashBox: null,       // Caja seleccionada
    initialBalance: 0,           // Balance inicial
    finalBalance: 0,             // Balance final
    loadingOpenBox: false,       // Estado de carga
    loadingCloseBox: false       // Estado de carga cierre
  }
}
```

## Integración Completa

El sistema ahora funciona de manera completamente integrada:

1. **Una sola fuente de verdad**: La API es la única fuente de estado
2. **Sin localStorage**: Eliminada toda dependencia de almacenamiento local
3. **Sincronización automática**: El estado se actualiza en tiempo real
4. **Seguridad por sucursal**: Validaciones estrictas de pertenencia
5. **UI reactiva**: Indicadores visuales claros del estado

## Próximos Pasos

Para completar la implementación:

1. **Testing**: Probar todos los flujos de trabajo
2. **Validación**: Verificar endpoints en entorno real
3. **Optimización**: Revisar rendimiento de consultas
4. **Monitoreo**: Implementar logs detallados

---

*Documentación generada el: $(date)*
*Sistema refactorizado para eliminar localStorage y optimizar API*
