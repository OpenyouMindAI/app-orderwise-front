# QBITS Help Center + Microtutoriales — Plan de Proyecto
> Arquitectura completa, guiones y plan de implementación

**Preparado por:** Nimbo (AI Arquitecto de Producto)  
**Fecha:** 2026-03-29  
**Versión:** 1.0  

---

## ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura del Help Center](#2-arquitectura-del-help-center)
3. [Diseño UX Propuesto](#3-diseño-ux-propuesto)
4. [Lista Completa de Microtutoriales](#4-lista-completa-de-microtutoriales)
5. [Guiones de los Primeros 10 Microtutoriales](#5-guiones-de-los-primeros-10-microtutoriales)
6. [Plan de Implementación Frontend](#6-plan-de-implementación-frontend)

---

## 1. RESUMEN EJECUTIVO

### ¿Qué es QBITS (Orderwise)?

QBITS es un sistema de gestión empresarial completo (ERP + POS) desarrollado con Vue 3 + Quasar Framework. Cuenta con **89 páginas** organizadas en los siguientes grandes módulos:

| Módulo | Páginas | Descripción |
|--------|---------|-------------|
| Punto de Venta | BillingPage, PointOfSalePage, InvoiceDetailsPage | Vender, cobrar, emitir facturas |
| Inventario | ProductPage, CategoryPage, InventoryCountPage, TransferProductPage, ProductKardexPage, ProductSalesPage, DepositManagementPage | Gestión completa de stock |
| Compras | PurchasePage, NewPurchasePage, AccountsPayablePage | Registrar compras a proveedores |
| Clientes | ClientPage, AccountsReceivablePage | Gestión de clientes y cobranzas |
| Restaurante / Mesas | TableControlPage, LivingRoomPage, CommandPage, CommandOrderPage, MenuPage | Para gastronómicos |
| Delivery | 8 páginas (rutas, repartidores, monitoreo) | Sistema completo de entregas |
| Finanzas / Caja | CashboxPage, FinanceCashboxPage, BoxReportPage, ReportWithdrawalsPage | Control de caja y finanzas |
| Reportes | SalesInventoryReportPage, ProductSalesPage, DashboardPage | Análisis y métricas |
| Producción | ProductionOrderPage | Órdenes de producción / recetas |
| Configuración | 10+ páginas | Empresa, sucursales, impresoras, integraciones |
| Usuarios | UserPage, RolePage, SellerPage, ProfilePage | Gestión de accesos |
| Suscripciones | 5 páginas | Planes y pagos |
| Soporte | SupportChatPage, AiChatPage, TutorialPage | Ayuda al usuario |
| Administración | AdminDashboard, LogPage, SessionMonitorPage | Panel QBITS interno |

### Objetivos del Proyecto

**Help Center:**
- Crear un centro de ayuda estilo Facebook Help integrado en la app
- Accesible desde: **avatar del usuario → "Ayuda y Soporte Técnico"**
- Filosofía: **"hecho para abuelos"** — lenguaje simple, pasos numerados, sin jerga técnica
- Útil también como **base de conocimiento para el bot de soporte IA futuro**

**Microtutoriales:**
- Un video corto (≤ 2.5 min) por cada funcionalidad importante
- Versión MOBILE y DESKTOP por separado
- Formato consistente con los 15 tutoriales existentes
- Total proyectado: **~55 microtutoriales** (30 mobile + 25 desktop)

---

## 2. ARQUITECTURA DEL HELP CENTER

### Estructura General

```
Ayuda y Soporte Técnico
├── 🔍 Buscador de artículos (barra principal)
├── 📌 Artículos destacados (los más vistos)
│
├── 📱 PRIMEROS PASOS
│   ├── Cómo instalar QBITS en tu celular
│   ├── Cómo crear tu cuenta
│   ├── Cómo registrar tu empresa
│   ├── Cómo configurar tu primera sucursal
│   └── Recorrido rápido por la app
│
├── 🛒 PUNTO DE VENTA
│   ├── Cómo abrir la caja para vender
│   ├── Cómo seleccionar o agregar un cliente
│   ├── Cómo agregar productos a la venta
│   ├── Cómo ajustar cantidad y precio
│   ├── Cómo eliminar un producto de la venta
│   ├── Cómo cobrar y seleccionar métodos de pago
│   ├── Cómo aplicar un descuento
│   ├── Cómo asignar una mesa a la venta
│   ├── Cómo ver el historial de ventas
│   └── Cómo reimprimir o reenviar una factura
│
├── 📦 INVENTARIO
│   ├── Cómo agregar un producto nuevo
│   ├── Cómo agregar una receta o materia prima
│   ├── Cómo crear categorías de productos
│   ├── Cómo ajustar el stock manualmente
│   ├── Cómo hacer un conteo de inventario
│   ├── Cómo transferir productos entre sucursales
│   ├── Cómo ver los movimientos de un producto (Kardex)
│   └── Cómo gestionar depósitos y almacenes
│
├── 🧾 COMPRAS Y PROVEEDORES
│   ├── Cómo registrar una compra
│   ├── Cómo agregar un proveedor
│   ├── Cómo ver las cuentas por pagar
│   └── Cómo registrar un pago a proveedor
│
├── 👥 CLIENTES
│   ├── Cómo agregar un cliente nuevo
│   ├── Cómo importar clientes desde Excel
│   ├── Cómo ver las cuentas por cobrar
│   └── Cómo registrar un cobro a cliente
│
├── 💰 CAJA Y FINANZAS
│   ├── Cómo configurar tus cajas
│   ├── Cómo hacer entradas y salidas de dinero
│   ├── Cómo cerrar la caja (arqueo)
│   ├── Cómo ver el reporte de caja
│   └── Cómo comparar ventas vs arqueos
│
├── 📊 REPORTES Y ANÁLISIS
│   ├── Cómo ver el dashboard de ventas
│   ├── Cómo filtrar ventas por fecha o vendedor
│   ├── Cómo exportar reportes a Excel o PDF
│   └── Cómo ver los productos más vendidos
│
├── 🍽️ RESTAURANTE Y MESAS
│   ├── Cómo diseñar las mesas de tu local
│   ├── Cómo asignar pedidos a una mesa
│   ├── Cómo usar el tablero de comandas
│   ├── Cómo tomar pedidos desde el menú digital
│   └── Cómo gestionar salas y sectores
│
├── 🚚 DELIVERY Y ENTREGAS
│   ├── Cómo crear una ruta de entrega
│   ├── Cómo asignar un repartidor
│   ├── Cómo iniciar una ruta activa
│   ├── Cómo hacer seguimiento en tiempo real
│   └── Cómo registrar una entrega completada
│
├── ⚙️ CONFIGURACIÓN DE LA EMPRESA
│   ├── Cómo configurar los datos de tu empresa
│   ├── Cómo agregar o editar sucursales
│   ├── Cómo configurar métodos de pago
│   ├── Cómo configurar impuestos
│   ├── Cómo conectar una impresora
│   ├── Cómo configurar el menú digital / catálogo
│   └── Cómo conectar integraciones externas
│
├── 👤 USUARIOS Y ACCESOS
│   ├── Cómo agregar un usuario (empleado)
│   ├── Cómo crear roles y permisos
│   ├── Cómo agregar vendedores
│   ├── Cómo cambiar de empresa
│   └── Cómo editar tu perfil
│
├── 💳 SUSCRIPCIÓN Y PLANES
│   ├── Qué incluye cada plan
│   ├── Cómo contratar o cambiar de plan
│   └── Problemas con el pago
│
└── 🆘 CONTACTO Y SOPORTE
    ├── Cómo contactar al soporte en vivo
    ├── Cómo usar el asistente IA de QBITS
    └── Preguntas frecuentes (FAQ)
```

---

### CATEGORÍAS DETALLADAS CON ARTÍCULOS

---

#### 📱 PRIMEROS PASOS

| ID | Artículo | Tags |
|----|----------|------|
| PS-01 | Cómo instalar QBITS en Android | instalación, android, app |
| PS-02 | Cómo instalar QBITS en iPhone (iOS) | instalación, ios, iphone |
| PS-03 | Cómo acceder desde la web (navegador) | web, pc, desktop |
| PS-04 | Cómo crear tu cuenta desde cero | registro, cuenta, nuevo |
| PS-05 | Cómo recuperar tu contraseña olvidada | contraseña, acceso, login |
| PS-06 | Cómo registrar los datos de tu empresa | empresa, configuración, inicio |
| PS-07 | Cómo configurar tu primera sucursal | sucursal, primera vez |
| PS-08 | Recorrido rápido: qué encontrarás en cada sección | tour, guía, módulos |
| PS-09 | Cómo cambiar entre empresas si tenés más de una | empresa, cambiar, multi-empresa |

---

#### 🛒 PUNTO DE VENTA

| ID | Artículo | Links internos |
|----|----------|----------------|
| PV-01 | Cómo abrir la caja para empezar a vender | → CF-01 (Configurar cajas) |
| PV-02 | Cómo buscar y seleccionar un cliente en la venta | → CL-01 (Agregar cliente) |
| PV-03 | Cómo agregar productos a la venta | → IN-01 (Agregar producto) |
| PV-04 | Cómo cambiar la cantidad de un producto | — |
| PV-05 | Cómo cambiar el precio de un artículo en la venta | — |
| PV-06 | Cómo eliminar un producto de la venta | — |
| PV-07 | Cómo cobrar: efectivo, tarjeta, transferencia | → CF-02 (Métodos de pago) |
| PV-08 | Cómo dividir el cobro entre varios métodos de pago | → PV-07 |
| PV-09 | Cómo aplicar un descuento a la venta | → PV-10 (Promociones) |
| PV-10 | Cómo usar promociones y ofertas | → IN-08 (Crear promoción) |
| PV-11 | Cómo asignar una mesa a la venta | → RE-01 (Mesas) |
| PV-12 | Cómo imprimir o enviar el comprobante | → CF-06 (Impresoras) |
| PV-13 | Cómo ver la lista de todas las ventas (facturas) | → PV-14 |
| PV-14 | Cómo buscar y filtrar facturas por fecha | — |
| PV-15 | Cómo ver el detalle de una venta anterior | — |

---

#### 📦 INVENTARIO

| ID | Artículo | Links internos |
|----|----------|----------------|
| IN-01 | Cómo agregar un producto nuevo | → IN-02 (Categorías) |
| IN-02 | Cómo crear categorías de productos | — |
| IN-03 | Cómo agregar una receta (producto con ingredientes) | → IN-01 |
| IN-04 | Cómo editar un producto existente | → IN-01 |
| IN-05 | Cómo eliminar o desactivar un producto | — |
| IN-06 | Cómo ajustar el stock de un producto (entrada/salida manual) | — |
| IN-07 | Cómo hacer un conteo de inventario | — |
| IN-08 | Cómo transferir productos entre sucursales | — |
| IN-09 | Cómo ver los movimientos de un producto (Kardex) | — |
| IN-10 | Cómo configurar el stock mínimo para alertas | — |
| IN-11 | Cómo gestionar depósitos y almacenes | — |
| IN-12 | Cómo crear y gestionar promociones | → PV-10 |
| IN-13 | Cómo configurar unidades de medida | — |

---

#### 🧾 COMPRAS Y PROVEEDORES

| ID | Artículo | Links internos |
|----|----------|----------------|
| CO-01 | Cómo agregar un proveedor | — |
| CO-02 | Cómo registrar una compra nueva | → CO-01 |
| CO-03 | Cómo buscar y editar una compra registrada | — |
| CO-04 | Cómo ver las cuentas por pagar | → CO-05 |
| CO-05 | Cómo registrar el pago de una deuda al proveedor | — |
| CO-06 | Cómo exportar el listado de compras a Excel | — |

---

#### 👥 CLIENTES

| ID | Artículo | Links internos |
|----|----------|----------------|
| CL-01 | Cómo agregar un cliente nuevo | — |
| CL-02 | Cómo editar los datos de un cliente | — |
| CL-03 | Cómo importar clientes desde un archivo Excel | — |
| CL-04 | Cómo exportar la lista de clientes | — |
| CL-05 | Cómo ver las cuentas por cobrar | → CL-06 |
| CL-06 | Cómo registrar un cobro a un cliente con deuda | — |
| CL-07 | Cómo ver el historial de compras de un cliente | — |

---

#### 💰 CAJA Y FINANZAS

| ID | Artículo | Links internos |
|----|----------|----------------|
| CF-01 | Cómo configurar una caja registradora | — |
| CF-02 | Cómo configurar métodos de pago | — |
| CF-03 | Cómo hacer una entrada de dinero a la caja | — |
| CF-04 | Cómo registrar una salida de dinero (gasto) | — |
| CF-05 | Cómo cerrar la caja y hacer el arqueo | — |
| CF-06 | Cómo ver el reporte de caja del día | — |
| CF-07 | Cómo comparar ventas con los arqueos | — |
| CF-08 | Cómo gestionar múltiples cajas | — |
| CF-09 | Cómo ver el historial de pagos por método | — |

---

#### 📊 REPORTES Y ANÁLISIS

| ID | Artículo | Links internos |
|----|----------|----------------|
| RE-01 | Cómo ver el dashboard de ventas | — |
| RE-02 | Cómo filtrar el dashboard por vendedor o fecha | — |
| RE-03 | Cómo ver qué productos se venden más | — |
| RE-04 | Cómo exportar reportes a Excel | — |
| RE-05 | Cómo exportar reportes a PDF | — |
| RE-06 | Cómo ver el análisis de ventas por producto | — |

---

#### 🍽️ RESTAURANTE Y MESAS

| ID | Artículo | Links internos |
|----|----------|----------------|
| RS-01 | Cómo diseñar las mesas de tu local | — |
| RS-02 | Cómo crear salas o sectores (ej: salón, terraza) | — |
| RS-03 | Cómo asignar pedidos a una mesa | → PV-11 |
| RS-04 | Cómo transferir un pedido a otra mesa | — |
| RS-05 | Cómo usar el tablero de comandas (Kanban) | — |
| RS-06 | Cómo tomar pedidos desde el menú digital (QR) | — |
| RS-07 | Cómo ver y gestionar las órdenes activas | — |

---

#### 🚚 DELIVERY

| ID | Artículo | Links internos |
|----|----------|----------------|
| DL-01 | Cómo agregar repartidores | — |
| DL-02 | Cómo crear una ruta de entrega | → DL-01 |
| DL-03 | Cómo asignar facturas a una ruta | — |
| DL-04 | Cómo iniciar y navegar una ruta activa | — |
| DL-05 | Cómo registrar una entrega completada | — |
| DL-06 | Cómo monitorear repartidores en tiempo real | — |
| DL-07 | Cómo ver el historial de entregas | — |

---

#### ⚙️ CONFIGURACIÓN

| ID | Artículo | Links internos |
|----|----------|----------------|
| CF-10 | Cómo editar los datos de tu empresa | — |
| CF-11 | Cómo agregar una sucursal nueva | — |
| CF-12 | Cómo configurar los impuestos | — |
| CF-13 | Cómo conectar una impresora térmica | — |
| CF-14 | Cómo configurar el menú digital / catálogo público | — |
| CF-15 | Cómo conectar integraciones externas | — |
| CF-16 | Cómo configurar tasas de cambio y monedas | — |

---

#### 👤 USUARIOS Y ACCESOS

| ID | Artículo | Links internos |
|----|----------|----------------|
| UA-01 | Cómo agregar un empleado o usuario | → UA-02 |
| UA-02 | Cómo crear roles con permisos personalizados | — |
| UA-03 | Cómo registrar vendedores | — |
| UA-04 | Cómo editar tu perfil y cambiar tu foto | — |
| UA-05 | Cómo cambiar de empresa en la misma sesión | — |

---

#### 💳 SUSCRIPCIÓN

| ID | Artículo | Links internos |
|----|----------|----------------|
| SU-01 | Qué incluye cada plan (Free, Básico, Premium) | — |
| SU-02 | Cómo contratar o actualizar tu plan | — |
| SU-03 | Cómo cancelar tu suscripción | — |
| SU-04 | Qué hacer si tu pago fue rechazado | → SU-02 |
| SU-05 | Límites de sucursales y depósitos por plan | → SU-01 |

---

#### 🆘 SOPORTE

| ID | Artículo | Links internos |
|----|----------|----------------|
| SO-01 | Cómo abrir un ticket de soporte | — |
| SO-02 | Cómo usar el asistente IA de QBITS | — |
| SO-03 | Preguntas frecuentes (FAQ) | — |
| SO-04 | Cómo reportar un error o problema técnico | → SO-01 |

---

**TOTAL DE ARTÍCULOS PLANIFICADOS: 98 artículos**

---

## 3. DISEÑO UX PROPUESTO

### Filosofía de diseño

**Principio rector: "El Help Center que una abuela pueda usar sin ayuda"**

- Texto grande, claro, sin tecnicismos
- Pasos numerados con imágenes/capturas
- Colores de la marca QBITS (primario = indigo/azul)
- Sin sidebars complicados — navegación breadcrumb simple
- Búsqueda inteligente como primera acción

---

### Flujo de navegación

```
[Avatar usuario] → menú desplegable
                    └── "Ayuda y Soporte Técnico"
                         └── HelpCenterPage (ruta: /help)
                              ├── Buscador principal (hero)
                              ├── Tarjetas de categorías (grid 2x cols)
                              ├── Artículos destacados
                              └── [Click en categoría]
                                   └── HelpCategoryPage (/help/:category)
                                        ├── Listado de artículos
                                        └── [Click en artículo]
                                             └── HelpArticlePage (/help/:category/:article)
                                                  ├── Título + subtítulo
                                                  ├── Pasos numerados
                                                  ├── Links azules internos
                                                  ├── "¿Fue útil este artículo?" (👍 👎)
                                                  └── Artículos relacionados
```

---

### Wireframe conceptual — Página principal del Help Center

```
┌─────────────────────────────────────────────────────┐
│  ← Volver                        [x] Cerrar ayuda  │
│                                                     │
│         ¿En qué podemos ayudarte?                   │
│   ┌──────────────────────────────────────────┐      │
│   │ 🔍  Buscar artículos...                  │      │
│   └──────────────────────────────────────────┘      │
│                                                     │
│   CATEGORÍAS PRINCIPALES                            │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│   │ 📱       │ │ 🛒       │ │ 📦       │           │
│   │ Primeros │ │ Punto de │ │Inventario│           │
│   │  Pasos   │ │  Venta   │ │          │           │
│   └──────────┘ └──────────┘ └──────────┘           │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│   │ 💰       │ │ 📊       │ │ ⚙️       │           │
│   │  Caja y  │ │Reportes  │ │ Config.  │           │
│   │ Finanzas │ │          │ │          │           │
│   └──────────┘ └──────────┘ └──────────┘           │
│                                                     │
│   ARTÍCULOS MÁS VISTOS                              │
│   • Cómo abrir la caja para vender          →      │
│   • Cómo agregar un producto nuevo           →      │
│   • Cómo cobrar con múltiples métodos        →      │
│                                                     │
│   ¿Necesitás hablar con alguien?                   │
│   [💬 Abrir chat de soporte]                        │
└─────────────────────────────────────────────────────┘
```

---

### Wireframe conceptual — Artículo de ayuda

```
┌─────────────────────────────────────────────────────┐
│  ← Inicio > Punto de Venta                         │
│                                                     │
│  🛒 Cómo cobrar y seleccionar métodos de pago       │
│     Último paso para completar una venta            │
│                                                     │
│  ┌─ VIDEO TUTORIAL (thumbnail) ──────────────────┐  │
│  │  ▶ Ver tutorial (1:30 min)                    │  │
│  └────────────────────────────────────────────────┘  │
│                                                     │
│  PASOS                                              │
│  ① Terminá de agregar todos los productos           │
│     Asegurate de que la lista de productos          │
│     esté completa antes de cobrar.                  │
│                                                     │
│  ② Tocá el botón "Cobrar" (color verde)             │
│     Aparece en la parte inferior de la pantalla.    │
│                                                     │
│  ③ Elegí el método de pago                          │
│     Podés elegir: Efectivo, Tarjeta, o ambos.       │
│     👉 Si querés dividir el pago, mirá →           │
│        [Cómo dividir el cobro entre varios métodos] │
│                                                     │
│  ④ Confirmá el monto y tocá "Confirmar"             │
│                                                     │
│  ─────────────────────────────────────────────     │
│  ¿Este artículo te fue útil?  👍 Sí   👎 No         │
│                                                     │
│  ARTÍCULOS RELACIONADOS                             │
│  • Cómo agregar productos a la venta               │
│  • Cómo ver el historial de ventas                 │
└─────────────────────────────────────────────────────┘
```

---

### Especificaciones visuales

| Elemento | Especificación |
|----------|----------------|
| Fuente artículos | 16-18px, inter/system-ui, alto contraste |
| Numeración de pasos | Círculos numerados (color primario), bold |
| Links internos | Color `primary` (#5C6BC0 aprox), subrayado solo en hover |
| Íconos de categoría | Material Icons, 32px, color primario |
| Tarjetas de categoría | q-card, 8-12px radius, shadow-2, hover lift |
| Botón feedback | q-btn flat, emojis 👍 👎 |
| Buscador | q-input filled, 48px altura, ícono lupa |
| Breadcrumbs | q-breadcrumbs, separador "›" |
| Video thumbnail | q-img + botón play superpuesto |

---

### Comportamiento responsive

**Mobile (< 600px):**
- Categorías: 2 columnas
- Artículos: una columna, pasos apilados
- Buscador: full-width

**Desktop (> 960px):**
- Categorías: 4-6 columnas
- Artículos: max-width 720px, centrado
- Sidebar opcional con "En esta página" (anchor links)

---

## 4. LISTA COMPLETA DE MICROTUTORIALES

### CRITERIOS DE DURACIÓN
- **Nivel básico (1 acción):** 45–90 seg
- **Nivel medio (2-3 pasos clave):** 90–120 seg  
- **Nivel complejo (flujo completo):** 120–150 seg
- **Máximo absoluto:** 2:30 min

---

### BLOQUE 1 — PRIMEROS PASOS

| # | Título | Duración | Mobile | Desktop |
|---|--------|----------|--------|---------|
| MT-01 | Cómo instalar QBITS en tu celular | 1:00 | ✅ | — |
| MT-02 | Cómo crear tu cuenta en QBITS | 1:15 | ✅ | ✅ |
| MT-03 | Cómo recuperar tu contraseña | 1:00 | ✅ | ✅ |
| MT-04 | Cómo registrar tu empresa en QBITS | 1:30 | ✅ | ✅ |
| MT-05 | Cómo configurar tu primera sucursal | 1:15 | ✅ | ✅ |

---

### BLOQUE 2 — PUNTO DE VENTA

| # | Título | Duración | Mobile | Desktop |
|---|--------|----------|--------|---------|
| MT-06 | Cómo abrir la caja para vender | 1:00 | ✅ | ✅ |
| MT-07 | Cómo seleccionar o agregar un cliente en la venta | 1:00 | ✅ | ✅ |
| MT-08 | Cómo agregar productos a la venta | 1:15 | ✅ | ✅ |
| MT-09 | Cómo ajustar cantidad y precio de un artículo | 1:00 | ✅ | ✅ |
| MT-10 | Cómo eliminar un producto de la venta | 0:45 | ✅ | ✅ |
| MT-11 | Cómo cobrar y seleccionar métodos de pago | 1:30 | ✅ | ✅ |
| MT-12 | Cómo dividir el cobro entre varios métodos | 1:15 | ✅ | ✅ |
| MT-13 | Cómo asignar una mesa a tu venta | 1:00 | ✅ | ✅ |
| MT-14 | Cómo ver y filtrar la lista de facturas | 1:15 | ✅ | ✅ |
| MT-15 | Cómo reimprimir un comprobante | 0:45 | ✅ | ✅ |

---

### BLOQUE 3 — INVENTARIO

| # | Título | Duración | Mobile | Desktop |
|---|--------|----------|--------|---------|
| MT-16 | Cómo agregar un producto nuevo | 1:30 | ✅ | ✅ |
| MT-17 | Cómo agregar productos con receta (materia prima) | 2:00 | ✅ | ✅ |
| MT-18 | Cómo crear categorías de productos | 1:00 | ✅ | ✅ |
| MT-19 | Cómo ajustar el stock de un producto | 1:00 | ✅ | ✅ |
| MT-20 | Cómo hacer un conteo de inventario | 2:00 | ✅ | ✅ |
| MT-21 | Cómo transferir productos entre sucursales | 1:30 | ✅ | ✅ |
| MT-22 | Cómo ver los movimientos de un producto (Kardex) | 1:15 | — | ✅ |
| MT-23 | Cómo crear una promoción o descuento | 1:15 | ✅ | ✅ |

---

### BLOQUE 4 — COMPRAS Y PROVEEDORES

| # | Título | Duración | Mobile | Desktop |
|---|--------|----------|--------|---------|
| MT-24 | Cómo registrar una compra nueva | 2:00 | ✅ | ✅ |
| MT-25 | Cómo agregar un proveedor | 1:00 | ✅ | ✅ |
| MT-26 | Cómo ver y gestionar las cuentas por pagar | 1:15 | — | ✅ |

---

### BLOQUE 5 — CLIENTES

| # | Título | Duración | Mobile | Desktop |
|---|--------|----------|--------|---------|
| MT-27 | Cómo agregar un cliente nuevo | 1:00 | ✅ | ✅ |
| MT-28 | Cómo importar clientes desde Excel | 1:30 | — | ✅ |
| MT-29 | Cómo ver las cuentas por cobrar | 1:15 | — | ✅ |

---

### BLOQUE 6 — CAJA Y FINANZAS

| # | Título | Duración | Mobile | Desktop |
|---|--------|----------|--------|---------|
| MT-30 | Cómo hacer entradas y salidas de dinero | 1:00 | ✅ | ✅ |
| MT-31 | Cómo cerrar la caja y hacer el arqueo | 1:30 | ✅ | ✅ |
| MT-32 | Cómo ver el reporte de caja | 1:15 | ✅ | ✅ |

---

### BLOQUE 7 — REPORTES

| # | Título | Duración | Mobile | Desktop |
|---|--------|----------|--------|---------|
| MT-33 | Cómo usar el dashboard de ventas | 1:30 | — | ✅ |
| MT-34 | Cómo exportar reportes a Excel y PDF | 1:00 | — | ✅ |

---

### BLOQUE 8 — RESTAURANTE

| # | Título | Duración | Mobile | Desktop |
|---|--------|----------|--------|---------|
| MT-35 | Cómo diseñar las mesas de tu local | 2:00 | — | ✅ |
| MT-36 | Cómo tomar pedidos y usar el tablero de comandas | 2:00 | ✅ | ✅ |
| MT-37 | Cómo usar el menú digital (QR para clientes) | 1:30 | ✅ | — |

---

### BLOQUE 9 — DELIVERY

| # | Título | Duración | Mobile | Desktop |
|---|--------|----------|--------|---------|
| MT-38 | Cómo agregar repartidores al sistema | 1:00 | — | ✅ |
| MT-39 | Cómo crear y asignar una ruta de entrega | 2:00 | — | ✅ |
| MT-40 | Cómo iniciar y navegar una ruta de entrega | 2:00 | ✅ | — |
| MT-41 | Cómo monitorear entregas en tiempo real | 1:30 | — | ✅ |

---

### BLOQUE 10 — CONFIGURACIÓN

| # | Título | Duración | Mobile | Desktop |
|---|--------|----------|--------|---------|
| MT-42 | Cómo configurar los datos de tu empresa | 1:30 | ✅ | ✅ |
| MT-43 | Cómo conectar una impresora térmica | 2:00 | ✅ | ✅ |
| MT-44 | Cómo configurar el catálogo público (menú digital) | 2:00 | — | ✅ |

---

### BLOQUE 11 — USUARIOS

| # | Título | Duración | Mobile | Desktop |
|---|--------|----------|--------|---------|
| MT-45 | Cómo agregar empleados y asignarles roles | 1:30 | — | ✅ |
| MT-46 | Cómo cambiar de empresa en la misma cuenta | 1:00 | ✅ | ✅ |

---

**TOTAL MICROTUTORIALES: 46 títulos → ~80 videos (mobile + desktop)**

---

## 5. GUIONES DE LOS PRIMEROS 10 MICROTUTORIALES

> **Formato de guión:**
> - **[ESCENA]** = qué se muestra en pantalla
> - **[VOZ]** = narración en off
> - **[TEXTO]** = texto superpuesto (caption/lower third)
> - **[CTA]** = call to action al final

---

### MT-06 — Cómo abrir la caja para vender

**Duración objetivo:** 1:00 min  
**Versiones:** Mobile ✅ | Desktop ✅

---

#### VERSIÓN MOBILE

```
[ESCENA] Pantalla de inicio de QBITS en celular. Se ve el dashboard (HomePage) 
         con el saludo y los módulos.
[VOZ]    "Para empezar a vender, primero tenés que abrir tu caja."

[ESCENA] Dedo toca el módulo "Facturación" o "Punto de Venta" en el menú.
[VOZ]    "Tocá 'Facturación' en el menú principal."

[ESCENA] Aparece un diálogo "Abrir caja". Se ve el campo de monto inicial.
[VOZ]    "Va a aparecer una ventana para abrir la caja."
[TEXTO]  "💡 Ingresá el dinero que tenés en la caja al inicio del día"

[ESCENA] Mano escribe "1000" en el campo de monto inicial. 
[VOZ]    "Escribí el monto con el que empezás el día."

[ESCENA] Dedo toca el botón "Abrir caja" (verde/primary).
[VOZ]    "Y tocá 'Abrir caja'."

[ESCENA] Aparece la pantalla de facturación lista para usar.
[VOZ]    "¡Listo! Ya podés empezar a vender."
[TEXTO]  "✅ Caja abierta correctamente"

[CTA]    "En el próximo video: Cómo agregar productos a la venta"
         [Miniatura del siguiente video]
```

---

#### VERSIÓN DESKTOP

```
[ESCENA] Navegador con QBITS abierto. Se ve el menú lateral izquierdo.
[VOZ]    "Para empezar a vender, primero tenés que abrir tu caja."

[ESCENA] Cursor va al menú lateral → "Facturación".
[VOZ]    "En el menú de la izquierda, hacé clic en 'Facturación'."

[ESCENA] Aparece el diálogo de apertura de caja con el campo de monto.
[VOZ]    "Si la caja está cerrada, aparece esta ventana automáticamente."
[TEXTO]  "💡 Esto registra cuánto dinero empezás con en la caja"

[ESCENA] Cursor escribe "1000" en el campo de monto inicial.
[VOZ]    "Escribí el monto inicial y hacé clic en 'Abrir caja'."

[ESCENA] Click en botón "Abrir caja". La pantalla de facturación aparece completa.
[VOZ]    "Ya estás listo para vender."
[TEXTO]  "✅ Caja abierta. ¡A vender!"

[CTA]    "Siguiente: Cómo agregar productos a la venta"
```

---

### MT-07 — Cómo seleccionar o agregar un cliente en la venta

**Duración objetivo:** 1:00 min  
**Versiones:** Mobile ✅ | Desktop ✅

---

#### VERSIÓN MOBILE

```
[ESCENA] Pantalla de facturación abierta (BillingPage), lista para vender.
[VOZ]    "Antes de agregar productos, podés asociar la venta a un cliente."

[ESCENA] Se muestra el campo "Cliente" en la parte superior (un select con búsqueda).
[VOZ]    "Tocá el campo 'Cliente' para buscar."

[ESCENA] Dedo toca el campo. Aparece teclado. Se escribe "Juan".
[VOZ]    "Escribí el nombre o número de documento del cliente."

[ESCENA] Aparece la lista filtrada con resultados. Se toca "Juan García".
[VOZ]    "Tocá el nombre para seleccionarlo."
[TEXTO]  "✅ Cliente seleccionado"

--- (ALTERNATIVA: cliente no existe) ---

[ESCENA] Se muestra el botón "+" (add_circle) al lado del campo cliente.
[VOZ]    "Si el cliente no existe, tocá el botón '+' para agregarlo al instante."

[ESCENA] Aparece un formulario rápido con nombre y documento. Se llena y se guarda.
[VOZ]    "Completá el nombre, guardá, y el cliente queda asignado a la venta."
[TEXTO]  "💡 También podés vender sin asociar un cliente — es opcional"

[CTA]    "Siguiente: Cómo agregar productos a la venta"
```

---

#### VERSIÓN DESKTOP

```
[ESCENA] BillingPage en desktop. Se ve el panel izquierdo con selects.
[VOZ]    "Podés asociar la venta a un cliente registrado."

[ESCENA] Cursor va al campo "Cliente". Se escribe "María".
[VOZ]    "Escribí el nombre o documento en el campo 'Cliente'."

[ESCENA] Aparece el desplegable con resultados. Click en "María López".
[VOZ]    "Hacé clic en el resultado para seleccionarlo."

[ESCENA] Se muestra el ícono "+" al lado del campo.
[VOZ]    "Para agregar un cliente nuevo sin salir de la venta, usá el '+' que está al lado."
[TEXTO]  "💡 El cliente es opcional — podés vender sin asignarlo"

[CTA]    "Siguiente: Cómo agregar productos a la venta"
```

---

### MT-08 — Cómo agregar productos a la venta

**Duración objetivo:** 1:15 min  
**Versiones:** Mobile ✅ | Desktop ✅

---

#### VERSIÓN MOBILE

```
[ESCENA] BillingPage en mobile con cliente ya seleccionado. Lista de productos vacía.
[VOZ]    "Ahora vamos a agregar los productos que el cliente quiere comprar."

[ESCENA] Se muestra un buscador de productos o botón de agregar.
[VOZ]    "Tocá el campo de búsqueda y escribí el nombre del producto."

[ESCENA] Se escribe "café". Aparecen resultados en tiempo real.
[VOZ]    "Los resultados aparecen mientras escribís."

[ESCENA] Dedo toca "Café Latte" en la lista.
[VOZ]    "Tocá el producto para agregarlo a la venta."
[TEXTO]  "✅ Producto agregado"

[ESCENA] El producto aparece en la lista de la venta con cantidad 1.
[VOZ]    "Repetí esto para agregar todos los productos del pedido."

[ESCENA] Se agrega un segundo producto "Medialunas (x3)". Lista muestra dos ítems con subtotales.
[VOZ]    "El total se actualiza automáticamente."
[TEXTO]  "💡 También podés buscar por código de barras"

[CTA]    "Siguiente: Cómo ajustar la cantidad y el precio"
```

---

#### VERSIÓN DESKTOP

```
[ESCENA] BillingPage desktop. Panel izquierdo y derecho visible. Lista de productos vacía.
[VOZ]    "Para agregar productos, usá el buscador en el panel de facturación."

[ESCENA] Cursor va al campo de búsqueda de productos. Se escribe "pan".
[VOZ]    "Escribí el nombre del producto o escaneá su código de barras."

[ESCENA] Aparecen resultados. Click en "Pan de campo".
[VOZ]    "Hacé clic para agregarlo."
[TEXTO]  "✅ Producto agregado a la venta"

[ESCENA] El panel derecho muestra el ítem agregado. Se agregan más productos.
[VOZ]    "Podés agregar todos los productos que necesites antes de cobrar."
[TEXTO]  "💡 Shortcut: escanear código de barras lo agrega automáticamente"

[CTA]    "Siguiente: Ajustar cantidad y precio"
```

---

### MT-09 — Cómo ajustar cantidad y precio de un artículo

**Duración objetivo:** 1:00 min  
**Versiones:** Mobile ✅ | Desktop ✅

---

#### VERSIÓN MOBILE

```
[ESCENA] Lista de venta con 2-3 productos. Se ve "Café Latte × 1 = $500".
[VOZ]    "¿El cliente quiere 3 cafés en vez de 1? Fácil."

[ESCENA] Dedo toca el ítem "Café Latte". Aparece un menú o pop-up con opciones 
         (cantidad, precio).
[VOZ]    "Tocá el producto para editarlo."

[ESCENA] Se toca el campo de cantidad. Teclado numérico aparece. Se escribe "3".
[VOZ]    "Cambiá la cantidad. El precio se recalcula solo."
[TEXTO]  "Café Latte × 3 = $1.500"

[ESCENA] Se muestra la opción de editar precio. Se cambia a $450.
[VOZ]    "Si necesitás ajustar el precio, tocá el campo de precio y escribí el nuevo valor."
[TEXTO]  "💡 El cambio de precio solo aplica a esta venta"

[ESCENA] Se confirma. La lista muestra el ítem actualizado.
[VOZ]    "Confirmá y listo."

[CTA]    "Siguiente: Cómo eliminar un producto"
```

---

#### VERSIÓN DESKTOP

```
[ESCENA] BillingPage desktop. Lista con productos. Se ve un ítem con cantidad 1.
[VOZ]    "Para cambiar la cantidad o el precio de un producto en la venta:"

[ESCENA] Cursor hace clic sobre el ítem. Se muestra la fila editable con inputs.
[VOZ]    "Hacé clic en el producto para editar."

[ESCENA] Click en el campo de cantidad. Se cambia de 1 a 4.
[VOZ]    "Cambiá la cantidad directamente."

[ESCENA] Click en precio. Se cambia a un precio personalizado.
[VOZ]    "O ajustá el precio si el cliente tiene un precio especial."
[TEXTO]  "💡 Los cambios se guardan al confirmar la venta"

[CTA]    "Siguiente: Cómo eliminar un producto de la venta"
```

---

### MT-10 — Cómo eliminar un producto de la venta

**Duración objetivo:** 0:45 min  
**Versiones:** Mobile ✅ | Desktop ✅

---

#### VERSIÓN MOBILE

```
[ESCENA] Lista de venta con 3 productos. Uno de ellos es incorrecto.
[VOZ]    "¿Agregaste un producto por error? Lo eliminás en dos segundos."

[ESCENA] Dedo desliza el ítem hacia la izquierda (swipe left) → aparece botón 
         "Eliminar" en rojo.
[VOZ]    "Deslizá el producto hacia la izquierda."

[ESCENA] Toca botón rojo "Eliminar". El ítem desaparece con animación.
[VOZ]    "Tocá 'Eliminar' y desaparece de la venta."
[TEXTO]  "🗑️ Producto eliminado"

[ESCENA] También se muestra la alternativa: ícono de papelera/basura en el ítem.
[VOZ]    "También podés tocar el ícono de la papelera si aparece."

[CTA]    "Siguiente: Cómo cobrar"
```

---

#### VERSIÓN DESKTOP

```
[ESCENA] BillingPage desktop. Lista de ítems.
[VOZ]    "Para eliminar un producto de la venta:"

[ESCENA] Cursor va al ítem. Aparece ícono de papelera al pasar el mouse.
[VOZ]    "Pasá el mouse sobre el producto y hacé clic en la papelera."

[ESCENA] Aparece confirmación rápida o se elimina directo.
[VOZ]    "El ítem se elimina y el total se actualiza."
[TEXTO]  "💡 Recordá: esto no afecta el inventario hasta confirmar la venta"

[CTA]    "Siguiente: Cómo cobrar y seleccionar métodos de pago"
```

---

### MT-11 — Cómo cobrar y seleccionar métodos de pago

**Duración objetivo:** 1:30 min  
**Versiones:** Mobile ✅ | Desktop ✅

---

#### VERSIÓN MOBILE

```
[ESCENA] BillingPage con productos cargados. Se ve el total abajo.
[VOZ]    "Con los productos listos, es hora de cobrar."

[ESCENA] Dedo toca botón "Cobrar" (verde, abajo de la pantalla).
[VOZ]    "Tocá el botón 'Cobrar'."

[ESCENA] Aparece la pantalla de métodos de pago.
[VOZ]    "Aparecen todos los métodos de pago configurados para tu empresa."

[ESCENA] Se selecciona "Efectivo". Aparece campo de monto. Se escribe 2000. 
         El sistema calcula el vuelto: "Cambio: $500".
[VOZ]    "Elegí 'Efectivo', escribí el monto recibido, y QBITS calcula el vuelto automáticamente."
[TEXTO]  "💰 Vuelto: $500"

[ESCENA] Alternativa: se toca "Tarjeta". Se selecciona el tipo (débito/crédito).
[VOZ]    "Si pagó con tarjeta, seleccionala y confirmá el monto."

[ESCENA] Toca botón "Confirmar cobro" (verde grande).
[VOZ]    "Tocá 'Confirmar' para finalizar la venta."

[ESCENA] Aparece pantalla de éxito con animación. Opción de imprimir/compartir.
[VOZ]    "¡Venta registrada! Podés imprimir el comprobante o enviarlo por WhatsApp."
[TEXTO]  "✅ Venta registrada exitosamente"

[CTA]    "Siguiente: Cómo ver el historial de ventas"
```

---

#### VERSIÓN DESKTOP

```
[ESCENA] BillingPage desktop con ítems cargados.
[VOZ]    "Con el pedido listo, hacemos el cobro."

[ESCENA] Cursor va a botón "Guardar" o "Cobrar". Click.
[VOZ]    "Hacé clic en 'Cobrar' para proceder al pago."

[ESCENA] Abre diálogo/panel de cobro. Se ven los métodos de pago.
[VOZ]    "Elegí el método de pago del cliente."

[ESCENA] Se selecciona "Efectivo". Se escribe el monto. El vuelto aparece calculado.
[VOZ]    "Si pagó en efectivo, escribí el monto y el sistema calcula el vuelto."
[TEXTO]  "💡 Podés combinar métodos: parte en efectivo, parte con tarjeta"

[ESCENA] Click en "Confirmar". La factura se registra.
[VOZ]    "Confirmá el cobro y la venta queda registrada con todos sus detalles."
[TEXTO]  "✅ Venta registrada"

[CTA]    "Siguiente: Cómo dividir el cobro entre varios métodos de pago"
```

---

### MT-13 — Cómo asignar una mesa a tu venta

**Duración objetivo:** 1:00 min  
**Versiones:** Mobile ✅ | Desktop ✅

---

#### VERSIÓN MOBILE

```
[ESCENA] Se muestra el módulo "Mesas" (TableControlPage). Se ven las mesas del local.
[VOZ]    "Si tenés un restaurante o bar, podés asignar mesas a cada venta."

[ESCENA] Se toca una mesa disponible (color verde/vacío).
[VOZ]    "Tocá la mesa donde está el cliente."

[ESCENA] Aparece la vista de la mesa con su estado y botón "Nueva venta" o "Agregar pedido".
[VOZ]    "Podés crear una venta nueva directamente desde la mesa."

[ESCENA] Se inicia la facturación con la mesa asignada. Se ve "Mesa 5" en el encabezado.
[VOZ]    "La mesa queda asociada a la venta durante todo el proceso."
[TEXTO]  "🍽️ Mesa 5 - Venta en curso"

[ESCENA] También se muestra la opción de asignar mesa desde BillingPage.
[VOZ]    "También podés asignar la mesa directamente desde la pantalla de facturación."

[CTA]    "Siguiente: Cómo cobrar la mesa"
```

---

#### VERSIÓN DESKTOP

```
[ESCENA] TableControlPage en desktop. Plano del local con mesas.
[VOZ]    "Desde el módulo de Mesas, gestionás el estado de cada mesa en tiempo real."

[ESCENA] Cursor sobre mesa libre (verde). Click en la mesa.
[VOZ]    "Hacé clic en la mesa para ver sus opciones."

[ESCENA] Menú con opciones: "Nueva venta", "Ver pedido", etc. Click en "Nueva venta".
[VOZ]    "Seleccioná 'Nueva venta' para empezar a tomar el pedido de esa mesa."

[ESCENA] Se abre BillingPage con "Mesa 3" pre-asignada.
[VOZ]    "La venta queda vinculada a la mesa automáticamente."
[TEXTO]  "💡 La mesa cambia de color: verde=libre, naranja=ocupada, rojo=cuenta pedida"

[CTA]    "Siguiente: Cómo usar el tablero de comandas"
```

---

### MT-14 — Cómo registrar tu empresa en QBITS

**Duración objetivo:** 1:30 min  
**Versiones:** Mobile ✅ | Desktop ✅

---

#### VERSIÓN MOBILE

```
[ESCENA] Pantalla WelcomePage o CompanyConfigPage. Primera vez en la app.
[VOZ]    "El primer paso en QBITS es registrar tu empresa. Solo toma un minuto."

[ESCENA] Se ve el formulario de configuración con campos: nombre, RUC/CUIT, dirección.
[VOZ]    "Completá el nombre de tu negocio."

[ESCENA] Se escribe "Panadería El Sol".
[VOZ]    "Luego tu número de identificación fiscal."

[ESCENA] Se llena el campo de documento/RUC. Luego la dirección.
[VOZ]    "Y tu dirección."
[TEXTO]  "💡 Estos datos aparecen en los comprobantes de venta"

[ESCENA] Se sube el logo de la empresa (botón de cámara/galería).
[VOZ]    "Si querés, agregá el logo de tu negocio."

[ESCENA] Se toca "Guardar". Aparece confirmación de empresa registrada.
[VOZ]    "Guardá y ya tenés tu empresa configurada en QBITS."
[TEXTO]  "✅ ¡Empresa registrada!"

[CTA]    "Siguiente: Cómo configurar tu primera sucursal"
```

---

#### VERSIÓN DESKTOP

```
[ESCENA] CompanyConfigPage en desktop. Formulario de configuración de empresa.
[VOZ]    "Para configurar tu empresa, ingresá a Configuración → Empresa."

[ESCENA] Se ven las secciones: Datos básicos, Configuración fiscal, Logo.
[VOZ]    "Completá los datos básicos: nombre, documento, dirección, teléfono."

[ESCENA] Se llena el formulario.
[VOZ]    "Estos datos van a aparecer en todas tus facturas y comprobantes."
[TEXTO]  "💡 Podés editar esto en cualquier momento"

[ESCENA] Se sube el logo. Preview aparece en tiempo real.
[VOZ]    "Subí el logo de tu empresa para personalizarla."

[ESCENA] Click en "Guardar configuración".
[VOZ]    "Guardá los cambios y tu empresa queda configurada."
[TEXTO]  "✅ Empresa configurada"

[CTA]    "Siguiente: Cómo agregar tu primera sucursal"
```

---

### MT-16 — Cómo agregar un producto nuevo

**Duración objetivo:** 1:30 min  
**Versiones:** Mobile ✅ | Desktop ✅

---

#### VERSIÓN MOBILE

```
[ESCENA] Pantalla ProductPage en mobile. Se ve la lista de productos.
[VOZ]    "Para agregar un producto nuevo a tu catálogo, seguí estos pasos."

[ESCENA] Dedo toca el botón "+" (add_circle, color primary, arriba a la derecha).
[VOZ]    "Tocá el botón '+' para agregar."

[ESCENA] Aparece el formulario de nuevo producto. Campos: nombre, precio, categoría, foto.
[VOZ]    "Completá el nombre del producto."

[ESCENA] Se escribe "Empanada de Carne".
[VOZ]    "El precio de venta."

[ESCENA] Se escribe "150".
[VOZ]    "Y la categoría — si no existe, podés crearla desde acá."
[TEXTO]  "💡 El código de barras es opcional"

[ESCENA] Se toca "Foto" → aparece opción de cámara o galería. Se sube foto.
[VOZ]    "Podés agregarle una foto para que aparezca en el menú."

[ESCENA] Se toca "Guardar". El producto aparece en la lista.
[VOZ]    "¡Listo! El producto ya está disponible para vender."
[TEXTO]  "✅ Producto creado"

[CTA]    "Siguiente: Cómo crear categorías de productos"
```

---

#### VERSIÓN DESKTOP

```
[ESCENA] ProductPage en desktop. Tabla de productos con barra de herramientas.
[VOZ]    "Para agregar un producto, hacé clic en el botón 'Agregar Producto'."

[ESCENA] Click en botón "Agregar Producto". Abre un diálogo/modal.
[VOZ]    "Se abre el formulario de creación."

[ESCENA] Se llena: nombre "Empanada de Carne", precio 150, categoría "Comidas".
[VOZ]    "Completá el nombre, precio, y categoría."
[TEXTO]  "💡 También podés cargar el stock inicial aquí"

[ESCENA] Se agrega foto, se configura stock inicial, código de barras.
[VOZ]    "Agregá foto, stock inicial y código de barras si usás."

[ESCENA] Click en "Guardar". El producto aparece en la tabla.
[VOZ]    "Guardá y el producto queda disponible para vender de inmediato."
[TEXTO]  "✅ Producto agregado al catálogo"

[CTA]    "Siguiente: Cómo agregar una receta con materia prima"
```

---

### MT-30 — Cómo hacer entradas y salidas de dinero

**Duración objetivo:** 1:00 min  
**Versiones:** Mobile ✅ | Desktop ✅

---

#### VERSIÓN MOBILE

```
[ESCENA] Se está en la pantalla de facturación (BillingPage) con la caja abierta.
[VOZ]    "Las entradas y salidas de dinero te permiten registrar movimientos en la caja que no son ventas."

[ESCENA] Se busca el botón de movimientos de caja. Puede ser en el menú de la caja 
         o un ícono de billetera/flecha.
[VOZ]    "Buscá el menú de caja o la opción de 'Movimientos'."

[ESCENA] Aparece un diálogo con dos opciones: "Entrada" (verde, flecha arriba) y 
         "Salida" (rojo, flecha abajo).
[VOZ]    "Podés registrar una entrada —como un adelanto de dinero— o una salida, como un gasto."

[ESCENA] Se toca "Salida". Se escribe el monto: 500. Motivo: "Compra de insumos".
[VOZ]    "Escribí el monto y el motivo del movimiento."
[TEXTO]  "💡 Esto queda registrado en el reporte de caja"

[ESCENA] Se toca "Confirmar". Aparece mensaje de éxito.
[VOZ]    "Confirmá y el movimiento queda guardado."
[TEXTO]  "✅ Movimiento registrado"

[CTA]    "Siguiente: Cómo cerrar la caja y hacer el arqueo"
```

---

#### VERSIÓN DESKTOP

```
[ESCENA] Pantalla de facturación o FinanceCashboxPage en desktop.
[VOZ]    "Para registrar entradas o salidas de dinero en la caja:"

[ESCENA] Se localiza el botón o menú "Movimientos" / "Entrada-Salida".
[VOZ]    "Buscá la opción 'Movimientos' o 'Entradas y Salidas' en el módulo de caja."

[ESCENA] Click → aparece diálogo con tipo (entrada/salida), monto, concepto.
[VOZ]    "Elegí si es una entrada o salida, escribí el monto y el concepto."
[TEXTO]  "Ej: Salida - $500 - 'Pago de servicio de limpieza'"

[ESCENA] Click "Guardar". Movimiento aparece en el historial.
[VOZ]    "El movimiento queda registrado y aparece en el reporte de caja del día."
[TEXTO]  "💡 Útil para cuadrar la caja al final del día"

[CTA]    "Siguiente: Cómo cerrar la caja (arqueo)"
```

---

## 6. PLAN DE IMPLEMENTACIÓN FRONTEND

### Archivos a crear

```
src/
├── pages/
│   ├── HelpCenterPage.vue          ← Página principal del Help Center
│   ├── HelpCategoryPage.vue        ← Listado de artículos por categoría  
│   └── HelpArticlePage.vue         ← Visualizador de artículo individual
│
├── components/
│   └── HelpCenter/
│       ├── HelpSearchBar.vue       ← Buscador principal con sugerencias
│       ├── HelpCategoryCard.vue    ← Tarjeta de categoría (ícono + título)
│       ├── HelpArticleList.vue     ← Listado de artículos de una categoría
│       ├── HelpArticleViewer.vue   ← Renderizador de artículo (markdown/JSON)
│       ├── HelpBreadcrumb.vue      ← Breadcrumb de navegación
│       ├── HelpRelatedArticles.vue ← Artículos relacionados al pie
│       └── HelpFeedback.vue        ← Botones "¿Fue útil?" 👍 👎
│
├── data/
│   └── help-center/
│       ├── categories.js           ← Definición de categorías
│       ├── articles/
│       │   ├── primeros-pasos.js
│       │   ├── punto-de-venta.js
│       │   ├── inventario.js
│       │   ├── compras.js
│       │   ├── clientes.js
│       │   ├── caja-finanzas.js
│       │   ├── reportes.js
│       │   ├── restaurante.js
│       │   ├── delivery.js
│       │   ├── configuracion.js
│       │   ├── usuarios.js
│       │   ├── suscripcion.js
│       │   └── soporte.js
│       └── index.js                ← Exporta todo + buscador
│
└── router/
    └── routes.js                   ← Agregar rutas del Help Center
```

---

### Rutas a agregar en `router/routes.js`

```javascript
// Help Center Routes
{
  path: '/help',
  component: () => import('layouts/MainLayout.vue'),
  children: [
    {
      path: '',
      name: 'HelpCenter',
      component: () => import('pages/HelpCenterPage.vue'),
      meta: { title: 'Ayuda y Soporte' }
    },
    {
      path: ':category',
      name: 'HelpCategory',
      component: () => import('pages/HelpCategoryPage.vue'),
      meta: { title: 'Centro de Ayuda' }
    },
    {
      path: ':category/:article',
      name: 'HelpArticle',
      component: () => import('pages/HelpArticlePage.vue'),
      meta: { title: 'Artículo de Ayuda' }
    }
  ]
}
```

---

### Estructura de datos de artículos

```javascript
// src/data/help-center/articles/punto-de-venta.js
export default [
  {
    id: 'PV-01',
    slug: 'como-abrir-la-caja-para-vender',
    title: 'Cómo abrir la caja para vender',
    subtitle: 'El primer paso antes de empezar a vender',
    category: 'punto-de-venta',
    tags: ['caja', 'abrir', 'vender', 'inicio'],
    views: 0,
    helpful: 0,
    notHelpful: 0,
    relatedArticles: ['CF-01', 'PV-03'],
    tutorialVideo: {
      mobile: 'https://youtu.be/xxxx_mobile',
      desktop: 'https://youtu.be/xxxx_desktop'
    },
    steps: [
      {
        number: 1,
        title: 'Ingresá a Facturación',
        content: 'Tocá el módulo "Facturación" en el menú principal.',
        image: '/help-images/pv-01-step-1.png'
      },
      {
        number: 2,
        title: 'Ingresá el monto inicial',
        content: 'Escribí el monto de dinero con el que empezás el día.',
        tip: 'Esto registra cuánto dinero tenés en la caja al inicio del turno.',
        image: '/help-images/pv-01-step-2.png'
      },
      {
        number: 3,
        title: 'Abrí la caja',
        content: 'Tocá el botón "Abrir caja". ¡Ya podés empezar a vender!',
        image: '/help-images/pv-01-step-3.png'
      }
    ]
  }
  // ... más artículos
]
```

---

### Modificaciones en archivos existentes

#### 1. Menú de usuario (avatar dropdown)

Agregar en el componente de avatar/perfil del layout:

```javascript
// En el menú desplegable del avatar (probablemente en MainLayout.vue o en un componente de navbar)
{
  label: 'Ayuda y Soporte Técnico',
  icon: 'help_outline',
  action: () => router.push({ name: 'HelpCenter' })
}
```

#### 2. Botón flotante de ayuda contextual (opcional, fase 2)

Agregar en `MainLayout.vue` un botón flotante `?` que lleve al artículo relacionado con la página actual:

```javascript
// Mapa: ruta actual → artículo de ayuda relacionado
const contextualHelp = {
  'Billing': 'PV-01',
  'Product': 'IN-01',
  'Invoice': 'PV-13',
  'Purchase': 'CO-02',
  // ...
}
```

---

### Archivos de imágenes a preparar

```
public/
└── help-images/
    ├── pv-01-step-1.png   ← Screenshot de cada paso
    ├── pv-01-step-2.png
    ├── ... (aprox 300-400 capturas de pantalla)
    └── thumbnails/
        ├── mobile/        ← Thumbnails de videos mobile
        └── desktop/       ← Thumbnails de videos desktop
```

---

### Estimación de esfuerzo de desarrollo

| Tarea | Estimación |
|-------|------------|
| Rutas y páginas base (3 pages) | 1 día |
| Componentes HelpCenter/ (7 componentes) | 2 días |
| Estructura de datos (13 archivos de artículos) | 1 día |
| Buscador con fuzzy search | 1 día |
| Integración en avatar menu | 2 horas |
| Botón contextual flotante (opcional) | 4 horas |
| **Subtotal desarrollo frontend** | **~5-6 días** |
| Redacción de 98 artículos | 3-4 días |
| Capturas de pantalla (300+ imgs) | 2-3 días |
| **TOTAL** | **~12-14 días** |

---

### Prioridad de implementación (sprints sugeridos)

**Sprint 1 — MVP funcional (semana 1):**
1. Crear páginas base (HelpCenterPage, HelpCategoryPage, HelpArticlePage)
2. Implementar categorías y 5 artículos más importantes del POS
3. Buscador básico
4. Integrar en menú de avatar

**Sprint 2 — Contenido completo (semana 2-3):**
1. Redactar los 98 artículos
2. Preparar capturas de pantalla
3. Activar links internos entre artículos
4. Botón de feedback (👍 👎)

**Sprint 3 — Microtutoriales (semana 4+):**
1. Grabar primeros 15 microtutoriales existentes (ya están → integrar)
2. Grabar 10 nuevos microtutoriales prioritarios
3. Integrar reproductores en artículos

**Sprint 4 — Inteligencia (futuro):**
1. Conectar artículos a bot de soporte IA
2. Sugerencias contextuales según página activa
3. Análisis de qué artículos faltan (basado en tickets de soporte)

---

## NOTAS FINALES PARA EL BOT DE SOPORTE IA

Cuando se implemente el bot de IA futuro, este Help Center sirve como **base de conocimiento vectorizada**. Recomendaciones:

1. **Cada artículo tiene ID único** (ej: `PV-01`) → facilita referencias del bot
2. **Steps son texto puro** → fácil de indexar en vector store
3. **Tags en cada artículo** → mejoran el retrieval semántico
4. **Links internos** → el bot puede sugerir artículos relacionados automáticamente
5. **Feedback (👍👎)** → datos de calidad para mejorar el bot con el tiempo

Estructura recomendada para embeddings:
```
[QBITS-HELP] {id} | {title} | {category}
{step 1 content} {step 2 content} ... {tags}
```

---

*Documento preparado por Nimbo — AI Arquitecto de Producto*  
*Para uso interno de QBITS / Orderwise*  
*Versión 1.0 — Marzo 2026*
