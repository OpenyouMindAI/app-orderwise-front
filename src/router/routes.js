import { validationSession, validationNotSession } from './validations-router'
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', beforeEnter: validationSession, name: 'Billing', component: () => import('pages/BillingPage.vue') },
      { path: 'products', beforeEnter: validationSession, name: 'Product', component: () => import('pages/ProductPage.vue') },
      { path: 'bills', beforeEnter: validationSession, name: 'Bills', component: () => import('pages/BillPage.vue') }
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
