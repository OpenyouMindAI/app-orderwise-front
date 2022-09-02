
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'Billing', component: () => import('pages/BillingPage.vue') },
      { path: 'products', name: 'Product', component: () => import('pages/ProductPage.vue') },
      { path: 'bills', name: 'Bills', component: () => import('pages/BillPage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
