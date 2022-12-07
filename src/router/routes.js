import { validationSession, validationNotSession } from './validations-router'
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', beforeEnter: validationSession, name: 'Billing', component: () => import('pages/BillingPage.vue') },
      { path: 'products', beforeEnter: validationSession, name: 'Product', component: () => import('pages/ProductPage.vue') },
      { path: 'bills', beforeEnter: validationSession, name: 'Bill', component: () => import('pages/BillPage.vue') },
      { path: 'categories', beforeEnter: validationSession, name: 'Category', component: () => import('pages/CategoryPage.vue') },
      { path: 'payment-methods', beforeEnter: validationSession, name: 'PaymentMethod', component: () => import('pages/PaymentMethodPage.vue') },
      { path: 'invoice-types', beforeEnter: validationSession, name: 'InvoiceType', component: () => import('pages/InvoiceTypePage.vue') },
      { path: 'users', beforeEnter: validationSession, name: 'User', component: () => import('pages/UserPage.vue') },
      { path: 'sellers', beforeEnter: validationSession, name: 'Seller', component: () => import('pages/SellerPage.vue') },
      { path: 'clients', beforeEnter: validationSession, name: 'Client', component: () => import('pages/ClientPage.vue') },
      { path: 'roles', beforeEnter: validationSession, name: 'Role', component: () => import('pages/RolePage.vue') },
      { path: 'living-rooms', beforeEnter: validationSession, name: 'LivingRoom', component: () => import('src/pages/LivingRoomPage.vue') },
      { path: 'coins', beforeEnter: validationSession, name: 'Coin', component: () => import('pages/CoinPage.vue') },
      { path: 'box-reports', beforeEnter: validationSession, name: 'BoxReport', component: () => import('pages/BoxReportPage.vue') },
      { path: 'invoices', beforeEnter: validationSession, name: 'Invoice', component: () => import('pages/InvoicePage.vue') },
      { path: 'taxes', beforeEnter: validationSession, name: 'Taxe', component: () => import('pages/TaxePage.vue') }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    beforeEnter: validationNotSession,
    component: () => import('pages/LoginPage.vue')
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
