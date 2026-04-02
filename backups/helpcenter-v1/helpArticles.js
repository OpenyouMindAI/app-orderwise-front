/**
 * QBITS Help Center - Artículos de Ayuda
 * Tono: argentino natural, directo, como si le explicaras a alguien en persona.
 * Adaptado por Nimbo — 2026-03-30
 */

// ─── CATEGORÍAS ────────────────────────────────────────────────────────────────

export const helpCategories = [
  {
    id: 'primeros-pasos',
    title: 'Primeros Pasos',
    icon: 'phone_iphone',
    color: 'blue',
    description: 'Instalación, registro y configuración inicial',
    articleCount: 9
  },
  {
    id: 'punto-de-venta',
    title: 'Punto de Venta',
    icon: 'point_of_sale',
    color: 'green',
    description: 'Cómo vender, cobrar y gestionar facturas',
    articleCount: 15
  },
  {
    id: 'inventario',
    title: 'Inventario',
    icon: 'inventory_2',
    color: 'orange',
    description: 'Productos, stock, categorías y movimientos',
    articleCount: 13
  },
  {
    id: 'compras',
    title: 'Compras y Proveedores',
    icon: 'shopping_cart',
    color: 'purple',
    description: 'Registrar compras y gestionar proveedores',
    articleCount: 6
  },
  {
    id: 'clientes',
    title: 'Clientes',
    icon: 'people',
    color: 'cyan',
    description: 'Gestión de clientes y cuentas por cobrar',
    articleCount: 7
  },
  {
    id: 'caja-finanzas',
    title: 'Caja y Finanzas',
    icon: 'account_balance_wallet',
    color: 'teal',
    description: 'Control de caja, entradas, salidas y arqueos',
    articleCount: 9
  },
  {
    id: 'reportes',
    title: 'Reportes y Análisis',
    icon: 'bar_chart',
    color: 'indigo',
    description: 'Dashboard, filtros y exportación de datos',
    articleCount: 6
  },
  {
    id: 'restaurante',
    title: 'Restaurante y Mesas',
    icon: 'restaurant',
    color: 'red',
    description: 'Mesas, comandas y menú digital',
    articleCount: 7
  },
  {
    id: 'delivery',
    title: 'Delivery y Entregas',
    icon: 'delivery_dining',
    color: 'amber',
    description: 'Rutas, repartidores y seguimiento',
    articleCount: 7
  },
  {
    id: 'configuracion',
    title: 'Configuración',
    icon: 'settings',
    color: 'blue-grey',
    description: 'Empresa, sucursales, impresoras e integraciones',
    articleCount: 7
  },
  {
    id: 'usuarios',
    title: 'Usuarios y Accesos',
    icon: 'manage_accounts',
    color: 'deep-purple',
    description: 'Empleados, roles y permisos',
    articleCount: 5
  },
  {
    id: 'suscripcion',
    title: 'Suscripción y Planes',
    icon: 'workspace_premium',
    color: 'yellow',
    description: 'Planes, pagos y facturación de QBITS',
    articleCount: 5
  },
  {
    id: 'soporte',
    title: 'Contacto y Soporte',
    icon: 'support_agent',
    color: 'pink',
    description: 'Chat en vivo, tickets y preguntas frecuentes',
    articleCount: 4
  }
]

// ─── ARTÍCULOS POR CATEGORÍA ──────────────────────────────────────────────────

// ── PRIMEROS PASOS ────────────────────────────────────────────────────────────
const primeroPasosArticles = [
  {
    id: 'PS-01',
    slug: 'como-instalar-qbits-android',
    categoryId: 'primeros-pasos',
    title: 'Cómo instalar QBITS en tu celular Android',
    subtitle: 'Descargá la app en minutos desde Google Play',
    tags: ['instalación', 'android', 'app', 'descargar'],
    relatedArticles: ['PS-04', 'PS-06'],
    tutorialVideo: null,
    content: `
      <p>Solo necesitás un celular Android con internet. Nada más.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Abrí Google Play Store</strong>
          <p>Es la tienda de apps de Android. Tiene un ícono con un triángulo de colores.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Buscá "QBITS"</strong>
          <p>Escribí QBITS en la barra de búsqueda y tocá la lupa.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Tocá "Instalar"</strong>
          <p>Cuando aparezca QBITS en los resultados, tocá el botón verde <strong>Instalar</strong>.</p>
          <div class="help-tip">💡 La descarga tarda 1-2 minutos según tu conexión.</div>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Abrí QBITS cuando termine</strong>
          <p>Tocá <strong>Abrir</strong> para iniciar la app.</p>
        </div>
      </div>

      <h3>¿No encontrás la app?</h3>
      <p>Buscá <strong>qbits.app</strong> en el navegador de tu celular y descargala desde ahí.</p>
    `
  },
  {
    id: 'PS-02',
    slug: 'como-instalar-qbits-iphone',
    categoryId: 'primeros-pasos',
    title: 'Cómo instalar QBITS en tu iPhone (iOS)',
    subtitle: 'Descargá la app desde el App Store',
    tags: ['instalación', 'ios', 'iphone', 'app store'],
    relatedArticles: ['PS-04', 'PS-06'],
    tutorialVideo: null,
    content: `
      <p>Necesitás un iPhone con iOS 14 o superior y conexión a internet.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Abrí el App Store</strong>
          <p>Tiene un ícono azul con la letra "A".</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Buscá "QBITS"</strong>
          <p>Tocá la lupa abajo a la derecha y escribí <strong>QBITS</strong>.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Tocá "Obtener" y confirmá con Face ID o tu contraseña</strong>
          <div class="help-tip">💡 Es gratuita — la instalación no tiene ningún costo.</div>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Esperá que termine y abrila</strong>
          <p>Cuando veas el ícono de QBITS en tu pantalla, tocalo para empezar.</p>
        </div>
      </div>
    `
  },
  {
    id: 'PS-03',
    slug: 'como-acceder-desde-la-web',
    categoryId: 'primeros-pasos',
    title: 'Cómo acceder a QBITS desde la computadora',
    subtitle: 'Usá QBITS en cualquier navegador web, sin instalar nada',
    tags: ['web', 'pc', 'computadora', 'navegador', 'chrome'],
    relatedArticles: ['PS-04', 'PS-08'],
    tutorialVideo: null,
    content: `
      <p>QBITS anda en cualquier computadora o tablet desde el navegador. No necesitás instalar nada.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Abrí tu navegador</strong>
          <p>Chrome, Firefox, Edge o Safari. Te recomendamos Google Chrome para mejor experiencia.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Escribí la dirección en la barra del navegador</strong>
          <p>Escribí <strong>app.qbits.io</strong> y presioná Enter.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Ingresá con tu usuario y contraseña</strong>
          <div class="help-tip">💡 Guardá la página como favorito para entrar más rápido la próxima vez.</div>
        </div>
      </div>

      <p>Una vez que ingresás, tu sesión queda guardada. La próxima vez solo abrís la misma dirección.</p>
    `
  },
  {
    id: 'PS-04',
    slug: 'como-crear-tu-cuenta',
    categoryId: 'primeros-pasos',
    title: 'Cómo crear tu cuenta en QBITS desde cero',
    subtitle: 'Registro gratuito en menos de 2 minutos',
    tags: ['registro', 'cuenta', 'nuevo', 'crear'],
    relatedArticles: ['PS-06', 'PS-07'],
    tutorialVideo: null,
    content: `
      <p>Si todavía no tenés cuenta, seguí estos pasos. Es completamente gratis.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Abrí QBITS en tu celular o computadora</strong>
          <p>La primera vez vas a ver las opciones "Ingresar" y "Registrarse".</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "Registrarse"</strong>
          <p>Se abre el formulario para completar tus datos.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Completá tu nombre y correo</strong>
          <p>Usá un correo al que tengas acceso. Ahí van a llegar los comprobantes y notificaciones.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Elegí una contraseña</strong>
          <p>Mínimo 8 caracteres. Anotala en algún lado para no olvidarla.</p>
          <div class="help-tip">💡 Combiná letras y números para mayor seguridad.</div>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">5</div>
        <div class="step-content">
          <strong>Tocá "Crear cuenta" y revisá tu correo</strong>
          <p>Te mandamos un link de verificación. Abrilo para activar tu cuenta.</p>
        </div>
      </div>

      <p>Con la cuenta activa, el siguiente paso es <a href="/help/primeros-pasos/como-registrar-datos-empresa" class="help-link">registrar los datos de tu empresa</a>.</p>
    `
  },
  {
    id: 'PS-05',
    slug: 'como-recuperar-contrasena',
    categoryId: 'primeros-pasos',
    title: 'Cómo recuperar tu contraseña olvidada',
    subtitle: 'Recuperá el acceso a tu cuenta en pocos pasos',
    tags: ['contraseña', 'acceso', 'login', 'olvidé', 'recuperar'],
    relatedArticles: ['PS-04'],
    tutorialVideo: null,
    content: `
      <p>No te preocupés. Con acceso a tu correo lo resolvés en 2 minutos.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Tocá "¿Olvidaste tu contraseña?"</strong>
          <p>Está debajo del formulario de ingreso, como un link de texto.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Ingresá tu correo electrónico</strong>
          <p>El mismo con el que te registraste.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Revisá tu correo</strong>
          <p>Te mandamos un código o link para resetear la contraseña. Puede tardar unos minutos.</p>
          <div class="help-tip">💡 Si no lo ves, revisá la carpeta de spam o correo no deseado.</div>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Elegí una contraseña nueva</strong>
          <p>Una que sea fácil de recordar para vos pero difícil de adivinar. Anotala si necesitás.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">5</div>
        <div class="step-content">
          <strong>¡Listo! Ingresá con tu contraseña nueva</strong>
        </div>
      </div>
    `
  },
  {
    id: 'PS-06',
    slug: 'como-registrar-datos-empresa',
    categoryId: 'primeros-pasos',
    title: 'Cómo registrar los datos de tu empresa',
    subtitle: 'Configurá el nombre y datos fiscales de tu negocio',
    tags: ['empresa', 'configuración', 'inicio', 'datos', 'ruc', 'cuit'],
    relatedArticles: ['PS-07', 'CF-10'],
    tutorialVideo: null,
    content: `
      <p>Estos datos aparecen en todas las facturas y comprobantes. Completalos bien desde el principio.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>La primera vez que entrés, QBITS te guía solo</strong>
          <p>Al crear la cuenta, aparece el formulario de configuración. Si ya lo cerraste, andá a <strong>Configuración → Empresa</strong>.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Escribí el nombre de tu negocio</strong>
          <p>Tal como querés que aparezca en las facturas. Por ejemplo: "Panadería El Sol".</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Ingresá tu número de identificación fiscal</strong>
          <p>CUIT (Argentina), RUC (Perú/Ecuador) o RUT (Chile/Uruguay). Sin puntos ni guiones.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Ingresá la dirección de tu negocio</strong>
          <div class="help-tip">💡 Esta información aparece en el encabezado de cada factura que emitís.</div>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">5</div>
        <div class="step-content">
          <strong>Subí el logo (opcional)</strong>
          <p>Tocá el botón de cámara o galería para agregar tu logo a las facturas.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">6</div>
        <div class="step-content">
          <strong>Tocá "Guardar"</strong>
          <p>Podés editar estos datos en cualquier momento desde Configuración.</p>
        </div>
      </div>

      <p>Siguiente paso: <a href="/help/primeros-pasos/como-configurar-primera-sucursal" class="help-link">configurar tu primera sucursal</a>.</p>
    `
  },
  {
    id: 'PS-07',
    slug: 'como-configurar-primera-sucursal',
    categoryId: 'primeros-pasos',
    title: 'Cómo configurar tu primera sucursal',
    subtitle: 'Creá el local desde donde vas a operar',
    tags: ['sucursal', 'primera vez', 'local', 'punto de venta'],
    relatedArticles: ['PS-06', 'CF-11'],
    tutorialVideo: null,
    content: `
      <p>Una sucursal es cada local o punto de venta. Si tenés una sola tienda, creás una sola. Si tenés varias, una por cada local.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Configuración → Sucursales</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "+" para crear una nueva</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Poné un nombre para identificarla</strong>
          <p>Por ejemplo: "Local Principal" o "Sucursal Centro".</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Completá la dirección y teléfono</strong>
          <div class="help-tip">💡 Si solo tenés un local, podés copiar los datos que pusiste en la configuración de empresa.</div>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">5</div>
        <div class="step-content">
          <strong>Guardá</strong>
          <p>¡Listo para vender!</p>
        </div>
      </div>
    `
  },
  {
    id: 'PS-08',
    slug: 'recorrido-rapido-app',
    categoryId: 'primeros-pasos',
    title: 'Recorrido rápido: qué hay en cada sección',
    subtitle: 'Un tour por los módulos principales de QBITS',
    tags: ['tour', 'guía', 'módulos', 'recorrido', 'inicio'],
    relatedArticles: ['PS-04', 'PV-01'],
    tutorialVideo: null,
    content: `
      <p>QBITS está organizado en módulos. Cada uno tiene una función. Acá te contamos para qué sirve cada uno:</p>

      <div class="help-module-list">
        <div class="help-module-item">
          <span class="module-icon">🛒</span>
          <div>
            <strong>Facturación / Punto de Venta</strong>
            <p>Acá vendés y cobrás. La pantalla que más vas a usar día a día.</p>
          </div>
        </div>
        <div class="help-module-item">
          <span class="module-icon">📦</span>
          <div>
            <strong>Productos / Inventario</strong>
            <p>Cargás y administrás todo lo que vendés. También controlás el stock.</p>
          </div>
        </div>
        <div class="help-module-item">
          <span class="module-icon">🧾</span>
          <div>
            <strong>Facturas / Ventas</strong>
            <p>Lista de todas las ventas. Podés buscar, filtrar y ver el detalle de cada una.</p>
          </div>
        </div>
        <div class="help-module-item">
          <span class="module-icon">💰</span>
          <div>
            <strong>Caja</strong>
            <p>Control del dinero que entra y sale. Acá abrís y cerrás la caja del día.</p>
          </div>
        </div>
        <div class="help-module-item">
          <span class="module-icon">👥</span>
          <div>
            <strong>Clientes</strong>
            <p>Lista de todos tus clientes con su historial de compras.</p>
          </div>
        </div>
        <div class="help-module-item">
          <span class="module-icon">📊</span>
          <div>
            <strong>Dashboard / Reportes</strong>
            <p>Gráficos y estadísticas de ventas. Para saber cómo va el negocio.</p>
          </div>
        </div>
        <div class="help-module-item">
          <span class="module-icon">⚙️</span>
          <div>
            <strong>Configuración</strong>
            <p>Ajustes de empresa, sucursales, impresoras, métodos de pago y más.</p>
          </div>
        </div>
      </div>

      <div class="help-tip">💡 Primera vez: empezá por <a href="/help/primeros-pasos/como-registrar-datos-empresa" class="help-link">configurar tu empresa</a> y luego <a href="/help/punto-de-venta/como-abrir-caja" class="help-link">abrí la caja para vender</a>.</div>
    `
  },
  {
    id: 'PS-09',
    slug: 'como-cambiar-entre-empresas',
    categoryId: 'primeros-pasos',
    title: 'Cómo cambiar entre empresas si tenés más de una',
    subtitle: 'Gestioná múltiples negocios desde una sola cuenta',
    tags: ['empresa', 'cambiar', 'multi-empresa', 'switch'],
    relatedArticles: ['UA-05', 'PS-08'],
    tutorialVideo: null,
    content: `
      <p>Si manejás varios negocios con una sola cuenta, podés cambiar entre ellos sin cerrar sesión.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Tocá tu avatar (foto de perfil) en la esquina superior derecha</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá el ícono de herramientas o "Cambiar empresa"</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Elegí la empresa que querés activar</strong>
          <div class="help-tip">💡 El cambio es instantáneo. Ventas, productos y caja corresponden a la empresa activa.</div>
        </div>
      </div>
    `
  }
]

// ── PUNTO DE VENTA ────────────────────────────────────────────────────────────
const puntoDeVentaArticles = [
  {
    id: 'PV-01',
    slug: 'como-abrir-caja',
    categoryId: 'punto-de-venta',
    title: 'Cómo abrir la caja para empezar a vender',
    subtitle: 'El primer paso antes de iniciar tu jornada de ventas',
    tags: ['caja', 'abrir', 'vender', 'inicio', 'monto inicial'],
    relatedArticles: ['CF-01', 'PV-03'],
    tutorialVideo: null,
    content: `
      <p>Abrir la caja le dice a QBITS con cuánto dinero empezás el día. Así al final podés hacer el arqueo y ver si los números cierran.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá al módulo de Facturación</strong>
          <p>Si la caja está cerrada, te va a aparecer la ventana para abrirla automáticamente.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Ingresá el monto con el que empezás el día</strong>
          <p>Contá el dinero que tenés ahora y escribí ese número. Si no tenés nada, podés poner 0.</p>
          <div class="help-tip">💡 Este dato es el "fondo de caja" inicial.</div>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Tocá "Abrir caja"</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>¡Listo! Ya podés vender</strong>
          <p>La pantalla de facturación se abre y estás listo para atender clientes.</p>
        </div>
      </div>

      <p>Si te olvidás de abrir la caja, QBITS te lo recuerda la próxima vez que intentés hacer una venta.</p>
    `
  },
  {
    id: 'PV-02',
    slug: 'como-seleccionar-cliente',
    categoryId: 'punto-de-venta',
    title: 'Cómo buscar y seleccionar un cliente en la venta',
    subtitle: 'Asociá la venta a un cliente registrado o creá uno nuevo al vuelo',
    tags: ['cliente', 'seleccionar', 'buscar', 'venta'],
    relatedArticles: ['CL-01', 'PV-03'],
    tutorialVideo: null,
    content: `
      <p>Asignar un cliente te permite ver su historial y, si compra en cuenta corriente, registrar la deuda.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Abrí Facturación con la caja abierta</strong>
          <p>Si no abriste la caja, <a href="/help/punto-de-venta/como-abrir-caja" class="help-link">abrila primero</a>.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá el campo "Cliente"</strong>
          <p>Se abre el buscador con la lista de clientes.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Escribí el nombre o documento</strong>
          <p>La lista se filtra sola mientras escribís.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Tocá el nombre para seleccionarlo</strong>
          <div class="help-tip">✅ El cliente aparece en el encabezado de la factura.</div>
        </div>
      </div>

      <h3>¿El cliente no existe?</h3>
      <p>Tocá el "+" al lado del campo para crearlo sin salir de la venta. Solo necesitás el nombre.</p>
      <div class="help-tip">💡 El cliente es <strong>opcional</strong>. Podés vender sin asignarlo.</div>
    `
  },
  {
    id: 'PV-03',
    slug: 'como-agregar-productos-venta',
    categoryId: 'punto-de-venta',
    title: 'Cómo agregar productos a la venta',
    subtitle: 'Buscá y sumá ítems al pedido del cliente',
    tags: ['productos', 'agregar', 'venta', 'buscar', 'código de barras'],
    relatedArticles: ['IN-01', 'PV-04'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Abrí Facturación con la caja abierta</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Escribí en el buscador de productos</strong>
          <p>Escribí el nombre del producto. Por ejemplo, "café" o "pan".</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Los resultados aparecen mientras escribís</strong>
          <p>Tocá el producto para agregarlo.</p>
          <div class="help-tip">💡 También podés <strong>escanear el código de barras</strong> con la cámara del celular.</div>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>El producto aparece en la lista con cantidad 1</strong>
          <p>El total se actualiza automáticamente.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">5</div>
        <div class="step-content">
          <strong>Repetí para agregar más productos</strong>
        </div>
      </div>

      <p>¿No encontrás el producto? Probablemente todavía no está cargado. <a href="/help/inventario/como-agregar-producto" class="help-link">Aprendé a agregar un producto nuevo</a>.</p>
    `
  },
  {
    id: 'PV-04',
    slug: 'como-cambiar-cantidad-precio',
    categoryId: 'punto-de-venta',
    title: 'Cómo cambiar la cantidad de un producto',
    subtitle: 'Ajustá cuántas unidades quiere el cliente',
    tags: ['cantidad', 'precio', 'modificar', 'editar'],
    relatedArticles: ['PV-03', 'PV-05'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Tocá el producto en la lista de la venta</strong>
          <p>Se habilita la edición de ese ítem.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Cambiá el número de la cantidad</strong>
          <p>Escribí el nuevo número. Si el cliente quiere 3, escribí 3.</p>
          <div class="help-tip">💡 El total se recalcula solo.</div>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Confirmá el cambio</strong>
          <p>Tocá "Aceptar" o tocá otro lugar de la pantalla.</p>
        </div>
      </div>
    `
  },
  {
    id: 'PV-05',
    slug: 'como-cambiar-precio-articulo',
    categoryId: 'punto-de-venta',
    title: 'Cómo cambiar el precio de un artículo en la venta',
    subtitle: 'Aplicá un precio especial o acordado con el cliente',
    tags: ['precio', 'modificar', 'especial', 'editar'],
    relatedArticles: ['PV-04', 'PV-09'],
    tutorialVideo: null,
    content: `
      <p>A veces un cliente tiene un precio acordado diferente al precio de lista. Podés modificarlo directo en la venta.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Tocá el producto en la lista</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá el campo de precio y escribí el nuevo monto</strong>
          <div class="help-tip">⚠️ Este cambio aplica solo a esta venta. El precio del producto en el catálogo no cambia.</div>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Confirmá el cambio</strong>
          <p>El total se actualiza con el nuevo precio.</p>
        </div>
      </div>
    `
  },
  {
    id: 'PV-06',
    slug: 'como-eliminar-producto-venta',
    categoryId: 'punto-de-venta',
    title: 'Cómo eliminar un producto de la venta',
    subtitle: 'Sacá un ítem que agregaste por error',
    tags: ['eliminar', 'borrar', 'quitar', 'producto'],
    relatedArticles: ['PV-03', 'PV-04'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Buscá el producto en la lista de la venta</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Deslizá el producto hacia la izquierda (en celular) o tocá la papelera</strong>
          <p>En celular: deslizá el ítem hacia la izquierda — aparece el botón rojo "Eliminar".</p>
          <p>En computadora: pasá el mouse por encima y hacé clic en el ícono de papelera 🗑️.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Confirmá y listo</strong>
          <div class="help-tip">💡 Esto no afecta el inventario hasta que confirmés la venta final.</div>
        </div>
      </div>
    `
  },
  {
    id: 'PV-07',
    slug: 'como-cobrar-metodos-pago',
    categoryId: 'punto-de-venta',
    title: 'Cómo cobrar: efectivo, tarjeta, transferencia',
    subtitle: 'Finalizá la venta eligiendo cómo te van a pagar',
    tags: ['cobrar', 'efectivo', 'tarjeta', 'transferencia', 'pago'],
    relatedArticles: ['PV-08', 'CF-02'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Terminá de agregar todos los productos</strong>
          <p>Revisá que la lista esté completa y el total sea correcto.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá el botón "Cobrar"</strong>
          <p>Es el botón grande verde en la parte inferior de la pantalla.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Elegí el método de pago</strong>
          <p>Aparecen todos los métodos configurados: Efectivo, Débito, Crédito, Transferencia, etc.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Si pagó en efectivo, ingresá el monto recibido</strong>
          <p>Si la venta es $800 y te dan $1.000, escribí 1000. QBITS calcula el vuelto: te muestra $200.</p>
          <div class="help-tip">💰 El vuelto aparece bien grande para que no te confundas.</div>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">5</div>
        <div class="step-content">
          <strong>Tocá "Confirmar" para cerrar la venta</strong>
          <p>La venta se registra, el stock se descuenta y podés imprimir o enviar el comprobante.</p>
        </div>
      </div>

      <p>¿El cliente quiere pagar con dos métodos? Mirá <a href="/help/punto-de-venta/como-dividir-cobro" class="help-link">cómo dividir el cobro</a>.</p>
    `
  },
  {
    id: 'PV-08',
    slug: 'como-dividir-cobro',
    categoryId: 'punto-de-venta',
    title: 'Cómo dividir el cobro entre varios métodos de pago',
    subtitle: 'Parte en efectivo, parte con tarjeta o transferencia',
    tags: ['dividir', 'pago mixto', 'múltiples métodos', 'efectivo', 'tarjeta'],
    relatedArticles: ['PV-07'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Llegá a la pantalla de cobro</strong>
          <p>Tocá el botón "Cobrar".</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Elegí el primer método e ingresá el monto parcial</strong>
          <p>Por ejemplo, tocá "Efectivo" e ingresá $500 aunque la venta sea $800.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Tocá "+" para agregar el segundo método</strong>
          <p>Elegí "Tarjeta". QBITS calcula solo cuánto falta: $300.</p>
          <div class="help-tip">💡 No podés confirmar hasta que el total de todos los métodos cubra el monto de la venta.</div>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Tocá "Confirmar"</strong>
          <p>La venta se registra con ambos métodos detallados.</p>
        </div>
      </div>
    `
  },
  {
    id: 'PV-09',
    slug: 'como-aplicar-descuento',
    categoryId: 'punto-de-venta',
    title: 'Cómo aplicar un descuento a la venta',
    subtitle: 'Ofrecé descuentos a clientes especiales o en promociones',
    tags: ['descuento', 'oferta', 'promoción', 'precio especial'],
    relatedArticles: ['PV-10', 'IN-12'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Con los productos cargados, buscá el campo "Descuento"</strong>
          <p>Está debajo de la lista de artículos o en el panel lateral.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Ingresá el porcentaje</strong>
          <p>Si querés 10% de descuento, escribí 10.</p>
          <div class="help-tip">💡 El descuento aplica sobre el total de la venta.</div>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>El total se actualiza solo</strong>
          <p>Ves el precio original y el precio con descuento antes de cobrar.</p>
        </div>
      </div>
    `
  },
  {
    id: 'PV-10',
    slug: 'como-usar-promociones',
    categoryId: 'punto-de-venta',
    title: 'Cómo usar promociones y ofertas',
    subtitle: 'Aplicá las promociones que ya configuraste',
    tags: ['promociones', 'ofertas', 'descuentos', '2x1'],
    relatedArticles: ['IN-12', 'PV-09'],
    tutorialVideo: null,
    content: `
      <p>Si ya tenés promociones creadas en el sistema, se aplican solas cuando vendés.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Agregá los productos que forman la promoción</strong>
          <p>Por ejemplo, si la promo es "3 empanadas por el precio de 2", agregá 3 empanadas.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>QBITS aplica la promoción automáticamente</strong>
          <p>Si está activa y se cumplen las condiciones, el descuento se aplica solo. Lo ves en el total.</p>
          <div class="help-tip">💡 Si no se aplica, verificá que la promo esté activa en <a href="/help/inventario/como-crear-promociones" class="help-link">la sección de Promociones</a>.</div>
        </div>
      </div>

      <p>¿Querés crear una promo nueva? Mirá <a href="/help/inventario/como-crear-promociones" class="help-link">cómo crear y gestionar promociones</a>.</p>
    `
  },
  {
    id: 'PV-11',
    slug: 'como-asignar-mesa',
    categoryId: 'punto-de-venta',
    title: 'Cómo asignar una mesa a la venta',
    subtitle: 'Para restaurantes y bares: vinculá la venta a una mesa',
    tags: ['mesa', 'restaurante', 'bar', 'asignar'],
    relatedArticles: ['RS-01', 'RS-03'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá al módulo de Mesas</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá la mesa donde está el cliente</strong>
          <p>Las mesas libres aparecen en verde.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Tocá "Nueva Venta"</strong>
          <p>Se abre Facturación con la mesa ya asignada.</p>
          <div class="help-tip">🍽️ El nombre de la mesa aparece en el encabezado de la venta.</div>
        </div>
      </div>

      <p>¿Cómo configuro las mesas? Mirá <a href="/help/restaurante/como-disenar-mesas" class="help-link">cómo diseñar las mesas de tu local</a>.</p>
    `
  },
  {
    id: 'PV-12',
    slug: 'como-imprimir-comprobante',
    categoryId: 'punto-de-venta',
    title: 'Cómo imprimir o enviar el comprobante',
    subtitle: 'Emití el ticket o factura al cliente',
    tags: ['imprimir', 'comprobante', 'factura', 'ticket', 'whatsapp'],
    relatedArticles: ['CF-13'],
    tutorialVideo: null,
    content: `
      <p>Al confirmar la venta, QBITS te da varias opciones para el comprobante.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Después de confirmar el cobro, aparece la pantalla de éxito</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Elegí cómo enviar el comprobante:</strong>
          <ul>
            <li><strong>Imprimir:</strong> Va a la impresora térmica configurada.</li>
            <li><strong>WhatsApp:</strong> Abre WhatsApp para compartirlo al número del cliente.</li>
            <li><strong>Email:</strong> Lo envía al correo del cliente registrado.</li>
            <li><strong>Ninguno:</strong> Continuás sin emitir comprobante.</li>
          </ul>
          <div class="help-tip">💡 Sin impresora, WhatsApp es la opción más práctica para negocios pequeños.</div>
        </div>
      </div>

      <p>¿Querés conectar una impresora? Mirá <a href="/help/configuracion/como-conectar-impresora" class="help-link">cómo conectar una impresora térmica</a>.</p>
    `
  },
  {
    id: 'PV-13',
    slug: 'como-ver-lista-ventas',
    categoryId: 'punto-de-venta',
    title: 'Cómo ver la lista de todas las ventas',
    subtitle: 'Historial completo de facturas emitidas',
    tags: ['ventas', 'historial', 'facturas', 'lista'],
    relatedArticles: ['PV-14', 'PV-15'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá al módulo de "Facturas" o "Ventas"</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Aparece la lista de ventas del día</strong>
          <p>Podés ver número de factura, cliente, monto y estado.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Tocá cualquier venta para ver el detalle</strong>
          <div class="help-tip">💡 Desde el detalle también podés reimprimir el comprobante.</div>
        </div>
      </div>
    `
  },
  {
    id: 'PV-14',
    slug: 'como-filtrar-facturas-fecha',
    categoryId: 'punto-de-venta',
    title: 'Cómo buscar y filtrar facturas por fecha',
    subtitle: 'Encontrá ventas de días anteriores fácilmente',
    tags: ['filtrar', 'buscar', 'fecha', 'facturas'],
    relatedArticles: ['PV-13', 'PV-15'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Abrí el módulo de Facturas</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá el filtro de fecha</strong>
          <p>Aparece un calendario con los campos "Desde" y "Hasta". Seleccioná el rango.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>También podés filtrar por cliente o método de pago</strong>
          <div class="help-tip">💡 Combiná filtros para encontrar exactamente lo que buscás.</div>
        </div>
      </div>
    `
  },
  {
    id: 'PV-15',
    slug: 'como-ver-detalle-venta-anterior',
    categoryId: 'punto-de-venta',
    title: 'Cómo ver el detalle de una venta anterior',
    subtitle: 'Consultá los productos y el monto de una factura pasada',
    tags: ['detalle', 'venta anterior', 'consultar', 'reimprimir'],
    relatedArticles: ['PV-13', 'PV-14'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá al módulo de Facturas y buscá la venta</strong>
          <p>Usá los filtros de fecha si es necesario.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá la factura para verla en detalle</strong>
          <p>Número de factura, fecha, cliente, productos, precios y método de pago.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Desde acá podés reimprimir o reenviar el comprobante</strong>
          <div class="help-tip">💡 Las ventas no se modifican una vez confirmadas, pero siempre podés consultarlas.</div>
        </div>
      </div>
    `
  }
]

// ── INVENTARIO ────────────────────────────────────────────────────────────────
const inventarioArticles = [
  {
    id: 'IN-01',
    slug: 'como-agregar-producto',
    categoryId: 'inventario',
    title: 'Cómo agregar un producto nuevo',
    subtitle: 'Sumá productos a tu catálogo para poder venderlos',
    tags: ['producto', 'agregar', 'nuevo', 'catálogo', 'inventario'],
    relatedArticles: ['IN-02', 'IN-04'],
    tutorialVideo: null,
    content: `
      <p>Todo lo que vendés tiene que estar cargado como producto. Una vez cargado, podés buscarlo desde la pantalla de ventas.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá al módulo de Productos</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "+" para crear un producto nuevo</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Escribí el nombre del producto</strong>
          <p>Usá un nombre fácil de buscar cuando vendés. Por ejemplo: "Empanada de Carne".</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Ingresá el precio de venta</strong>
          <p>Lo podés cambiar en cualquier momento.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">5</div>
        <div class="step-content">
          <strong>Elegí la categoría (recomendado)</strong>
          <p>Si no existe la que buscás, podés crearla desde acá. Mirá <a href="/help/inventario/como-crear-categorias" class="help-link">cómo crear categorías</a>.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">6</div>
        <div class="step-content">
          <strong>Agregá el stock inicial (opcional)</strong>
          <div class="help-tip">💡 Con el stock configurado, QBITS te avisa cuando estás por quedarte sin mercadería.</div>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">7</div>
        <div class="step-content">
          <strong>Agregá una foto (opcional)</strong>
          <p>Ayuda a reconocer el producto más rápido al vender.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">8</div>
        <div class="step-content">
          <strong>Tocá "Guardar"</strong>
          <p>¡El producto ya está disponible para vender!</p>
        </div>
      </div>
    `
  },
  {
    id: 'IN-02',
    slug: 'como-crear-categorias',
    categoryId: 'inventario',
    title: 'Cómo crear categorías de productos',
    subtitle: 'Organizá tu catálogo agrupando productos similares',
    tags: ['categorías', 'organizar', 'clasificar', 'grupos'],
    relatedArticles: ['IN-01'],
    tutorialVideo: null,
    content: `
      <p>Las categorías agrupan productos del mismo tipo: "Bebidas", "Comidas", "Limpieza". Hacen mucho más fácil encontrar cosas cuando vendés.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Categorías dentro de Inventario</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "+" para crear una nueva</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Poné el nombre</strong>
          <p>Por ejemplo: "Panificados", "Snacks" o "Productos de limpieza".</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Elegí un ícono o color (opcional)</strong>
          <p>Hace más visual la pantalla de ventas.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">5</div>
        <div class="step-content">
          <strong>Guardá</strong>
          <div class="help-tip">💡 Podés crear, editar y eliminar categorías en cualquier momento.</div>
        </div>
      </div>
    `
  },
  {
    id: 'IN-03',
    slug: 'como-agregar-receta',
    categoryId: 'inventario',
    title: 'Cómo agregar una receta (producto con ingredientes)',
    subtitle: 'Para negocios que elaboran sus productos con materias primas',
    tags: ['receta', 'ingredientes', 'materia prima', 'elaboración'],
    relatedArticles: ['IN-01'],
    tutorialVideo: null,
    content: `
      <p>Si elaborás productos propios —panadería, restaurante, fábrica— podés crear recetas. Al vender, QBITS descuenta los ingredientes del stock automáticamente.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Abrí o creá el producto que tiene receta</strong>
          <p>Andá a Productos, buscá el producto (o creá uno nuevo) y abrí su formulario.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Buscá la sección "Receta" o "Ingredientes"</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Agregá los ingredientes uno por uno</strong>
          <p>Para cada uno, indicá el producto (materia prima) y la cantidad usada. Ej: "Harina" × 200 gr.</p>
          <div class="help-tip">💡 Los ingredientes también tienen que estar cargados como productos en el catálogo.</div>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Guardá la receta</strong>
          <p>Cada venta descuenta los ingredientes del stock automáticamente.</p>
        </div>
      </div>
    `
  },
  {
    id: 'IN-04',
    slug: 'como-editar-producto',
    categoryId: 'inventario',
    title: 'Cómo editar un producto existente',
    subtitle: 'Actualizá el nombre, precio o foto de un producto',
    tags: ['editar', 'modificar', 'precio', 'producto'],
    relatedArticles: ['IN-01', 'IN-05'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Productos y buscá el que querés editar</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocalo para abrir el formulario</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Modificá lo que necesitás</strong>
          <p>Nombre, precio, foto, categoría, stock mínimo.</p>
          <div class="help-tip">⚠️ Si cambiás el precio, aplica a las próximas ventas. Las anteriores mantienen el precio original.</div>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Tocá "Guardar"</strong>
          <p>Los cambios aplican de inmediato.</p>
        </div>
      </div>
    `
  },
  {
    id: 'IN-05',
    slug: 'como-desactivar-producto',
    categoryId: 'inventario',
    title: 'Cómo eliminar o desactivar un producto',
    subtitle: 'Ocultá o borrá productos que ya no vendés',
    tags: ['eliminar', 'desactivar', 'ocultar', 'producto'],
    relatedArticles: ['IN-01', 'IN-04'],
    tutorialVideo: null,
    content: `
      <p><strong>Desactivar</strong> deja de mostrarlo en ventas pero guarda el historial. <strong>Eliminar</strong> lo borra definitivamente — solo para errores de carga.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Abrí el producto en Inventario</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Para desactivar: buscá el interruptor "Activo/Inactivo"</strong>
          <p>Cambialo a inactivo y guardá. Desaparece de las pantallas de venta.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Para eliminar: tocá el ícono de papelera</strong>
          <div class="help-tip">⚠️ Los productos que ya se vendieron no se pueden eliminar, solo desactivar.</div>
        </div>
      </div>
    `
  },
  {
    id: 'IN-06',
    slug: 'como-ajustar-stock',
    categoryId: 'inventario',
    title: 'Cómo ajustar el stock de un producto manualmente',
    subtitle: 'Corregí el inventario después de un conteo o por pérdidas',
    tags: ['stock', 'ajuste', 'inventario', 'entrada', 'salida'],
    relatedArticles: ['IN-07', 'IN-09'],
    tutorialVideo: null,
    content: `
      <p>Usás esto cuando el número del sistema no coincide con lo que tenés físicamente.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Buscá el producto en Inventario y abrilo</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Buscá "Ajustar stock" o "Movimiento de stock"</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Elegí si es Entrada o Salida</strong>
          <ul>
            <li><strong>Entrada:</strong> Suma stock (recibiste mercadería)</li>
            <li><strong>Salida:</strong> Resta stock (pérdida, rotura, vencimiento)</li>
          </ul>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Ingresá la cantidad y el motivo</strong>
          <p>Ej: "Conteo físico", "Rotura", "Mercadería recibida".</p>
          <div class="help-tip">💡 El motivo queda registrado en el historial del producto.</div>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">5</div>
        <div class="step-content">
          <strong>Guardá el ajuste</strong>
          <p>El stock se actualiza de inmediato.</p>
        </div>
      </div>
    `
  },
  {
    id: 'IN-07',
    slug: 'como-hacer-conteo-inventario',
    categoryId: 'inventario',
    title: 'Cómo hacer un conteo de inventario',
    subtitle: 'Verificá que el stock del sistema coincida con el físico',
    tags: ['conteo', 'inventario', 'arqueo', 'recuento'],
    relatedArticles: ['IN-06', 'IN-09'],
    tutorialVideo: null,
    content: `
      <p>Contás todo lo que tenés físicamente y lo comparás con el sistema. Sirve para detectar diferencias.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Inventario → Conteo de Inventario</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Creá un nuevo conteo</strong>
          <p>Podés filtrar por categoría si querés contar solo una sección.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Andá producto por producto e ingresá la cantidad real</strong>
          <div class="help-tip">💡 Podés pausar y retomar. El conteo queda guardado hasta que lo confirmés.</div>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Revisá las diferencias</strong>
          <p>QBITS te marca en rojo los productos con discrepancia.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">5</div>
        <div class="step-content">
          <strong>Confirmá para aplicar los ajustes</strong>
          <p>El stock del sistema se actualiza con los valores que contaste.</p>
        </div>
      </div>
    `
  },
  {
    id: 'IN-08',
    slug: 'como-transferir-productos',
    categoryId: 'inventario',
    title: 'Cómo transferir productos entre sucursales',
    subtitle: 'Mové mercadería de un local a otro',
    tags: ['transferencia', 'sucursales', 'stock', 'movimiento'],
    relatedArticles: ['IN-06'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Inventario → Transferencia de Productos</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Elegí la sucursal de origen y la de destino</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Agregá los productos con sus cantidades</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Confirmá la transferencia</strong>
          <p>El stock baja en el origen y sube en el destino automáticamente.</p>
          <div class="help-tip">💡 El historial de transferencias siempre está disponible para consultarlo.</div>
        </div>
      </div>
    `
  },
  {
    id: 'IN-09',
    slug: 'como-ver-kardex-producto',
    categoryId: 'inventario',
    title: 'Cómo ver los movimientos de un producto (Kardex)',
    subtitle: 'Historial completo de entradas y salidas de un producto',
    tags: ['kardex', 'movimientos', 'historial', 'stock'],
    relatedArticles: ['IN-06', 'IN-07'],
    tutorialVideo: null,
    content: `
      <p>El Kardex muestra cuándo entró y cuándo salió cada unidad: ventas, compras, ajustes. Ideal para investigar diferencias de stock.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Inventario → Kardex</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Buscá el producto y seleccionalo</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Revisá la lista cronológica</strong>
          <p>Fecha, tipo (venta, ajuste, compra), cantidad y stock resultante.</p>
          <div class="help-tip">💡 Filtrá por fechas para ver solo un período específico.</div>
        </div>
      </div>
    `
  },
  {
    id: 'IN-10',
    slug: 'como-configurar-stock-minimo',
    categoryId: 'inventario',
    title: 'Cómo configurar el stock mínimo para alertas',
    subtitle: 'Recibí avisos cuando estás por quedarte sin mercadería',
    tags: ['stock mínimo', 'alerta', 'aviso', 'reorden'],
    relatedArticles: ['IN-01', 'IN-06'],
    tutorialVideo: null,
    content: `
      <p>Cuando el stock llega al mínimo que configuraste, QBITS te avisa. Así podés reponer antes de quedarte sin nada.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Abrí el producto en Inventario</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Buscá el campo "Stock Mínimo"</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Ingresá el número mínimo</strong>
          <p>Si querés alerta con menos de 5 unidades, escribí 5.</p>
          <div class="help-tip">💡 Las alertas aparecen en el Dashboard y en Inventario.</div>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Guardá los cambios</strong>
        </div>
      </div>
    `
  },
  {
    id: 'IN-11',
    slug: 'como-gestionar-depositos',
    categoryId: 'inventario',
    title: 'Cómo gestionar depósitos y almacenes',
    subtitle: 'Organizá tu stock en diferentes lugares de almacenamiento',
    tags: ['depósito', 'almacén', 'bodega', 'stock'],
    relatedArticles: ['IN-06', 'IN-08'],
    tutorialVideo: null,
    content: `
      <p>Los depósitos son los lugares físicos donde guardás la mercadería. Podés tener varios: depósito principal, estantería de ventas, cámara frigorífica.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Configuración → Depósitos</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "+" para crear uno nuevo</strong>
          <p>Dale un nombre descriptivo: "Depósito principal" o "Estantería 2".</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Asigná stock a cada depósito</strong>
          <p>Al hacer ajustes o compras, podés indicar en qué depósito entra la mercadería.</p>
          <div class="help-tip">💡 Útil para negocios con varios espacios de almacenamiento.</div>
        </div>
      </div>
    `
  },
  {
    id: 'IN-12',
    slug: 'como-crear-promociones',
    categoryId: 'inventario',
    title: 'Cómo crear y gestionar promociones',
    subtitle: 'Configurá ofertas como 2x1, combos o descuentos por cantidad',
    tags: ['promociones', 'ofertas', 'descuentos', '2x1'],
    relatedArticles: ['PV-10', 'PV-09'],
    tutorialVideo: null,
    content: `
      <p>Tipos de promociones disponibles:</p>
      <ul>
        <li><strong>Descuento porcentual:</strong> Ej: 20% off en todos los panificados</li>
        <li><strong>Precio especial:</strong> Precio diferente para un producto en cierto período</li>
        <li><strong>Combo:</strong> Precio especial por combinar productos</li>
      </ul>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá al módulo de Promociones</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "Nueva Promoción"</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Completá los detalles</strong>
          <p>Nombre, productos incluidos, descuento o precio especial, y fechas de vigencia.</p>
          <div class="help-tip">💡 Podés desactivar una promo sin eliminarla.</div>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Guardá y activá la promoción</strong>
          <p>Se aplica automáticamente en la pantalla de ventas cuando se cumplen las condiciones.</p>
        </div>
      </div>
    `
  },
  {
    id: 'IN-13',
    slug: 'como-configurar-unidades-medida',
    categoryId: 'inventario',
    title: 'Cómo configurar unidades de medida',
    subtitle: 'Vendé por kg, litros, metros o la unidad que necesités',
    tags: ['unidades', 'kilogramos', 'litros', 'medida'],
    relatedArticles: ['IN-01'],
    tutorialVideo: null,
    content: `
      <p>Si vendés a granel —carne por kg, tela por metro, aceite por litro— podés configurar la unidad de cada producto.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Configuración → Unidades de Medida</strong>
          <p>Acá podés ver y crear las unidades disponibles: kg, gr, lt, ml, m, unidad, etc.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Asigná la unidad a cada producto</strong>
          <p>Al crear o editar un producto, seleccioná la unidad correspondiente.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Al vender, ingresá la cantidad en esa unidad</strong>
          <p>Por ejemplo, para 350 gr de queso escribí "0.350".</p>
          <div class="help-tip">💡 El precio se calcula automáticamente según la cantidad y el precio por unidad.</div>
        </div>
      </div>
    `
  }
]

// ── COMPRAS ───────────────────────────────────────────────────────────────────
const comprasArticles = [
  {
    id: 'CO-01',
    slug: 'como-agregar-proveedor',
    categoryId: 'compras',
    title: 'Cómo agregar un proveedor',
    subtitle: 'Registrá a quienes te venden la mercadería',
    tags: ['proveedor', 'agregar', 'nuevo', 'compras'],
    relatedArticles: ['CO-02'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá al módulo de Proveedores</strong>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "+" para agregar uno nuevo</strong>
          <p>Completá nombre, documento, teléfono y dirección.</p>
          <div class="help-tip">💡 Cuantos más datos cargués, más fácil encontrarlo y gestionar las cuentas.</div>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Guardá</strong>
          <p>Ya podés seleccionarlo al registrar compras.</p>
        </div>
      </div>
    `
  },
  {
    id: 'CO-02',
    slug: 'como-registrar-compra',
    categoryId: 'compras',
    title: 'Cómo registrar una compra nueva',
    subtitle: 'Asentá la mercadería que recibiste de un proveedor',
    tags: ['compra', 'registrar', 'proveedor', 'factura compra'],
    relatedArticles: ['CO-01', 'CO-04'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Compras → Nueva Compra</strong>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Seleccioná el proveedor</strong>
          <p>Si no existe todavía, podés crearlo desde acá. <a href="/help/compras/como-agregar-proveedor" class="help-link">Cómo agregar un proveedor</a>.</p>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Ingresá el número de factura del proveedor (opcional)</strong>
          <p>Útil para cruzar con el papel que te dejó.</p>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Agregá los productos y las cantidades</strong>
          <p>El stock se actualiza automáticamente al confirmar.</p>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">5</div>
        <div class="step-content">
          <strong>Indicá si pagaste ahora o queda pendiente</strong>
          <div class="help-tip">💡 Las compras pendientes de pago aparecen en "Cuentas por Pagar".</div>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">6</div>
        <div class="step-content">
          <strong>Confirmá la compra</strong>
          <p>El stock de los productos se actualiza con lo que registraste.</p>
        </div>
      </div>
    `
  },
  {
    id: 'CO-03',
    slug: 'como-buscar-editar-compra',
    categoryId: 'compras',
    title: 'Cómo buscar y editar una compra registrada',
    subtitle: 'Encontrá y corregí compras anteriores',
    tags: ['compra', 'buscar', 'editar', 'historial'],
    relatedArticles: ['CO-02'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá al módulo de Compras</strong>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Usá los filtros para encontrar la compra</strong>
          <p>Podés filtrar por fecha, proveedor o número de factura.</p>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Tocá la compra para ver el detalle o editarla</strong>
          <div class="help-tip">⚠️ Si la compra ya fue pagada, no se puede modificar. Creá una nota de ajuste.</div>
        </div>
      </div>
    `
  },
  {
    id: 'CO-04',
    slug: 'como-ver-cuentas-pagar',
    categoryId: 'compras',
    title: 'Cómo ver las cuentas por pagar',
    subtitle: 'Revisá cuánto le debés a cada proveedor',
    tags: ['cuentas por pagar', 'deuda', 'proveedor'],
    relatedArticles: ['CO-05'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Compras → Cuentas por Pagar</strong>
          <p>Aparece la lista de todas las compras pendientes de pago.</p>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Revisá el saldo por proveedor</strong>
          <p>Ves cuánto debés en total y el detalle de cada factura pendiente.</p>
          <div class="help-tip">💡 Ordená por proveedor o fecha de vencimiento para priorizar pagos.</div>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Para pagar, mirá el siguiente artículo</strong>
          <p><a href="/help/compras/como-registrar-pago-proveedor" class="help-link">Cómo registrar el pago de una deuda al proveedor</a>.</p>
        </div>
      </div>
    `
  },
  {
    id: 'CO-05',
    slug: 'como-registrar-pago-proveedor',
    categoryId: 'compras',
    title: 'Cómo registrar el pago de una deuda al proveedor',
    subtitle: 'Marcá como pagada una deuda pendiente',
    tags: ['pago', 'proveedor', 'cancelar deuda', 'cuentas por pagar'],
    relatedArticles: ['CO-04'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Cuentas por Pagar y encontrá la deuda</strong>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "Registrar Pago"</strong>
          <p>Ingresá el monto y el método de pago.</p>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Podés pagar total o parcialmente</strong>
          <p>Si pagaste solo una parte, el saldo restante queda como pendiente.</p>
          <div class="help-tip">💡 El historial de pagos queda registrado para consultar después.</div>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Confirmá el pago</strong>
        </div>
      </div>
    `
  },
  {
    id: 'CO-06',
    slug: 'como-exportar-compras-excel',
    categoryId: 'compras',
    title: 'Cómo exportar el listado de compras a Excel',
    subtitle: 'Descargá las compras en formato planilla',
    tags: ['exportar', 'excel', 'compras', 'descarga'],
    relatedArticles: ['RE-04'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá al módulo de Compras y filtrá el período</strong>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Buscá el botón "Exportar"</strong>
          <p>Generalmente está en la barra superior de la lista.</p>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>El archivo se descarga automáticamente</strong>
          <div class="help-tip">💡 Se guarda en la carpeta Descargas de tu dispositivo.</div>
        </div>
      </div>
    `
  }
]

// ── CLIENTES ──────────────────────────────────────────────────────────────────
const clientesArticles = [
  {
    id: 'CL-01',
    slug: 'como-agregar-cliente',
    categoryId: 'clientes',
    title: 'Cómo agregar un cliente nuevo',
    subtitle: 'Registrá clientes para llevar historial y cuenta corriente',
    tags: ['cliente', 'agregar', 'nuevo', 'registrar'],
    relatedArticles: ['CL-02', 'PV-02'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá al módulo de Clientes</strong>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "+" para crear uno nuevo</strong>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Completá los datos</strong>
          <p>Nombre, documento, teléfono, email, dirección. Solo el nombre es obligatorio.</p>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Guardá</strong>
          <p>Ya podés asignarlo a una venta.</p>
          <div class="help-tip">💡 También podés agregar clientes directamente desde Facturación sin salir de la venta.</div>
        </div>
      </div>
    `
  },
  {
    id: 'CL-02',
    slug: 'como-editar-cliente',
    categoryId: 'clientes',
    title: 'Cómo editar los datos de un cliente',
    subtitle: 'Actualizá teléfono, dirección u otros datos',
    tags: ['editar', 'cliente', 'modificar', 'actualizar'],
    relatedArticles: ['CL-01'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Clientes y buscá al cliente</strong>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocalo para abrir sus datos</strong>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Modificá los campos que necesitás y guardá</strong>
        </div>
      </div>
    `
  },
  {
    id: 'CL-03',
    slug: 'como-importar-clientes-excel',
    categoryId: 'clientes',
    title: 'Cómo importar clientes desde un archivo Excel',
    subtitle: 'Cargá muchos clientes de una vez desde una planilla',
    tags: ['importar', 'excel', 'clientes', 'masivo'],
    relatedArticles: ['CL-01'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Clientes y buscá el botón "Importar"</strong>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Descargá la plantilla de Excel</strong>
          <p>QBITS te da el formato correcto. Completala con los datos de tus clientes.</p>
          <div class="help-tip">💡 Es importante respetar el formato de la plantilla para que la importación funcione.</div>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Subí el archivo y confirmá la importación</strong>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Revisá los resultados</strong>
          <p>QBITS te muestra cuántos se importaron y si hubo algún error.</p>
        </div>
      </div>
    `
  },
  {
    id: 'CL-04',
    slug: 'como-exportar-clientes',
    categoryId: 'clientes',
    title: 'Cómo exportar la lista de clientes',
    subtitle: 'Descargá tu base de clientes en Excel',
    tags: ['exportar', 'excel', 'clientes', 'descarga'],
    relatedArticles: ['CL-03'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Clientes</strong>
          <p>Filtrá antes de exportar si querés solo un subgrupo.</p>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "Exportar"</strong>
          <p>Se descarga un archivo Excel con todos los clientes visibles.</p>
        </div>
      </div>
    `
  },
  {
    id: 'CL-05',
    slug: 'como-ver-cuentas-cobrar',
    categoryId: 'clientes',
    title: 'Cómo ver las cuentas por cobrar',
    subtitle: 'Chequeá qué clientes te deben dinero',
    tags: ['cuentas por cobrar', 'deuda', 'cliente', 'fiado'],
    relatedArticles: ['CL-06'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Clientes → Cuentas por Cobrar</strong>
          <p>Aparece la lista de clientes con saldo pendiente.</p>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Revisá el saldo de cada cliente</strong>
          <div class="help-tip">💡 Tocá un cliente para ver el detalle completo de sus facturas pendientes.</div>
        </div>
      </div>
    `
  },
  {
    id: 'CL-06',
    slug: 'como-registrar-cobro-cliente',
    categoryId: 'clientes',
    title: 'Cómo registrar un cobro a un cliente con deuda',
    subtitle: 'Asentá el pago de un cliente que te debía',
    tags: ['cobro', 'cliente', 'deuda', 'pago'],
    relatedArticles: ['CL-05'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Cuentas por Cobrar y encontrá al cliente</strong>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "Registrar Cobro"</strong>
          <p>Ingresá el monto y el método de pago.</p>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Podés cobrar parcialmente</strong>
          <p>Si pagó solo una parte, ingresá ese monto. El resto queda pendiente.</p>
          <div class="help-tip">💡 Podés emitir un comprobante del pago si el cliente lo necesita.</div>
        </div>
      </div>
    `
  },
  {
    id: 'CL-07',
    slug: 'como-ver-historial-cliente',
    categoryId: 'clientes',
    title: 'Cómo ver el historial de compras de un cliente',
    subtitle: 'Consultá todas las ventas realizadas a un cliente específico',
    tags: ['historial', 'cliente', 'compras', 'ventas'],
    relatedArticles: ['CL-01', 'PV-13'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Clientes, buscá el cliente y tocá su nombre</strong>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Buscá la pestaña "Historial" o "Compras"</strong>
          <p>Lista de todas las ventas con fecha, monto y estado.</p>
          <div class="help-tip">💡 Filtrá por período para ver compras de un mes específico.</div>
        </div>
      </div>
    `
  }
]

// ── CAJA Y FINANZAS ───────────────────────────────────────────────────────────
const cajaFinanzasArticles = [
  {
    id: 'CF-01',
    slug: 'como-configurar-caja',
    categoryId: 'caja-finanzas',
    title: 'Cómo configurar una caja registradora',
    subtitle: 'Creá y configurá las cajas de tu negocio',
    tags: ['caja', 'configurar', 'registradora'],
    relatedArticles: ['CF-02', 'PV-01'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Configuración → Cajas</strong>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "+" para crear una nueva</strong>
          <p>Dale un nombre: "Caja 1" o "Caja Principal".</p>
          <div class="help-tip">💡 Podés tener múltiples cajas si tenés varios puntos de cobro.</div>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Guardá</strong>
          <p>Ya podés usarla para abrir y cerrar turnos de venta.</p>
        </div>
      </div>
    `
  },
  {
    id: 'CF-02',
    slug: 'como-configurar-metodos-pago',
    categoryId: 'caja-finanzas',
    title: 'Cómo configurar métodos de pago',
    subtitle: 'Habilitá efectivo, tarjeta, transferencia y más',
    tags: ['métodos de pago', 'efectivo', 'tarjeta', 'transferencia'],
    relatedArticles: ['PV-07'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Configuración → Métodos de Pago</strong>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Activá los métodos que aceptás</strong>
          <p>Efectivo, Débito, Crédito, Transferencia, MercadoPago, etc.</p>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Guardá los cambios</strong>
          <p>Solo aparecen en la pantalla de cobro los métodos que activaste.</p>
          <div class="help-tip">💡 Desactivá los que ya no usás para simplificar la pantalla de cobro.</div>
        </div>
      </div>
    `
  },
  {
    id: 'CF-03',
    slug: 'como-hacer-entrada-dinero',
    categoryId: 'caja-finanzas',
    title: 'Cómo hacer una entrada de dinero a la caja',
    subtitle: 'Registrá dinero que ingresó sin ser una venta',
    tags: ['entrada', 'dinero', 'caja', 'ingreso'],
    relatedArticles: ['CF-04', 'CF-05'],
    tutorialVideo: null,
    content: `
      <p>Usás esto cuando entra dinero a la caja por algo que no es una venta. Por ejemplo, un adelanto de capital.</p>
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Desde Facturación o Caja, buscá "Movimientos" o "Entrada/Salida"</strong>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Elegí "Entrada"</strong>
          <p>Ingresá el monto y el concepto. Ej: "Adelanto capital $1000".</p>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Confirmá</strong>
          <p>Queda registrado en el historial de la caja.</p>
        </div>
      </div>
    `
  },
  {
    id: 'CF-04',
    slug: 'como-registrar-salida-dinero',
    categoryId: 'caja-finanzas',
    title: 'Cómo registrar una salida de dinero (gasto)',
    subtitle: 'Asentá gastos pagados desde la caja',
    tags: ['salida', 'gasto', 'egreso', 'caja'],
    relatedArticles: ['CF-03', 'CF-05'],
    tutorialVideo: null,
    content: `
      <p>Usás esto cuando sacás dinero de la caja para pagar algo: luz, limpieza, insumos.</p>
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Desde Facturación o Caja, tocá "Movimientos"</strong>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Elegí "Salida"</strong>
          <p>Ingresá el monto y el concepto. Ej: "Pago limpieza $500".</p>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Confirmá</strong>
          <div class="help-tip">💡 Estos gastos aparecen en el reporte de caja del día.</div>
        </div>
      </div>
    `
  },
  {
    id: 'CF-05',
    slug: 'como-cerrar-caja-arqueo',
    categoryId: 'caja-finanzas',
    title: 'Cómo cerrar la caja y hacer el arqueo',
    subtitle: 'El conteo final del día para verificar que los números cierren',
    tags: ['arqueo', 'cerrar caja', 'cierre', 'conteo'],
    relatedArticles: ['CF-06', 'PV-01'],
    tutorialVideo: null,
    content: `
      <p>El arqueo es contar el dinero real de la caja al final del día y compararlo con el sistema. Detecta diferencias.</p>
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Al final del día, andá a Caja → Cerrar Caja</strong>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Contá el dinero físico</strong>
          <p>Podés ingresar por denominación o el total directamente.</p>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Ingresá el monto en el sistema</strong>
          <p>QBITS compara lo que contaste con lo que debería haber.</p>
          <div class="help-tip">💡 Si hay diferencia, QBITS te la muestra claramente como faltante o sobrante.</div>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Confirmá el cierre</strong>
          <p>La caja queda cerrada y se genera el reporte del día.</p>
        </div>
      </div>
    `
  },
  {
    id: 'CF-06',
    slug: 'como-ver-reporte-caja',
    categoryId: 'caja-finanzas',
    title: 'Cómo ver el reporte de caja del día',
    subtitle: 'Resumen completo de lo que pasó en la caja',
    tags: ['reporte', 'caja', 'resumen', 'día'],
    relatedArticles: ['CF-05', 'CF-07'],
    tutorialVideo: null,
    content: `
      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Caja → Reporte de Caja</strong>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Elegí la fecha o período</strong>
        </div>
      </div>
      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>El reporte muestra:</strong>
          <ul>
            <li>Monto de apertura</li>
            <li>Total de ventas por método de pago