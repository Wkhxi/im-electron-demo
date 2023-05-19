import { createRouter, createWebHashHistory as hash } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login-in',
    component: () => import('./Login.vue')
  },
  {
    path: '/layout',
    name: 'layout-box',
    redirect: '/layout/home',
    component: () => import('./Layout.vue'),
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('./pages/Home.vue')
      }
    ]
  }
]

const router = createRouter({
  history: hash(),
  routes
})

export default router
