const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        meta: { requiresAuth: true },
        name: 'Home',
        component: () => import('pages/HomePage.vue')
      },
      {
        path: 'billing',
        meta: { requiresAuth: true },
        name: 'Billing',
        component: () => import('pages/BillingPage.vue')
      },
      {
        path: 'products',
        meta: { requiresAuth: true },
        name: 'Product',
        component: () => import('pages/ProductPage.vue')
      },
      {
        path: 'promotions',
        meta: { requiresAuth: true },
        name: 'Promotion',
        component: () => import('pages/PromotionPage.vue')
      },
      {
        path: 'bills',
        meta: { requiresAuth: true },
        name: 'Bill',
        component: () => import('pages/BillPage.vue')
      },
      {
        path: 'categories',
        meta: { requiresAuth: true },
        name: 'Category',
        component: () => import('pages/CategoryPage.vue')
      },
      {
        path: 'payment-methods',
        meta: { requiresAuth: true },
        name: 'PaymentMethod',
        component: () => import('pages/PaymentMethodPage.vue')
      },
      {
        path: 'invoice-types',
        meta: { requiresAuth: true },
        name: 'InvoiceType',
        component: () => import('pages/InvoiceTypePage.vue')
      },
      {
        path: 'users',
        meta: { requiresAuth: true },
        name: 'User',
        component: () => import('pages/UserPage.vue')
      },
      {
        path: 'sellers',
        meta: { requiresAuth: true },
        name: 'Seller',
        component: () => import('pages/SellerPage.vue')
      },
      {
        path: 'companies',
        meta: { requiresAuth: true },
        name: 'Company',
        component: () => import('pages/CompanyPage.vue')
      },
      {
        path: 'clients',
        meta: { requiresAuth: true },
        name: 'Client',
        component: () => import('pages/ClientPage.vue')
      },
      {
        path: 'roles',
        meta: { requiresAuth: true },
        name: 'Role',
        component: () => import('pages/RolePage.vue')
      },
      {
        path: 'business-types',
        meta: { requiresAuth: true },
        name: 'BusinessType',
        component: () => import('src/pages/BusinessTypePage.vue')
      },
      {
        path: 'living-rooms',
        meta: { requiresAuth: true },
        name: 'LivingRoom',
        component: () => import('src/pages/LivingRoomPage.vue')
      },
      {
        path: 'coins',
        meta: { requiresAuth: true },
        name: 'Coin',
        component: () => import('pages/CoinPage.vue')
      },
      {
        path: 'countries',
        meta: { requiresAuth: true },
        name: 'Country',
        component: () => import('pages/CountryPage.vue')
      },
      {
        path: 'box-reports',
        meta: { requiresAuth: true },
        name: 'BoxReport',
        component: () => import('pages/BoxReportPage.vue')
      },
      {
        path: 'invoices',
        meta: { requiresAuth: true },
        name: 'Invoice',
        component: () => import('pages/InvoicePage.vue')
      },
      {
        path: 'taxes',
        meta: { requiresAuth: true },
        name: 'Taxe',
        component: () => import('pages/TaxePage.vue')
      },
      {
        path: 'uom',
        meta: { requiresAuth: true },
        name: 'Uom',
        component: () => import('pages/UomPage.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        meta: { requiresAuth: true },
        component: () => import('pages/ProfilePage.vue')
      },
      {
        path: 'subscription-plans',
        name: 'SubscriptionPlan',
        meta: { requiresAuth: true },
        component: () => import('pages/SubscriptionPlansPage.vue')
      },
      {
        path: 'admin-dashboard',
        name: 'AdminDashboard',
        meta: { requiresAuth: true },
        component: () => import('pages/AdminDashboard.vue')
      },
      {
        path: 'command-orders',
        meta: { requiresAuth: true },
        name: 'CommandOrder',
        component: () => import('pages/CommandOrderPage.vue')
      },
      {
        path: 'change-company',
        name: 'ChangeCompany',
        meta: { requiresAuth: true },
        component: () => import('pages/ChangeCompanyPage.vue')
      },
      {
        path: 'branch-offices',
        name: 'BranchOffice',
        meta: { requiresAuth: true },
        component: () => import('pages/BranchOfficePage.vue')
      },
      {
        path: 'company',
        name: 'CompanyConfig',
        meta: { requiresAuth: true },
        component: () => import('pages/CompanyConfigPage.vue')
      },
      {
        path: 'delivery-persons',
        name: 'DeliveryPerson',
        meta: { requiresAuth: true },
        component: () => import('pages/DeliveryPersonPage.vue')
      },
      {
        path: 'accounts-receivable',
        name: 'AccountsReceivable',
        meta: { requiresAuth: true },
        component: () => import('pages/AccountsReceivablePage.vue')
      },
      {
        path: 'accounts-payable',
        name: 'AccountsPayable',
        meta: { requiresAuth: true },
        component: () => import('pages/AccountsPayablePage.vue')
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        meta: { requiresAuth: true },
        component: () => import('pages/DashboardPage.vue')
      },
      {
        path: 'tutorials',
        name: 'Tutorial',
        meta: { requiresAuth: true },
        component: () => import('pages/TutorialPage.vue')
      },
      {
        path: 'new-purchases',
        name: 'NewPurchase',
        meta: { requiresAuth: true },
        component: () => import('pages/NewPurchasePage.vue')
      },
      {
        path: 'providers',
        name: 'Provider',
        meta: { requiresAuth: true },
        component: () => import('pages/ProviderPage.vue')
      },
      {
        path: 'purchases',
        name: 'Purchase',
        meta: { requiresAuth: true },
        component: () => import('pages/PurchasePage.vue')
      },
      {
        path: 'product-kardex',
        name: 'ProductKardex',
        meta: { requiresAuth: true },
        component: () => import('pages/ProductKardexPage.vue')
      },
      {
        path: 'type-of-services',
        name: 'TypeOfService',
        meta: { requiresAuth: true },
        component: () => import('pages/TypeOfServicePage.vue')
      },
      {
        path: 'cashboxes',
        name: 'Cashbox',
        meta: { requiresAuth: true },
        component: () => import('pages/CashboxPage.vue')
      },
      {
        path: 'finances/cashboxes',
        name: 'FinanceCashbox',
        meta: { requiresAuth: true },
        component: () => import('pages/FinanceCashboxPage.vue')
      },
      {
        path: 'finances/payments-by-method',
        name: 'FinancePaymentsByMethod',
        meta: { requiresAuth: true },
        component: () => import('pages/FinancePaymentsByMethodPage.vue')
      },
      {
        path: 'transfer-products',
        name: 'TransferProduct',
        meta: { requiresAuth: true },
        component: () => import('pages/TransferProductPage.vue')
      },
      // Logistics Routes - Uber Style (Transfer Stocks)
      {
        path: 'courier/tray',
        name: 'CourierTray',
        meta: { requiresAuth: true },
        component: () => import('pages/CourierTrayPage.vue')
      },
      {
        path: 'courier/transport/:id',
        name: 'ActiveTransport',
        meta: { requiresAuth: true, hideBottomNav: true },
        component: () => import('pages/ActiveTransportPage.vue')
      },
      {
        path: 'delivery/tray',
        name: 'InvoiceDeliveryTray',
        meta: { requiresAuth: true, hideBottomNav: true },
        component: () => import('pages/InvoiceDeliveryTrayPage.vue')
      },
      {
        path: 'delivery/active/:id',
        name: 'ActiveInvoiceDelivery',
        meta: { requiresAuth: true, hideBottomNav: true },
        component: () => import('pages/ActiveInvoiceDeliveryPage.vue')
      },
      {
        path: 'delivery/monitor',
        name: 'AdminDeliveryMonitor',
        meta: { requiresAuth: true, hideBottomNav: true },
        component: () => import('pages/AdminDeliveryMonitorPage.vue')
      },
      {
        path: 'delivery/history',
        name: 'DeliveryRunHistory',
        meta: { requiresAuth: true },
        component: () => import('pages/DeliveryRunHistoryPage.vue')
      },
      // Delivery Route Management System
      {
        path: 'delivery-routes',
        name: 'DeliveryRoute',
        meta: { requiresAuth: true },
        component: () => import('pages/DeliveryRoutesPage.vue')
      },
      {
        path: 'delivery-routes/builder/:id?',
        name: 'DeliveryRouteBuilder',
        meta: { requiresAuth: true },
        component: () => import('pages/DeliveryRouteBuilderPage.vue')
      },
      {
        path: 'delivery-routes/active/:id',
        name: 'ActiveDeliveryRoute',
        meta: { requiresAuth: true, hideBottomNav: true },
        component: () => import('pages/ActiveDeliveryRoutePage.vue')
      },
      {
        path: 'inventory-count',
        name: 'InventoryCount',
        meta: { requiresAuth: true },
        component: () => import('pages/InventoryCountPage.vue')
      },
      {
        path: 'sessions-manager',
        name: 'SessionsManager',
        meta: { requiresAuth: true },
        component: () => import('pages/SessionsManagerPage.vue')
      },
      {
        path: 'session-monitor',
        name: 'SessionMonitor',
        meta: { requiresAuth: true, title: 'Monitor de Sesiones' },
        component: () => import('pages/SessionMonitorPage.vue')
      },
      {
        path: 'dashboard-manager',
        name: 'DashboardManager',
        meta: { requiresAuth: true },
        component: () => import('pages/DashboardManagerPage.vue')
      },
      {
        path: 'printers',
        name: 'Printer',
        meta: { requiresAuth: true },
        component: () => import('pages/PrinterPage.vue')
      },
      {
        path: 'product-sales',
        name: 'ProductSales',
        meta: { requiresAuth: true },
        component: () => import('pages/ProductSalesPage.vue')
      },
      {
        path: 'table-control',
        name: 'TableControl',
        meta: { requiresAuth: true },
        component: () => import('pages/TableControlPage.vue')
      },
      {
        path: 'point-of-sales',
        name: 'PointOfSale',
        meta: { requiresAuth: true },
        component: () => import('src/pages/PointOfSalePage.vue')
      },
      {
        path: 'promotions',
        name: 'Promotion',
        meta: { requiresAuth: true },
        component: () => import('src/pages/PromotionPage.vue')
      },
      {
        path: 'modules',
        name: 'Module',
        meta: { requiresAuth: true },
        component: () => import('pages/ModulePage.vue')
      },
      {
        path: 'report-withdrawals',
        name: 'ReportWithdrawals',
        meta: { requiresAuth: true },
        component: () => import('src/pages/ReportWithdrawalsPage.vue')
      },
      {
        path: 'logs',
        name: 'Log',
        meta: { requiresAuth: true },
        component: () => import('src/pages/LogPage.vue')
      },
      {
        path: 'notifications',
        name: 'Notification',
        meta: { requiresAuth: true },
        component: () => import('src/pages/NotificationPage.vue')
      },
      {
        path: 'exchange-rates',
        name: 'ExchangeRate',
        meta: { requiresAuth: true },
        component: () => import('src/pages/ExchangeRatePage.vue')
      },
      {
        path: 'sales-inventory-report',
        name: 'SalesInventoryReport',
        meta: { requiresAuth: true },
        component: () => import('src/pages/SalesInventoryReportPage.vue')
      },
      {
        path: 'ai-chat',
        name: 'AiChat',
        meta: { requiresAuth: true },
        component: () => import('src/pages/AiChatPage.vue')
      },
      {
        path: 'integrations',
        name: 'Integrations',
        meta: { requiresAuth: true },
        component: () => import('src/pages/IntegrationsPage.vue')
      },
      {
        path: 'production-orders',
        name: 'ProductionOrder',
        meta: { requiresAuth: true },
        component: () => import('pages/ProductionOrderPage.vue')
      },
      {
        path: 'welcome',
        name: 'Welcome',
        meta: { requiresAuth: true },
        component: () => import('pages/WelcomePage.vue')
      },
      {
        path: 'support',
        name: 'Support',
        meta: { requiresAuth: true },
        component: () => import('pages/SupportChatPage.vue')
      },
      {
        path: 'admin/support',
        name: 'AdminSupport',
        meta: { requiresAuth: true },
        component: () => import('pages/AdminSupportPage.vue')
      }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/MobileLayout.vue'),
    children: [
      {
        path: 'catalog/:company_id/:branch_office_id',
        name: 'Catalog',
        component: () => import('pages/CatalogPage.vue')
      },
      {
        path: 'menu',
        name: 'Menu',
        component: () => import('pages/MenuPage.vue')
      }
    ]
  },
  {
    path: '/command',
    component: () => import('layouts/CatalogLayout.vue'),
    children: [
      {
        path: '',
        name: 'Command',
        meta: { requiresAuth: true },
        component: () => import('pages/CommandPage.vue')
      }
    ]
  },
  {
    path: '/subscription/success',
    name: 'SubscriptionSuccess',
    meta: { requiresAuth: true },
    component: () => import('pages/SubscriptionSuccessPage.vue')
  },
  {
    path: '/subscription/failure',
    name: 'SubscriptionFailure',
    meta: { requiresAuth: true },
    component: () => import('pages/SubscriptionFailurePage.vue')
  },
  {
    path: '/subscription/pending',
    name: 'SubscriptionPending',
    meta: { requiresAuth: true },
    component: () => import('pages/SubscriptionPendingPage.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('pages/LoginPage.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('pages/RegisterPage.vue')
  },
  {
    path: '/verifying/:access_token/:expires_in/:token_type/:redirect',
    name: 'VerifySession',
    meta: { requiresAuth: false },
    component: () => import('pages/VerifySessionPage.vue')
  },
  {
    path: '/invoice-details',
    name: 'InvoiceDetails',
    meta: { requiresAuth: false },
    component: () => import('pages/InvoiceDetailsPage.vue')
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
