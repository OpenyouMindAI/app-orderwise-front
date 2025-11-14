const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
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
        path: 'profile',
        name: 'Profile',
        meta: { requiresAuth: true },
        component: () => import('pages/ProfilePage.vue')
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
        meta: { requiresAuth: true },
        component: () => import('pages/ActiveTransportPage.vue')
      },
      // Invoice Delivery Routes - Own Delivery System
      {
        path: 'delivery/tray',
        name: 'InvoiceDeliveryTray',
        meta: { requiresAuth: true },
        component: () => import('pages/InvoiceDeliveryTrayPage.vue')
      },
      {
        path: 'delivery/active/:id',
        name: 'ActiveInvoiceDelivery',
        meta: { requiresAuth: true },
        component: () => import('pages/ActiveInvoiceDeliveryPage.vue')
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
