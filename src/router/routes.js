
export default [
  { path: '/', component: () => import('pages/Home') },
  { path: '/Payment/:invoiceid', component: () => import('pages/Payment'), props: true },
  { path: '/Login', component: () => import('pages/Login') },
  { path: '/Register', component: () => import('pages/Register') },
  { path: '/Account', component: () => import('pages/Account') },
  { path: '/Invoice', component: () => import('pages/Invoice') },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
]
