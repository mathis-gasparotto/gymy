
const routes = [
  {
    path: '/welcome',
    component: () => import('layouts/WelcomeLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/LoginPage.vue')
      },
      {
        path: 'signup',
        name: 'signup',
        component: () => import('pages/SignupPage.vue')
      }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'index',
        component: () => import('pages/IndexPage.vue')
      },
      {
        path: '/workouts',
        name: 'workouts',
        component: () => import('pages/WorkoutsPage.vue')
      },
      {
        path: '/account',
        name: 'account',
        component: () => import('pages/AccountPage.vue')
      }
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
