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
            <li>Total de ventas por método de pago</li>
            <li>Entradas y salidas de dinero</li>
            <li>Diferencia entre lo esperado y lo real</li>
          </ul>
        </div>
      </div>
      <div class="help-tip">💡 Podés exportar el reporte a PDF o Excel desde el botón de descarga.</div>
    `
  },
  {
    id: 'CF-07',
    slug: 'como-hacer-transferencia-entre-cajas',
    categoryId: 'caja-finanzas',
    title: 'Cómo hacer una transferencia entre cajas',
    subtitle: 'Mové dinero de una caja a otra dentro de tu negocio',
    tags: ['transferencia', 'cajas', 'mover dinero', 'traspaso'],
    relatedArticles: ['CF-03', 'CF-08'],
    tutorialVideo: null,
    content: `
      <p>Si tenés más de una caja (por ejemplo, caja principal y caja chica), podés transferir dinero entre ellas.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Caja → Transferencias</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "Nueva transferencia"</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Elegí la caja de origen y la caja de destino</strong>
          <p>Indicá el monto y opcionalmente una nota (ej: "Reposición caja chica").</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Confirmá la transferencia</strong>
          <p>El movimiento queda registrado en ambas cajas automáticamente.</p>
        </div>
      </div>

      <div class="help-tip">💡 Las transferencias entre cajas no afectan tus ingresos ni gastos. Es solo un movimiento interno.</div>
    `
  },
  {
    id: 'CF-08',
    slug: 'como-conciliar-caja-diferencias',
    categoryId: 'caja-finanzas',
    title: 'Cómo conciliar la caja cuando hay diferencias',
    subtitle: 'Qué hacer cuando el dinero real no coincide con lo que dice el sistema',
    tags: ['conciliar', 'diferencia', 'faltante', 'sobrante', 'ajuste'],
    relatedArticles: ['CF-05', 'CF-09'],
    tutorialVideo: null,
    content: `
      <p>Si al cerrar la caja encontrás que el dinero real no coincide con lo que muestra QBITS, tenés que hacer una conciliación.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Al cerrar la caja, ingresá el monto real que contaste</strong>
          <p>QBITS te muestra el monto esperado y vos ponés lo que realmente hay.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>QBITS calcula la diferencia automáticamente</strong>
          <p>Te dice si hay un faltante (te falta plata) o un sobrante (hay de más).</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Registrá una nota explicativa</strong>
          <p>Indicá el motivo si lo sabés: "Error de vuelto", "Gasto no registrado", etc.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Confirmá el cierre</strong>
          <p>La diferencia queda registrada en el historial para que puedas revisarla después.</p>
        </div>
      </div>

      <div class="help-tip">💡 Si las diferencias son frecuentes, revisá que todos los movimientos (entradas, salidas, gastos) se estén registrando correctamente.</div>
    `
  },
  {
    id: 'CF-09',
    slug: 'como-ver-historial-movimientos-caja',
    categoryId: 'caja-finanzas',
    title: 'Cómo ver el historial de movimientos de caja',
    subtitle: 'Consultá todos los movimientos pasados con detalle y filtros',
    tags: ['historial', 'movimientos', 'caja', 'registro', 'consultar'],
    relatedArticles: ['CF-06', 'CF-07'],
    tutorialVideo: null,
    content: `
      <p>Necesitás revisar qué pasó en la caja un día específico? El historial tiene todo.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Caja → Historial de movimientos</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Filtrá por fecha, tipo de movimiento o usuario</strong>
          <p>Podés buscar: aperturas, cierres, entradas, salidas, ventas, transferencias.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Tocá un movimiento para ver el detalle</strong>
          <p>Cada registro muestra: fecha, hora, usuario, tipo, monto y nota asociada.</p>
        </div>
      </div>

      <div class="help-tip">💡 Exportá el historial a Excel si necesitás mandárselo al contador o hacer una auditoría.</div>
    `
  }
]

// ── REPORTES Y ANÁLISIS ───────────────────────────────────────────────────────
const reportesArticles = [
  {
    id: 'RE-01',
    slug: 'como-usar-dashboard-general',
    categoryId: 'reportes',
    title: 'Cómo usar el Dashboard general',
    subtitle: 'Tu resumen de ventas, gastos y métricas clave en una sola pantalla',
    tags: ['dashboard', 'resumen', 'ventas', 'métricas', 'gráficos'],
    relatedArticles: ['RE-02', 'RE-03'],
    tutorialVideo: null,
    content: `
      <p>El Dashboard es lo primero que ves al entrar a QBITS. Te da un pantallazo general de cómo viene el negocio.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Reportes → Dashboard</strong>
          <p>O simplemente tocá el ícono de gráficos en el menú principal.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Revisá las tarjetas de resumen</strong>
          <p>Vas a ver: ventas del día, ventas del mes, ticket promedio, cantidad de transacciones y más.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Explorá los gráficos</strong>
          <p>Hay gráficos de ventas por día, por método de pago y por categoría de producto.</p>
        </div>
      </div>

      <div class="help-tip">💡 Podés cambiar el período del dashboard usando los filtros de fecha arriba a la derecha.</div>
    `
  },
  {
    id: 'RE-02',
    slug: 'como-filtrar-reportes-por-fecha',
    categoryId: 'reportes',
    title: 'Cómo filtrar reportes por fecha y sucursal',
    subtitle: 'Ajustá el rango de fechas y la sucursal para ver exactamente lo que necesitás',
    tags: ['filtros', 'fecha', 'sucursal', 'rango', 'período'],
    relatedArticles: ['RE-01', 'RE-03'],
    tutorialVideo: null,
    content: `
      <p>Todos los reportes de QBITS tienen filtros. Usá los para enfocarte en un período o sucursal específica.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Entrá al reporte que quieras consultar</strong>
          <p>Desde Reportes → Dashboard, Ventas, Productos, etc.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá el selector de fechas</strong>
          <p>Está arriba a la derecha. Podés elegir: Hoy, Esta semana, Este mes, o un rango personalizado.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Seleccioná la sucursal (si tenés varias)</strong>
          <p>El filtro de sucursal aparece al lado del de fecha. Elegí "Todas" o una específica.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Tocá "Aplicar"</strong>
          <p>Los datos del reporte se actualizan automáticamente.</p>
        </div>
      </div>

      <div class="help-tip">💡 QBITS recuerda tu último filtro. Si siempre consultás el mismo período, no hace falta configurarlo cada vez.</div>
    `
  },
  {
    id: 'RE-03',
    slug: 'como-exportar-reportes-excel-pdf',
    categoryId: 'reportes',
    title: 'Cómo exportar reportes a Excel o PDF',
    subtitle: 'Descargá tus datos para analizarlos o compartirlos',
    tags: ['exportar', 'excel', 'pdf', 'descargar', 'reporte'],
    relatedArticles: ['RE-01', 'RE-04'],
    tutorialVideo: null,
    content: `
      <p>Necesitás mandarle el reporte a tu contador o analizarlo en una planilla? Exportalo en 2 toques.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá al reporte que querés exportar</strong>
          <p>Puede ser el de ventas, productos, caja, o cualquier otro.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Aplicá los filtros que necesites</strong>
          <p>Asegurate de tener el período y la sucursal correctos antes de exportar.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Tocá el botón de exportar (ícono de descarga)</strong>
          <p>Está arriba a la derecha del reporte. Te da dos opciones:</p>
          <ul>
            <li><strong>Excel (.xlsx)</strong> — ideal para abrir en una planilla y seguir trabajando los datos</li>
            <li><strong>PDF</strong> — ideal para imprimir o mandar por WhatsApp/email</li>
          </ul>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>El archivo se descarga a tu dispositivo</strong>
          <p>Buscalo en la carpeta de descargas de tu celular o computadora.</p>
        </div>
      </div>

      <div class="help-tip">💡 En celulares, podés compartir el archivo directamente por WhatsApp o email tocando "Compartir".</div>
    `
  },
  {
    id: 'RE-04',
    slug: 'como-ver-productos-mas-vendidos',
    categoryId: 'reportes',
    title: 'Cómo ver los productos más vendidos',
    subtitle: 'Descubrí qué productos se venden más y cuáles generan más plata',
    tags: ['productos', 'más vendidos', 'ranking', 'top', 'ventas'],
    relatedArticles: ['RE-05', 'RE-01'],
    tutorialVideo: null,
    content: `
      <p>Saber qué se vende más te ayuda a decidir qué comprar, qué promocionar y qué dejar de lado.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Reportes → Productos más vendidos</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Elegí el período que querés analizar</strong>
          <p>Puede ser la última semana, mes, o un rango personalizado.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Revisá el ranking</strong>
          <p>Vas a ver una lista ordenada por cantidad vendida o por monto facturado. Podés alternar entre ambos criterios.</p>
        </div>
      </div>

      <div class="help-tip">💡 Usá este reporte antes de hacer un pedido a tu proveedor. Así sabés exactamente qué reponer primero.</div>
    `
  },
  {
    id: 'RE-05',
    slug: 'como-analizar-ventas-por-categoria',
    categoryId: 'reportes',
    title: 'Cómo analizar ventas por categoría de producto',
    subtitle: 'Mirá qué rubros son los más fuertes de tu negocio',
    tags: ['categoría', 'análisis', 'rubros', 'ventas', 'gráfico'],
    relatedArticles: ['RE-04', 'RE-06'],
    tutorialVideo: null,
    content: `
      <p>Este reporte te muestra cómo se distribuyen tus ventas entre las distintas categorías (Bebidas, Comidas, Limpieza, etc.).</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Reportes → Ventas por categoría</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Seleccioná el período</strong>
          <p>Aplicá el rango de fechas que quieras analizar.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Revisá el gráfico de torta y la tabla</strong>
          <p>El gráfico de torta te muestra el porcentaje de cada categoría. La tabla debajo tiene los montos exactos.</p>
        </div>
      </div>

      <div class="help-tip">💡 Si una categoría tiene muchas ventas pero poca ganancia, revisá los márgenes de esos productos.</div>
    `
  },
  {
    id: 'RE-06',
    slug: 'como-ver-analisis-detallado-producto',
    categoryId: 'reportes',
    title: 'Cómo ver el análisis detallado de un producto',
    subtitle: 'Toda la info de un producto: ventas, stock, historial y rentabilidad',
    tags: ['producto', 'detalle', 'análisis', 'rentabilidad', 'historial'],
    relatedArticles: ['RE-04', 'RE-05'],
    tutorialVideo: null,
    content: `
      <p>Necesitás saber todo sobre un producto en particular? QBITS te da el detalle completo.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Reportes → Análisis por producto</strong>
          <p>O desde el inventario, tocá un producto y elegí "Ver análisis".</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Buscá o seleccioná el producto</strong>
          <p>Podés buscarlo por nombre, código o categoría.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Revisá la ficha de análisis</strong>
          <p>Vas a encontrar:</p>
          <ul>
            <li>Unidades vendidas en el período</li>
            <li>Ingresos generados</li>
            <li>Margen de ganancia</li>
            <li>Historial de precios</li>
            <li>Stock actual y movimientos recientes</li>
          </ul>
        </div>
      </div>

      <div class="help-tip">💡 Este reporte es clave para decidir si un producto te conviene o no. Mirá el margen y las ventas juntos.</div>
    `
  }
]

// ── RESTAURANTE Y MESAS ──────────────────────────────────────────────────────
const restauranteArticles = [
  {
    id: 'RS-01',
    slug: 'como-disenar-mesas-salon',
    categoryId: 'restaurante',
    title: 'Cómo diseñar las mesas de tu salón',
    subtitle: 'Armá el plano de tu local con mesas, barras y sillas',
    tags: ['mesas', 'salón', 'plano', 'diseño', 'layout'],
    relatedArticles: ['RS-02', 'RS-03'],
    tutorialVideo: null,
    content: `
      <p>Antes de empezar a asignar pedidos a mesas, armá el plano de tu local en QBITS.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Restaurante → Configurar mesas</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "Agregar mesa"</strong>
          <p>Elegí la forma (cuadrada, redonda, rectangular) y la cantidad de asientos.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Arrastrá la mesa a su posición</strong>
          <p>Mové cada mesa en el plano para que coincida con tu salón real.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Asignale un nombre o número</strong>
          <p>Ej: "Mesa 1", "Barra", "Terraza 3". Así los mozos saben cuál es cuál.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">5</div>
        <div class="step-content">
          <strong>Guardá el diseño</strong>
          <p>Tocá "Guardar" y listo. Podés volver a editarlo en cualquier momento.</p>
        </div>
      </div>

      <div class="help-tip">💡 Podés tener distintos planos para cada sala o sector de tu local.</div>
    `
  },
  {
    id: 'RS-02',
    slug: 'como-crear-salas-sectores',
    categoryId: 'restaurante',
    title: 'Cómo crear salas o sectores',
    subtitle: 'Organizá tu local en áreas: salón principal, terraza, VIP, etc.',
    tags: ['salas', 'sectores', 'terraza', 'VIP', 'áreas'],
    relatedArticles: ['RS-01', 'RS-03'],
    tutorialVideo: null,
    content: `
      <p>Si tu local tiene distintas áreas (salón, terraza, patio, VIP), podés crear sectores separados en QBITS.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Restaurante → Configurar mesas</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "Agregar sala" o "Nuevo sector"</strong>
          <p>Ponele un nombre: "Salón principal", "Terraza", "Sector VIP", etc.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Agregá las mesas dentro de cada sala</strong>
          <p>Cada sala tiene su propio plano de mesas independiente.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Guardá los cambios</strong>
        </div>
      </div>

      <div class="help-tip">💡 En el tablero de mesas, podés cambiar entre salas con las pestañas de arriba.</div>
    `
  },
  {
    id: 'RS-03',
    slug: 'como-asignar-pedido-mesa',
    categoryId: 'restaurante',
    title: 'Cómo asignar un pedido a una mesa',
    subtitle: 'Vinculá la comanda con la mesa del cliente',
    tags: ['pedido', 'mesa', 'comanda', 'asignar', 'mozo'],
    relatedArticles: ['RS-01', 'RS-04'],
    tutorialVideo: null,
    content: `
      <p>Cuando un cliente se sienta en una mesa, vinculá su pedido para que la cocina y el mozo sepan a dónde va cada plato.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Desde el tablero de mesas, tocá la mesa del cliente</strong>
          <p>Las mesas libres aparecen en verde, las ocupadas en rojo.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "Nuevo pedido"</strong>
          <p>Se abre la pantalla de venta con la mesa ya asignada.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Cargá los productos del pedido</strong>
          <p>Agregá platos, bebidas, extras. Podés poner notas como "sin cebolla" o "bien cocido".</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Confirmá el pedido</strong>
          <p>La comanda se envía a cocina y la mesa cambia a estado "Ocupada".</p>
        </div>
      </div>

      <div class="help-tip">💡 Podés agregar más productos a la misma mesa después. Solo tocá la mesa y elegí "Agregar al pedido".</div>
    `
  },
  {
    id: 'RS-04',
    slug: 'como-transferir-pedido-otra-mesa',
    categoryId: 'restaurante',
    title: 'Cómo transferir un pedido a otra mesa',
    subtitle: 'Mové un pedido de una mesa a otra sin perder nada',
    tags: ['transferir', 'mover', 'mesa', 'cambio', 'pedido'],
    relatedArticles: ['RS-03', 'RS-05'],
    tutorialVideo: null,
    content: `
      <p>El cliente se cambió de mesa? No hace falta anular nada. Transferí el pedido en 3 toques.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Tocá la mesa que tiene el pedido activo</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "Transferir mesa" en las opciones</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Seleccioná la nueva mesa</strong>
          <p>Solo te muestra las mesas que están libres.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Confirmá la transferencia</strong>
          <p>El pedido completo se mueve a la nueva mesa. La mesa anterior queda libre.</p>
        </div>
      </div>

      <div class="help-tip">💡 También podés juntar dos mesas en una sola cuenta si un grupo se agranda.</div>
    `
  },
  {
    id: 'RS-05',
    slug: 'como-usar-tablero-comandas-kanban',
    categoryId: 'restaurante',
    title: 'Cómo usar el tablero de comandas (Kanban)',
    subtitle: 'Visualizá todas las comandas en un tablero tipo Kanban para cocina',
    tags: ['comandas', 'kanban', 'cocina', 'tablero', 'estados'],
    relatedArticles: ['RS-03', 'RS-06'],
    tutorialVideo: null,
    content: `
      <p>El tablero de comandas es la pantalla que va en la cocina. Muestra todos los pedidos organizados por estado.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Restaurante → Comandas</strong>
          <p>O abrí QBITS en la tablet de la cocina y entrá directo al tablero.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Vas a ver columnas con los estados</strong>
          <p>Las columnas típicas son: <strong>Pendiente</strong>, <strong>En preparación</strong> y <strong>Lista para servir</strong>.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Arrastrá las comandas entre columnas</strong>
          <p>Cuando la cocina empieza a preparar un pedido, movelo a "En preparación". Cuando esté listo, a "Lista para servir".</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>El mozo ve en tiempo real qué está listo</strong>
          <p>Desde su celular, el mozo ve cuándo la comanda cambia a "Lista para servir" y va a buscarla.</p>
        </div>
      </div>

      <div class="help-tip">💡 Cada comanda muestra el número de mesa, los platos pedidos y hace cuántos minutos se pidió.</div>
    `
  },
  {
    id: 'RS-06',
    slug: 'como-configurar-menu-digital-qr',
    categoryId: 'restaurante',
    title: 'Cómo configurar tu menú digital con QR',
    subtitle: 'Que tus clientes vean el menú desde su celular escaneando un QR',
    tags: ['menú', 'digital', 'QR', 'código', 'carta'],
    relatedArticles: ['RS-05', 'RS-07'],
    tutorialVideo: null,
    content: `
      <p>Ofrecé un menú digital que tus clientes escanean con el celular. Sin imprimir nada y siempre actualizado.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Restaurante → Menú digital</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Activá el menú digital</strong>
          <p>Tocá el switch para habilitarlo. QBITS genera automáticamente un link y un código QR.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Personalizá lo que se muestra</strong>
          <p>Elegí qué categorías y productos aparecen en el menú público. Podés ocultar los que no querés mostrar.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Descargá o imprimí el código QR</strong>
          <p>Ponelo en las mesas, en la vidriera o en la puerta del local.</p>
        </div>
      </div>

      <div class="help-tip">💡 Cada vez que cambies un precio o producto en QBITS, el menú digital se actualiza solo. No tenés que reimprimir nada.</div>
    `
  },
  {
    id: 'RS-07',
    slug: 'como-ver-ordenes-activas-restaurante',
    categoryId: 'restaurante',
    title: 'Cómo ver las órdenes activas del restaurante',
    subtitle: 'Controlá en tiempo real todos los pedidos abiertos',
    tags: ['órdenes', 'activas', 'pedidos', 'abiertos', 'control'],
    relatedArticles: ['RS-03', 'RS-05'],
    tutorialVideo: null,
    content: `
      <p>Necesitás saber qué pedidos hay abiertos en este momento? La vista de órdenes activas te lo muestra todo.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Restaurante → Órdenes activas</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Revisá la lista de pedidos abiertos</strong>
          <p>Cada orden muestra: número de mesa, productos, estado (pendiente, en preparación, listo) y tiempo transcurrido.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Tocá una orden para ver el detalle</strong>
          <p>Podés agregar productos, cambiar estados o cerrar la cuenta desde ahí.</p>
        </div>
      </div>

      <div class="help-tip">💡 Las órdenes que llevan mucho tiempo se marcan en rojo para que les prestes atención.</div>
    `
  }
]

// ── DELIVERY Y ENTREGAS ──────────────────────────────────────────────────────
const deliveryArticles = [
  {
    id: 'DL-01',
    slug: 'como-agregar-repartidores',
    categoryId: 'delivery',
    title: 'Cómo agregar repartidores',
    subtitle: 'Registrá a tu equipo de delivery para asignarles entregas',
    tags: ['repartidores', 'delivery', 'agregar', 'equipo', 'motorizado'],
    relatedArticles: ['DL-02', 'DL-03'],
    tutorialVideo: null,
    content: `
      <p>Antes de usar el módulo de delivery, registrá a tus repartidores.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Delivery → Repartidores</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "Agregar repartidor"</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Completá los datos</strong>
          <p>Nombre, teléfono y medio de transporte (moto, bici, auto). Opcionalmente, podés subir una foto.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Guardá</strong>
          <p>El repartidor ya queda disponible para asignarle entregas.</p>
        </div>
      </div>

      <div class="help-tip">💡 Podés marcar repartidores como "activos" o "inactivos" si alguno no está trabajando ese día.</div>
    `
  },
  {
    id: 'DL-02',
    slug: 'como-crear-ruta-delivery',
    categoryId: 'delivery',
    title: 'Cómo crear una ruta de delivery',
    subtitle: 'Organizá las entregas del día en rutas eficientes',
    tags: ['ruta', 'delivery', 'crear', 'entregas', 'recorrido'],
    relatedArticles: ['DL-01', 'DL-03'],
    tutorialVideo: null,
    content: `
      <p>Las rutas agrupan varias entregas para un mismo repartidor. Así optimizás los viajes.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Delivery → Rutas</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "Nueva ruta"</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Asignale un repartidor</strong>
          <p>Elegí quién va a hacer esta ruta de la lista de repartidores activos.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Guardá la ruta</strong>
          <p>Ahora podés agregarle facturas/pedidos para entregar.</p>
        </div>
      </div>

      <div class="help-tip">💡 Podés crear varias rutas por día, una para cada repartidor o zona de la ciudad.</div>
    `
  },
  {
    id: 'DL-03',
    slug: 'como-asignar-facturas-a-ruta',
    categoryId: 'delivery',
    title: 'Cómo asignar facturas a una ruta',
    subtitle: 'Agregá pedidos pendientes de entrega a la ruta del repartidor',
    tags: ['facturas', 'ruta', 'asignar', 'pedidos', 'entrega'],
    relatedArticles: ['DL-02', 'DL-04'],
    tutorialVideo: null,
    content: `
      <p>Una vez creada la ruta, agregale las facturas o pedidos que tiene que entregar el repartidor.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Abrí la ruta que acabás de crear</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "Agregar entregas"</strong>
          <p>QBITS te muestra las facturas pendientes de entrega.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Seleccioná las facturas que van en esta ruta</strong>
          <p>Podés filtrar por zona, cliente o fecha para encontrarlas rápido.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Confirmá</strong>
          <p>Las facturas quedan asignadas a la ruta y al repartidor.</p>
        </div>
      </div>

      <div class="help-tip">💡 QBITS ordena las entregas automáticamente por cercanía para optimizar el recorrido.</div>
    `
  },
  {
    id: 'DL-04',
    slug: 'como-iniciar-ruta-delivery',
    categoryId: 'delivery',
    title: 'Cómo iniciar una ruta de delivery',
    subtitle: 'Poné en marcha la ruta para que el repartidor salga a entregar',
    tags: ['iniciar', 'ruta', 'comenzar', 'delivery', 'salir'],
    relatedArticles: ['DL-03', 'DL-05'],
    tutorialVideo: null,
    content: `
      <p>Cuando la ruta ya tiene sus entregas cargadas, iniciala para que empiece el seguimiento.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Abrí la ruta desde Delivery → Rutas</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Revisá que estén todas las entregas cargadas</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Tocá "Iniciar ruta"</strong>
          <p>La ruta pasa a estado "En curso" y arranca el timer de seguimiento.</p>
        </div>
      </div>

      <div class="help-tip">💡 El repartidor también puede iniciar la ruta desde su celular si tiene acceso a QBITS.</div>
    `
  },
  {
    id: 'DL-05',
    slug: 'como-registrar-entrega-delivery',
    categoryId: 'delivery',
    title: 'Cómo registrar una entrega completada',
    subtitle: 'Marcá cada entrega como realizada cuando el repartidor la complete',
    tags: ['entrega', 'completar', 'registrar', 'confirmar', 'delivery'],
    relatedArticles: ['DL-04', 'DL-06'],
    tutorialVideo: null,
    content: `
      <p>A medida que el repartidor entrega, marcá cada pedido como completado.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Desde la ruta activa, tocá la entrega que se completó</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "Marcar como entregado"</strong>
          <p>Opcionalmente, podés registrar una nota: "Recibió la vecina", "Dejado en portería", etc.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Si cobraste en la entrega, registrá el pago</strong>
          <p>Indicá el monto y el método de pago (efectivo, transferencia, etc.).</p>
        </div>
      </div>

      <div class="help-tip">💡 El repartidor puede marcar entregas desde su propio celular, así vos ves el avance en tiempo real.</div>
    `
  },
  {
    id: 'DL-06',
    slug: 'como-monitorear-delivery-tiempo-real',
    categoryId: 'delivery',
    title: 'Cómo monitorear las entregas en tiempo real',
    subtitle: 'Seguí el avance de cada ruta y repartidor desde tu pantalla',
    tags: ['monitorear', 'tiempo real', 'seguimiento', 'mapa', 'delivery'],
    relatedArticles: ['DL-04', 'DL-07'],
    tutorialVideo: null,
    content: `
      <p>Desde el panel de delivery podés ver cómo van todas las entregas del día sin moverte de tu local.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Delivery → Monitor</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Vas a ver el estado de cada ruta activa</strong>
          <p>Cuántas entregas faltan, cuántas se completaron, y el tiempo transcurrido.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Tocá una ruta para ver el detalle</strong>
          <p>Ves cada entrega individual con su estado: pendiente, entregada, o con problemas.</p>
        </div>
      </div>

      <div class="help-tip">💡 Si una entrega se demora mucho, QBITS la resalta en rojo para que la revises.</div>
    `
  },
  {
    id: 'DL-07',
    slug: 'como-ver-historial-entregas',
    categoryId: 'delivery',
    title: 'Cómo ver el historial de entregas',
    subtitle: 'Consultá todas las entregas pasadas con filtros por fecha y repartidor',
    tags: ['historial', 'entregas', 'registro', 'pasadas', 'consultar'],
    relatedArticles: ['DL-05', 'DL-06'],
    tutorialVideo: null,
    content: `
      <p>Necesitás revisar entregas de días anteriores? El historial tiene todo registrado.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Delivery → Historial</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Filtrá por fecha, repartidor o estado</strong>
          <p>Podés buscar entregas de un día específico, de un repartidor particular, o las que tuvieron algún problema.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Tocá una entrega para ver su detalle</strong>
          <p>Vas a encontrar: factura, cliente, dirección, hora de entrega, quién la hizo, y las notas que se dejaron.</p>
        </div>
      </div>

      <div class="help-tip">💡 Usá el historial para evaluar el rendimiento de cada repartidor y detectar zonas con más demoras.</div>
    `
  }
]

// ── CONFIGURACIÓN ────────────────────────────────────────────────────────────
const configuracionArticles = [
  {
    id: 'CF-10',
    slug: 'como-editar-datos-empresa',
    categoryId: 'configuracion',
    title: 'Cómo editar los datos de tu empresa',
    subtitle: 'Actualizá nombre, RUC/CUIT, dirección y logo de tu negocio',
    tags: ['empresa', 'datos', 'nombre', 'RUC', 'CUIT', 'logo'],
    relatedArticles: ['CF-11', 'CF-12'],
    tutorialVideo: null,
    content: `
      <p>Los datos de tu empresa aparecen en las facturas, reportes y el menú digital. Mantenelos actualizados.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Configuración → Datos de empresa</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Editá los campos que necesites</strong>
          <p>Nombre comercial, razón social, RUC/CUIT, dirección, teléfono, email y logo.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Para cambiar el logo, tocá la imagen actual</strong>
          <p>Subí una imagen en formato PNG o JPG. Se recomienda fondo transparente.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Guardá los cambios</strong>
          <p>Los nuevos datos se aplican automáticamente a facturas y documentos.</p>
        </div>
      </div>

      <div class="help-tip">💡 Si tenés varias sucursales, cada una puede tener su propia dirección y teléfono.</div>
    `
  },
  {
    id: 'CF-11',
    slug: 'como-agregar-sucursal',
    categoryId: 'configuracion',
    title: 'Cómo agregar una sucursal nueva',
    subtitle: 'Expandí tu negocio agregando puntos de venta adicionales',
    tags: ['sucursal', 'agregar', 'nueva', 'punto de venta', 'local'],
    relatedArticles: ['CF-10', 'CF-12'],
    tutorialVideo: null,
    content: `
      <p>Si abriste un nuevo local o punto de venta, agregalo como sucursal en QBITS.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Configuración → Sucursales</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "Agregar sucursal"</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Completá los datos de la sucursal</strong>
          <p>Nombre, dirección, teléfono. Opcionalmente, podés asignarle una caja y empleados específicos.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Guardá</strong>
          <p>La sucursal ya está activa. Los reportes y el inventario se pueden filtrar por sucursal.</p>
        </div>
      </div>

      <div class="help-tip">💡 Cada sucursal maneja su propio stock. Podés hacer transferencias de inventario entre sucursales.</div>
    `
  },
  {
    id: 'CF-12',
    slug: 'como-configurar-impuestos',
    categoryId: 'configuracion',
    title: 'Cómo configurar impuestos (IVA, ITBIS, etc.)',
    subtitle: 'Definí los impuestos que aplican en tu país y a tus productos',
    tags: ['impuestos', 'IVA', 'ITBIS', 'impuesto', 'fiscal', 'tasa'],
    relatedArticles: ['CF-10', 'CF-13'],
    tutorialVideo: null,
    content: `
      <p>QBITS necesita saber qué impuestos aplican para calcularlos correctamente en cada venta.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Configuración → Impuestos</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Revisá los impuestos precargados</strong>
          <p>QBITS ya trae configurados los impuestos más comunes de tu país (IVA 21%, IVA 10.5%, Exento, etc.).</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Editá o agregá los que necesites</strong>
          <p>Tocá "Agregar impuesto" para crear uno nuevo. Poné el nombre y el porcentaje.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Asigná el impuesto por defecto</strong>
          <p>Elegí cuál se aplica automáticamente a los productos nuevos.</p>
        </div>
      </div>

      <div class="help-tip">💡 Podés asignar impuestos distintos a cada producto desde su ficha individual.</div>
    `
  },
  {
    id: 'CF-13',
    slug: 'como-conectar-impresora-termica',
    categoryId: 'configuracion',
    title: 'Cómo conectar una impresora térmica',
    subtitle: 'Configurá tu impresora de tickets para imprimir facturas y recibos',
    tags: ['impresora', 'térmica', 'tickets', 'conectar', 'bluetooth', 'USB'],
    relatedArticles: ['CF-12', 'CF-14'],
    tutorialVideo: null,
    content: `
      <p>Conectá tu impresora de tickets para imprimir facturas directamente desde QBITS.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Configuración → Impresora</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Elegí el tipo de conexión</strong>
          <p><strong>Bluetooth:</strong> Asegurate de que la impresora esté encendida y en modo de emparejamiento. <strong>USB:</strong> Conectá el cable directamente. <strong>WiFi:</strong> La impresora y tu dispositivo deben estar en la misma red.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Tocá "Buscar impresora"</strong>
          <p>QBITS va a detectar las impresoras disponibles. Seleccioná la tuya.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Hacé una impresión de prueba</strong>
          <p>Tocá "Imprimir prueba" para verificar que todo funcione bien.</p>
        </div>
      </div>

      <div class="help-tip">💡 Las impresoras térmicas más comunes (58mm y 80mm) son compatibles. Si tenés problemas, revisá que tu impresora esté en la lista de compatibilidad.</div>
    `
  },
  {
    id: 'CF-14',
    slug: 'como-configurar-menu-catalogo-digital',
    categoryId: 'configuracion',
    title: 'Cómo configurar tu menú o catálogo digital',
    subtitle: 'Creá una vitrina online de tus productos accesible por link o QR',
    tags: ['menú', 'catálogo', 'digital', 'online', 'vitrina', 'link'],
    relatedArticles: ['RS-06', 'CF-13'],
    tutorialVideo: null,
    content: `
      <p>Más allá del menú de restaurante, podés armar un catálogo digital para cualquier tipo de negocio.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Configuración → Catálogo digital</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Activá el catálogo</strong>
          <p>Se genera un link público tipo <em>qbits.app/tunegocio</em> y un código QR.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Elegí qué productos se muestran</strong>
          <p>Por defecto se muestran todos. Podés ocultar productos o categorías enteras.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Personalizá colores y logo</strong>
          <p>Adaptá el catálogo a la identidad visual de tu marca.</p>
        </div>
      </div>

      <div class="help-tip">💡 Compartí el link en tus redes sociales, WhatsApp Business o tarjetas de presentación.</div>
    `
  },
  {
    id: 'CF-15',
    slug: 'como-configurar-integraciones-externas',
    categoryId: 'configuracion',
    title: 'Cómo configurar integraciones externas',
    subtitle: 'Conectá QBITS con otros sistemas y plataformas',
    tags: ['integraciones', 'API', 'conectar', 'externo', 'plataformas'],
    relatedArticles: ['CF-14', 'CF-16'],
    tutorialVideo: null,
    content: `
      <p>QBITS se puede conectar con otros servicios para automatizar procesos.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Configuración → Integraciones</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Revisá las integraciones disponibles</strong>
          <p>Vas a ver opciones como: WhatsApp Business, pasarelas de pago, facturación electrónica, contabilidad y más.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Tocá la integración que querés activar</strong>
          <p>Cada una tiene su propio proceso de configuración. Seguí las instrucciones en pantalla.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Probá la conexión</strong>
          <p>Usá el botón "Probar conexión" para verificar que todo esté bien configurado.</p>
        </div>
      </div>

      <div class="help-tip">💡 Si necesitás una integración que no está listada, contactá a soporte. Estamos agregando nuevas todo el tiempo.</div>
    `
  },
  {
    id: 'CF-16',
    slug: 'como-configurar-tasas-cambio',
    categoryId: 'configuracion',
    title: 'Cómo configurar tasas de cambio',
    subtitle: 'Manejá varias monedas y definí la tasa del día',
    tags: ['tasas', 'cambio', 'moneda', 'dólar', 'divisa', 'conversión'],
    relatedArticles: ['CF-12', 'CF-15'],
    tutorialVideo: null,
    content: `
      <p>Si tu negocio maneja más de una moneda (pesos y dólares, por ejemplo), configurá las tasas de cambio.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Configuración → Monedas y tasas</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Activá las monedas que usás</strong>
          <p>La moneda principal ya está configurada. Agregá monedas secundarias (USD, EUR, etc.).</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Definí la tasa de cambio del día</strong>
          <p>Ingresá el valor de compra y venta para cada moneda.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Guardá</strong>
          <p>La tasa se aplica automáticamente en las ventas y reportes que usen esa moneda.</p>
        </div>
      </div>

      <div class="help-tip">💡 Podés actualizar la tasa cada día desde este mismo lugar. QBITS guarda el historial de tasas anteriores.</div>
    `
  }
]

// ── USUARIOS Y ACCESOS ───────────────────────────────────────────────────────
const usuariosArticles = [
  {
    id: 'UA-01',
    slug: 'como-agregar-empleado',
    categoryId: 'usuarios',
    title: 'Cómo agregar un empleado',
    subtitle: 'Creá usuarios para tu equipo de trabajo',
    tags: ['empleado', 'usuario', 'agregar', 'equipo', 'personal'],
    relatedArticles: ['UA-02', 'UA-03'],
    tutorialVideo: null,
    content: `
      <p>Cada persona que use QBITS en tu negocio necesita su propio usuario.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Usuarios → Empleados</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "Agregar empleado"</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Completá los datos</strong>
          <p>Nombre, email, teléfono. Asignale un rol (cajero, administrador, mozo, etc.).</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Definí su contraseña inicial</strong>
          <p>El empleado puede cambiarla después desde su perfil.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">5</div>
        <div class="step-content">
          <strong>Guardá</strong>
          <p>El empleado ya puede iniciar sesión con sus credenciales.</p>
        </div>
      </div>

      <div class="help-tip">💡 Asignale la sucursal correcta al empleado para que solo vea los datos de su local.</div>
    `
  },
  {
    id: 'UA-02',
    slug: 'como-crear-roles-permisos',
    categoryId: 'usuarios',
    title: 'Cómo crear roles y permisos',
    subtitle: 'Controlá qué puede ver y hacer cada tipo de usuario',
    tags: ['roles', 'permisos', 'acceso', 'seguridad', 'control'],
    relatedArticles: ['UA-01', 'UA-03'],
    tutorialVideo: null,
    content: `
      <p>Los roles definen qué puede y qué no puede hacer cada empleado dentro de QBITS.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Usuarios → Roles</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "Crear rol"</strong>
          <p>Ponele un nombre descriptivo: "Cajero", "Mozo", "Supervisor", "Solo lectura", etc.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Marcá los permisos de cada módulo</strong>
          <p>Para cada sección (Ventas, Inventario, Caja, Reportes, etc.) elegí: <strong>Acceso total</strong>, <strong>Solo ver</strong> o <strong>Sin acceso</strong>.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Guardá el rol</strong>
          <p>Ahora podés asignárselo a los empleados que correspondan.</p>
        </div>
      </div>

      <div class="help-tip">💡 Consejo: creá un rol "Cajero" que solo tenga acceso a Ventas y Caja. Así evitás que alguien toque el inventario o los reportes sin querer.</div>
    `
  },
  {
    id: 'UA-03',
    slug: 'como-registrar-vendedores',
    categoryId: 'usuarios',
    title: 'Cómo registrar vendedores',
    subtitle: 'Asigná vendedores a las ventas para comisiones y seguimiento',
    tags: ['vendedores', 'comisiones', 'registrar', 'asignar', 'ventas'],
    relatedArticles: ['UA-01', 'UA-04'],
    tutorialVideo: null,
    content: `
      <p>Si pagás comisiones o querés saber quién vende más, registrá a tus vendedores.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Usuarios → Vendedores</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "Agregar vendedor"</strong>
          <p>Puede ser un empleado existente o alguien nuevo.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Configurá la comisión (opcional)</strong>
          <p>Podés definir un porcentaje de comisión que se calcule automáticamente por cada venta.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Guardá</strong>
          <p>Ahora, al hacer una venta, podés seleccionar qué vendedor la hizo.</p>
        </div>
      </div>

      <div class="help-tip">💡 En los reportes podés filtrar ventas por vendedor para ver el rendimiento de cada uno.</div>
    `
  },
  {
    id: 'UA-04',
    slug: 'como-editar-perfil-usuario',
    categoryId: 'usuarios',
    title: 'Cómo editar tu perfil de usuario',
    subtitle: 'Cambiá tu nombre, foto, contraseña y datos personales',
    tags: ['perfil', 'editar', 'contraseña', 'foto', 'datos'],
    relatedArticles: ['UA-01', 'UA-05'],
    tutorialVideo: null,
    content: `
      <p>Cada usuario puede editar su propio perfil sin necesitar al administrador.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Tocá tu avatar o nombre en la esquina superior</strong>
          <p>Se abre el menú de usuario.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Elegí "Mi perfil"</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Editá lo que necesites</strong>
          <p>Podés cambiar: nombre, foto de perfil, email, teléfono y contraseña.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Guardá los cambios</strong>
        </div>
      </div>

      <div class="help-tip">💡 Para cambiar la contraseña, necesitás ingresar la contraseña actual primero por seguridad.</div>
    `
  },
  {
    id: 'UA-05',
    slug: 'como-cambiar-empresa-cuenta',
    categoryId: 'usuarios',
    title: 'Cómo cambiar de empresa en tu cuenta',
    subtitle: 'Si administrás más de un negocio, cambiá entre ellos fácilmente',
    tags: ['empresa', 'cambiar', 'cuenta', 'negocio', 'multi-empresa'],
    relatedArticles: ['UA-04', 'CF-07'],
    tutorialVideo: null,
    content: `
      <p>QBITS permite manejar varias empresas desde una sola cuenta. Podés cambiar entre ellas sin cerrar sesión.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Tocá tu avatar o nombre en la esquina superior</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "Cambiar empresa"</strong>
          <p>Vas a ver la lista de empresas asociadas a tu cuenta.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Seleccioná la empresa a la que querés entrar</strong>
          <p>QBITS cambia automáticamente todos los datos, inventario y reportes a los de esa empresa.</p>
        </div>
      </div>

      <div class="help-tip">💡 Cada empresa tiene su propio inventario, clientes, caja y configuración. Son completamente independientes.</div>
    `
  }
]

// ── SUSCRIPCIÓN Y PLANES ─────────────────────────────────────────────────────
const suscripcionArticles = [
  {
    id: 'SU-01',
    slug: 'planes-qbits-free-basico-premium',
    categoryId: 'suscripcion',
    title: 'Planes de QBITS: Free, Básico y Premium',
    subtitle: 'Conocé qué incluye cada plan y elegí el que mejor te sirva',
    tags: ['planes', 'free', 'básico', 'premium', 'precios', 'suscripción'],
    relatedArticles: ['SU-02', 'SU-05'],
    tutorialVideo: null,
    content: `
      <p>QBITS tiene tres planes para que elijas según el tamaño y las necesidades de tu negocio.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Plan Free (Gratis)</strong>
          <p>Ideal para arrancar. Incluye: punto de venta básico, hasta cierta cantidad de productos, 1 usuario, y funciones esenciales de facturación.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Plan Básico</strong>
          <p>Para negocios en crecimiento. Suma: más productos, más usuarios, reportes avanzados, gestión de inventario completa, y soporte prioritario.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Plan Premium</strong>
          <p>Todo ilimitado. Incluye: productos y usuarios sin límite, módulo de restaurante, delivery, multi-sucursal, integraciones, catálogo digital y soporte dedicado.</p>
        </div>
      </div>

      <div class="help-tip">💡 Podés empezar con el plan Free y actualizar en cualquier momento sin perder datos.</div>
    `
  },
  {
    id: 'SU-02',
    slug: 'como-contratar-actualizar-plan',
    categoryId: 'suscripcion',
    title: 'Cómo contratar o actualizar tu plan',
    subtitle: 'Pasate a un plan superior para desbloquear más funciones',
    tags: ['contratar', 'actualizar', 'upgrade', 'plan', 'pagar'],
    relatedArticles: ['SU-01', 'SU-03'],
    tutorialVideo: null,
    content: `
      <p>Necesitás más funciones? Actualizá tu plan en cualquier momento.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Configuración → Mi suscripción</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "Cambiar plan" o "Actualizar"</strong>
          <p>Vas a ver la comparación entre planes con lo que incluye cada uno.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Elegí el plan que querés</strong>
          <p>Seleccioná si querés pago mensual o anual (el anual tiene descuento).</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Ingresá el método de pago</strong>
          <p>Tarjeta de crédito/débito o los métodos disponibles en tu país.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">5</div>
        <div class="step-content">
          <strong>Confirmá</strong>
          <p>Las funciones nuevas se activan al instante. No hay que esperar.</p>
        </div>
      </div>

      <div class="help-tip">💡 Si actualizás a mitad de mes, se te cobra solo la diferencia proporcional.</div>
    `
  },
  {
    id: 'SU-03',
    slug: 'como-cancelar-suscripcion',
    categoryId: 'suscripcion',
    title: 'Cómo cancelar tu suscripción',
    subtitle: 'Si necesitás dar de baja, acá te explicamos el proceso',
    tags: ['cancelar', 'baja', 'suscripción', 'desuscribir', 'cuenta'],
    relatedArticles: ['SU-02', 'SU-04'],
    tutorialVideo: null,
    content: `
      <p>Esperamos que no, pero si necesitás cancelar, el proceso es simple y transparente.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Configuración → Mi suscripción</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Tocá "Cancelar suscripción"</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Te preguntamos por qué te vas (opcional)</strong>
          <p>Tu feedback nos ayuda a mejorar QBITS.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Confirmá la cancelación</strong>
          <p>Tu plan sigue activo hasta el final del período pagado. Después, tu cuenta pasa al plan Free.</p>
        </div>
      </div>

      <div class="help-tip">💡 Tus datos no se borran al cancelar. Si volvés, todo sigue ahí esperándote.</div>
    `
  },
  {
    id: 'SU-04',
    slug: 'pago-rechazado-que-hacer',
    categoryId: 'suscripcion',
    title: 'Mi pago fue rechazado, ¿qué hago?',
    subtitle: 'Solucioná problemas con el cobro de tu suscripción',
    tags: ['pago', 'rechazado', 'error', 'tarjeta', 'cobro', 'problema'],
    relatedArticles: ['SU-02', 'SU-05'],
    tutorialVideo: null,
    content: `
      <p>Si el pago de tu suscripción falló, no te preocupes. Hay varias razones posibles y todas tienen solución.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Revisá el email de notificación</strong>
          <p>QBITS te envía un mail con el motivo del rechazo (fondos insuficientes, tarjeta vencida, etc.).</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Andá a Configuración → Mi suscripción → Método de pago</strong>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Actualizá o cambiá tu tarjeta</strong>
          <p>Podés poner una tarjeta diferente o corregir los datos de la actual.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Tocá "Reintentar pago"</strong>
          <p>QBITS intenta cobrar de nuevo. Si funciona, tu suscripción se reactiva al instante.</p>
        </div>
      </div>

      <div class="help-tip">💡 Tenés un período de gracia de algunos días antes de que se suspendan funciones premium. Actualizá el pago antes de que venza.</div>
    `
  },
  {
    id: 'SU-05',
    slug: 'limites-por-plan-que-incluye-cada-uno',
    categoryId: 'suscripcion',
    title: 'Límites por plan: qué incluye cada uno',
    subtitle: 'Detalle de productos, usuarios, sucursales y funciones por plan',
    tags: ['límites', 'plan', 'productos', 'usuarios', 'funciones', 'comparar'],
    relatedArticles: ['SU-01', 'SU-02'],
    tutorialVideo: null,
    content: `
      <p>Acá te dejamos un resumen de lo que incluye cada plan para que compares fácilmente.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Plan Free</strong>
          <ul>
            <li>Hasta 50 productos</li>
            <li>1 usuario</li>
            <li>1 sucursal</li>
            <li>Facturación básica</li>
            <li>Soporte por email</li>
          </ul>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Plan Básico</strong>
          <ul>
            <li>Hasta 500 productos</li>
            <li>Hasta 3 usuarios</li>
            <li>1 sucursal</li>
            <li>Inventario completo + reportes</li>
            <li>Impresora térmica</li>
            <li>Soporte prioritario</li>
          </ul>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Plan Premium</strong>
          <ul>
            <li>Productos ilimitados</li>
            <li>Usuarios ilimitados</li>
            <li>Multi-sucursal</li>
            <li>Restaurante, delivery, catálogo digital</li>
            <li>Integraciones externas</li>
            <li>Soporte dedicado + asistente IA</li>
          </ul>
        </div>
      </div>

      <div class="help-tip">💡 Si estás cerca del límite de tu plan, QBITS te avisa antes de que se llene. Así podés decidir si actualizar o limpiar datos.</div>
    `
  }
]

// ── CONTACTO Y SOPORTE ───────────────────────────────────────────────────────
const soporteArticles = [
  {
    id: 'SO-01',
    slug: 'como-abrir-ticket-soporte',
    categoryId: 'soporte',
    title: 'Cómo abrir un ticket de soporte',
    subtitle: 'Reportá un problema o hacé una consulta al equipo de QBITS',
    tags: ['ticket', 'soporte', 'consulta', 'problema', 'ayuda'],
    relatedArticles: ['SO-02', 'SO-04'],
    tutorialVideo: null,
    content: `
      <p>Si algo no funciona como esperabas o tenés una duda que no está en la ayuda, abrí un ticket.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Ayuda → Contactar soporte</strong>
          <p>O tocá el ícono de "?" que aparece en la esquina inferior.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Elegí el tipo de consulta</strong>
          <p>Problema técnico, consulta de uso, sugerencia, facturación, etc.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Describí el problema con detalle</strong>
          <p>Mientras más detalle des, más rápido lo resolvemos. Si podés, adjuntá una captura de pantalla.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Enviá el ticket</strong>
          <p>Recibís un número de ticket por email. Te respondemos dentro de las 24 horas hábiles.</p>
        </div>
      </div>

      <div class="help-tip">💡 Los usuarios con plan Premium tienen soporte prioritario y respuesta más rápida.</div>
    `
  },
  {
    id: 'SO-02',
    slug: 'como-usar-asistente-ia-qbits',
    categoryId: 'soporte',
    title: 'Cómo usar el asistente IA de QBITS',
    subtitle: 'Tu ayudante inteligente disponible 24/7 desde la burbuja flotante',
    tags: ['IA', 'asistente', 'inteligencia artificial', 'chat', 'burbuja', 'QBITS'],
    relatedArticles: ['SO-01', 'SO-03'],
    tutorialVideo: null,
    content: `
      <p>QBITS tiene un asistente de inteligencia artificial integrado que te ayuda en tiempo real. Está siempre ahí, flotando en la esquina inferior derecha.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Tocá la burbuja flotante en la esquina inferior derecha</strong>
          <p>Es el ícono de chat que ves siempre. Al tocarlo se abre el asistente IA de QBITS.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Escribí tu consulta o pregunta</strong>
          <p>Podés preguntar cualquier cosa: "¿Cómo hago una nota de crédito?", "¿Dónde veo las ventas del mes?", "¿Cómo agrego un producto?". El asistente entiende lenguaje natural.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Usá los botones especiales del chat</strong>
          <p>Además de escribir, tenés herramientas poderosas:</p>
          <ul>
            <li>📷 <strong>Botón de cámara:</strong> Sacá una foto de una factura, ticket o documento y el asistente lo analiza por vos. Ideal para cargar datos rápido o consultar sobre un comprobante.</li>
            <li>🎤 <strong>Botón de micrófono:</strong> Hablá en vez de escribir. El asistente transcribe tu audio y te responde.</li>
            <li>📎 <strong>Botón de adjuntar:</strong> Enviá archivos (PDF, imágenes, Excel) para que el asistente los procese o te ayude con ellos.</li>
          </ul>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>El asistente te responde al instante</strong>
          <p>Te da la respuesta, te guía paso a paso, o te redirige al artículo de ayuda correspondiente.</p>
        </div>
      </div>

      <div class="help-tip">💡 El asistente IA está disponible 24/7 y aprende del contexto de tu negocio. Cuanto más lo uses, mejores respuestas te da.</div>
    `
  },
  {
    id: 'SO-03',
    slug: 'preguntas-frecuentes-faq',
    categoryId: 'soporte',
    title: 'Preguntas frecuentes (FAQ)',
    subtitle: 'Las dudas más comunes de nuestros usuarios, resueltas',
    tags: ['FAQ', 'preguntas', 'frecuentes', 'dudas', 'comunes'],
    relatedArticles: ['SO-01', 'SO-02'],
    tutorialVideo: null,
    content: `
      <p>Acá te dejamos las respuestas a las preguntas que más nos hacen.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>¿QBITS funciona sin internet?</strong>
          <p>Algunas funciones básicas sí (como consultar inventario en caché), pero para vender y facturar necesitás conexión a internet.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>¿Puedo usar QBITS desde la computadora?</strong>
          <p>Sí, QBITS funciona en celulares, tablets y computadoras desde el navegador web en <em>app.qbits.app</em>.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>¿Mis datos están seguros?</strong>
          <p>Sí. Usamos encriptación de extremo a extremo y servidores seguros. Tus datos son tuyos y nadie más accede a ellos.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>¿Puedo migrar datos de otro sistema?</strong>
          <p>Sí, QBITS permite importar productos y clientes desde archivos Excel. Contactá soporte si necesitás ayuda con la migración.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">5</div>
        <div class="step-content">
          <strong>¿Qué pasa si cancelo mi suscripción?</strong>
          <p>Tu cuenta baja al plan Free. No perdés datos, solo el acceso a funciones premium.</p>
        </div>
      </div>

      <div class="help-tip">💡 ¿Tu pregunta no está acá? Preguntale al asistente IA o abrí un ticket de soporte.</div>
    `
  },
  {
    id: 'SO-04',
    slug: 'como-reportar-error-bug',
    categoryId: 'soporte',
    title: 'Cómo reportar un error o bug',
    subtitle: 'Ayudanos a mejorar QBITS reportando problemas técnicos',
    tags: ['error', 'bug', 'reportar', 'problema', 'técnico', 'fallo'],
    relatedArticles: ['SO-01', 'SO-02'],
    tutorialVideo: null,
    content: `
      <p>¿Encontraste algo que no funciona bien? Reportalo y lo arreglamos lo antes posible.</p>

      <div class="help-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong>Andá a Ayuda → Reportar error</strong>
          <p>O desde el asistente IA, escribí "quiero reportar un error".</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong>Describí qué pasó</strong>
          <p>Contanos qué estabas haciendo, qué esperabas que pase, y qué pasó en realidad.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong>Adjuntá una captura o grabación de pantalla</strong>
          <p>Si podés capturar el error en una imagen o video corto, nos ayuda muchísimo a entender el problema.</p>
        </div>
      </div>

      <div class="help-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <strong>Enviá el reporte</strong>
          <p>Nuestro equipo técnico lo revisa y te contacta si necesita más info. Los bugs críticos se priorizan automáticamente.</p>
        </div>
      </div>

      <div class="help-tip">💡 Los usuarios que reportan bugs ayudan a que QBITS sea mejor para todos. Agradecemos cada reporte.</div>
    `
  }
]

// ─── ALL ARTICLES (combined) ──────────────────────────────────────────────────

export const allArticles = [
  ...primeroPasosArticles,
  ...puntoDeVentaArticles,
  ...inventarioArticles,
  ...comprasArticles,
  ...clientesArticles,
  ...cajaFinanzasArticles,
  ...reportesArticles,
  ...restauranteArticles,
  ...deliveryArticles,
  ...configuracionArticles,
  ...usuariosArticles,
  ...suscripcionArticles,
  ...soporteArticles
]

// ─── FEATURED ARTICLES ────────────────────────────────────────────────────────

export const featuredArticles = ['PV-01', 'CL-01', 'RE-01', 'PS-05', 'CF-05', 'PV-04']

// ─── SEARCH ───────────────────────────────────────────────────────────────────

export function searchArticles (query) {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return allArticles.filter(article => {
    const title = (article.title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const subtitle = (article.subtitle || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const tags = (article.tags || []).join(' ').toLowerCase()
    return title.includes(q) || subtitle.includes(q) || tags.includes(q)
  })
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function getCategoryById (id) {
  return helpCategories.find(c => c.id === id) || null
}

export function getArticlesByCategory (categoryId) {
  return allArticles.filter(a => a.categoryId === categoryId)
}

export function getArticleBySlug (slug) {
  return allArticles.find(a => a.slug === slug) || null
}

export function getRelatedArticles (ids) {
  if (!ids || !ids.length) return []
  return ids.map(id => allArticles.find(a => a.id === id)).filter(Boolean)
}
