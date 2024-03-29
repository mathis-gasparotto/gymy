const routes = [
  {
    path: '/welcome',
    component: () => import('layouts/WelcomeLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/Welcome/LoginPage.vue')
      },
      {
        path: 'signup',
        name: 'signup',
        component: () => import('pages/Welcome/SignupPage.vue')
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
        component: () => import('layouts/WorkoutsLayout.vue'),
        children: [
          {
            path: '',
            name: 'workouts',
            component: () => import('pages/Workouts/WorkoutsPage.vue')
          },
          {
            path: ':workoutId',
            name: 'exercises',
            component: () => import('pages/Workouts/ExercisesPage.vue')
          },
          {
            path: ':workoutId/exercises/:exerciseId',
            name: 'performances',
            component: () => import('pages/Workouts/PerformancesPage.vue')
          }
        ]
      },
      {
        path: '/account',
        name: 'account',
        component: () => import('pages/AccountPage.vue')
      },
      {
        path: '/plans',
        component: () => import('layouts/PlansLayout.vue'),
        children: [
          {
            path: '',
            name: 'plans',
            component: () => import('pages/Plans/PlansPage.vue')
          },
          {
            path: ':planId',
            name: 'plan',
            component: () => import('pages/Plans/PlanPage.vue')
          }
        ]
      },
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
