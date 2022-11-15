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
      { path: 'coins', beforeEnter: validationSession, name: 'Coin', component: () => import('pages/CoinPage.vue') }
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
