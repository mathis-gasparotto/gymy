import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { LocalStorage } from 'quasar'
import { getWorkout } from 'src/services/workoutService'
import { getPlan } from 'src/services/planService'
import { getExercise } from 'src/services/exerciseService'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach(async (to, from, next) => {
    const isAuthenticated = await LocalStorage.has('user') && await LocalStorage.getItem('user').uid

    if (!isAuthenticated && to.name !== 'login' && to.name !== 'signup') {
      return next({
        name: 'login',
      })
    } else if (
      isAuthenticated &&
      (to.name === 'login' || to.name === 'signup')
    ) {
      return next({
        name:
          from.name === 'login' || to.name === 'signup' ? 'index' : from.name,
      })
    } else if (to.name === 'exercises') {
      const workout = getWorkout(to.params.workoutId)
      if (!workout) {
        return next({
          name: 'workouts',
        })
      } else {
        return next()
      }
    } else if (to.name === 'performances') {
      const workout = getWorkout(to.params.workoutId)
      if (!workout) {
        return next({
          name: 'workouts',
        })
      }
      const exercise = getExercise(to.params.workoutId, to.params.exerciseId)
      if (!exercise) {
        return next({
          name: 'exercises',
          params: {
            workoutId: to.params.workoutId,
          },
        })
      } else {
        return next()
      }
    } else if (to.name === 'plan') {
      const plan = getPlan(to.params.planId)
      if (!plan) {
        return next({
          name: 'plans',
        })
      } else {
        return next()
      }
    } else {
      return next()
    }
  })

  return Router
})
