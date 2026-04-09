---
name: Playbook de integraciones QBITS
description: Guía paso a paso para crear integraciones nuevas en QBITS — backend, frontend, testing. Seguir este checklist para cada integración nueva.
type: reference
---

## Checklist obligatorio para crear una integración nueva

### 1. Backend — Archivos a crear/modificar

**a) Insertar registro en tabla `integrations` (DB)**
- slug, name, description, logo_url, color, api_url, fields (JSON), has_webhook
- Si es OAuth (sin campos manuales): `fields: []`
- Si pide credenciales: definir fields con name, label, type, required, placeholder

**b) Controller dedicado** (`app/Http/Controllers/{Nombre}Controller.php`)
- OAuth: endpoints de onboard/authorize, callback, status, disconnect
- API: endpoints específicos de la integración (sync products, create orders, etc.)
- Webhook handler para recibir notificaciones
- Auto-crear PaymentMethod si la integración procesa pagos (con `user_created_id`)

**c) Connector** (`app/Services/Integrations/{Nombre}Connector.php`)
- Implementar `IntegrationConnectorInterface`
- Métodos: connect(), validateCredentials(), getRequiredFields()

**d) Registrar connector** en `IntegrationConnectionService.php`
- Agregar al array `$connectors`: `'slug' => NombreConnector::class`

**e) Rutas** (`routes/api.php`)
- Grupo auth:sanctum para endpoints autenticados
- Ruta pública para webhook (sin auth, validar firma)
- Ruta pública para callback OAuth

**f) Event de Broadcasting** (si notifica en tiempo real)
- Crear en `app/Events/` implementando ShouldBroadcast
- Channel name: `{slug}-payment` o `{slug}-order`

**g) Variables de entorno**
- Agregar keys al `.env` del container Docker
- Agregar config en `config/services.php`
- `FRONTEND_URL` para redirect callbacks

### 2. Frontend — Archivos a modificar

**a) `IntegrationDynamic.vue`**
- Si es OAuth: agregar bloque `v-else-if="isNombreIntegracion"` con botón de redirect
- Si es credenciales: el form genérico ya funciona con los fields de la DB
- Agregar computed `isNombreIntegracion`
- Agregar métodos de onboard, status, disconnect
- Agregar sección de "Conectado" con acciones específicas

**b) `IntegrationsPage.vue`**
- Agregar check de status en `loadIntegrations()` (como Stripe chequea `/stripe/status`)
- Si es OAuth: redirigir `openConfigDialog` y `openEditDialog` al IntegrationDynamic

**c) `PaymentModal.vue`** (solo si procesa pagos)
- Agregar acronym al mapa de iconos y colores
- Agregar lógica de trigger en `addPayment()`

**d) `BillingPage.vue`** (solo si procesa pagos)
- Importar componente de espera de pago
- Agregar variables y métodos de manejo

**e) Logo**
- PNG ~1024px ancho, fondo transparente
- Guardar en Docker: `/var/www/storage/app/public/integrations/logos/{slug}.png`
- En DB: `logo_url = 'integrations/logos/{slug}.png'` (sin /storage/, el modelo lo agrega)

### 3. Testing — Verificación obligatoria

- [ ] `php artisan route:list --path={slug}` — rutas registradas
- [ ] `php artisan migrate` — migración sin errores
- [ ] Endpoint de status responde (con y sin conexión)
- [ ] Flujo OAuth completo: redirect → autorización → callback → token guardado
- [ ] Card en IntegrationsPage muestra logo + estado correcto
- [ ] Click "Configurar" abre dialog correcto
- [ ] Después de conectar: card muestra "Conectado" verde
- [ ] Webhook recibe y procesa eventos
- [ ] Logs en `storage/logs/laravel.log` sin errores

### 4. Errores comunes

- `user_created_id` no tiene default → siempre pasar `Auth::id() ?? 0`
- País no soportado → fallback a país válido
- Logo con doble `/storage/` → guardar sin prefijo en DB, el modelo lo agrega
- Frontend apunta a producción en local → cambiar `.env` VITE_APP_API_URL
- OAuth redirect URL hardcodeada → usar `env('FRONTEND_URL')`
- CSRF en webhooks → las rutas API no tienen CSRF, pero verificar firma del proveedor

### 5. Patrones existentes de referencia

| Integración | Tipo | Auth | Controller | Connector |
|-------------|------|------|------------|-----------|
| ARCA | Credenciales | CUIT+password | CompanyIntegrationController | ArcaConnector |
| MercadoPago | Credenciales | public_key+access_token | WebhookController | DefaultConnector |
| PedidosYa | Credenciales | client_id+secret+vendor_id | PedidosYaOrderController | PedidosYaConnector |
| Stripe | OAuth redirect | Stripe Connect | StripeController | (propio, no usa connector) |
| Tienda Nube | OAuth redirect | OAuth 2.0 | TiendaNubeController | (propio, no usa connector) |

### 6. Patrón probado: Pago automático con polling (QR MP)

El flujo que funciona para pagos en tiempo real sin depender de Pusher:

1. **Backend**: crea orden en MP API (`PUT /instore/qr/seller/collectors/{userId}/pos/{posId}/orders`)
2. **Backend**: endpoint de polling (`GET /mp-point/check-payment-by-ref?external_reference=X`) busca pagos aprobados en MP
3. **Frontend**: `WaitByPaymentMp.vue` pollea cada 3s hasta encontrar pago aprobado
4. **Cuando detecta pago**: setea `paymentData` → muestra éxito con countdown 5s → auto-cierra → `paymentSuccess` en BillingPage
5. **BillingPage.paymentSuccess()**: setea referencia → cierra `dialogPayment` → `saveWithoutPrint()` → venta guardada

**Claves:**
- Flag `closed` para evitar doble cierre
- `stopPolling()` al cerrar
- `autoCloseInterval` con countdown visible en botón
- BillingPage cierra modal Y guarda venta automáticamente
- NO depende de Pusher/WebSocket — polling puro contra API de MP
