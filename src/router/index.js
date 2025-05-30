import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/check-in',
    name: 'checkIn',
    component: () => import('../views/CheckInView.vue')
  },
  {
    path: '/check-out',
    name: 'checkOut',
    component: () => import('../views/CheckOutView.vue')
  },
  {
    path: '/air-conditioning',
    name: 'airConditioning',
    component: () => import('../views/AirConditioningView.vue')
  },
  {
    path: '/room-monitoring',
    name: 'roomMonitoring',
    component: () => import('../views/RoomMonitoringView.vue')
  },
  {
    path: '/ac-management',
    name: 'acManagement',
    component: () => import('../views/ACManagementView.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
