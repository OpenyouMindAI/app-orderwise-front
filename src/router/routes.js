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
      }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/MobileLayout.vue'),
    children: [
      {
        path: 'command',
        meta: { requiresAuth: true },
        name: 'Command',
        component: () => import('pages/CommandPage.vue')
      },
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
    path: '/login',
    name: 'Login',
    component: () => import('pages/LoginPage.vue')
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
