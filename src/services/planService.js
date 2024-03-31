import { auth } from 'src/boot/firebase'
import { LocalStorage, uid } from 'quasar'
import { createData, removeData, updateData } from './firebaseService'
import { LOCALSTORAGE_DB_USER } from 'src/helpers/databaseHelper'
import { getUser } from './userService'
import { USER_GUEST_UID } from 'src/helpers/userHelper'
import { getWorkout } from './workoutService'

export function getPlans() {
  const plansObject = LocalStorage.getItem(LOCALSTORAGE_DB_USER).plans
  if (!plansObject) return []
  return Object.keys(plansObject).map(key => {
    return {
      id: key,
      ...plansObject[key]
    }
  }).sort((a, b) => a.position - b.position)
}

export function getPlan(id) {
  const data = LocalStorage.getItem(LOCALSTORAGE_DB_USER).plans[id]
  if (!data) return null
  return {
    id: id,
    ...data
  }
}

export function getPlanWorkouts(planId) {
  const plan = getPlan(planId)
  if (!plan) throw new Error('Plan not found')
  return [
    plan.mondayWorkoutId ? getWorkout(plan.mondayWorkoutId) : null,
    plan.tuesdayWorkoutId ? getWorkout(plan.tuesdayWorkoutId) : null,
    plan.wednesdayWorkoutId ? getWorkout(plan.wednesdayWorkoutId) : null,
    plan.thursdayWorkoutId ? getWorkout(plan.thursdayWorkoutId) : null,
    plan.fridayWorkoutId ? getWorkout(plan.fridayWorkoutId) : null,
    plan.saturdayWorkoutId ? getWorkout(plan.saturdayWorkoutId) : null,
    plan.sundayWorkoutId ? getWorkout(plan.sundayWorkoutId) : null
  ]
}

export async function addPlan(payload) {
  const id = uid()

  const plans = getPlans()
  const lastPosition = plans.length > 0 ? plans[plans.length - 1].position : 0

  payload = {
    mondayWorkoutId: null,
    tuesdayWorkoutId: null,
    wednesdayWorkoutId: null,
    thursdayWorkoutId: null,
    fridayWorkoutId: null,
    saturdayWorkoutId: null,
    sundayWorkoutId: null,
    ...payload,
    position: lastPosition + 1
  }

  const user = getUser()
  if (user.uid === USER_GUEST_UID) {
    LocalStorage.set(LOCALSTORAGE_DB_USER, {
      ...user,
      plans: {
        ...user.plans,
        [id]: {
          ...payload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    })
  } else {
    await createData('users/' + (auth.currentUser ? auth.currentUser.uid : getUser().uid) + '/plans/' + id, payload)
  }

  return {
    id: id,
    ...payload
  }
}

export async function updatePlan(id, payload) {
  const user = getUser()
  if (user.uid === USER_GUEST_UID) {
    LocalStorage.set(LOCALSTORAGE_DB_USER, {
      ...user,
      plans: {
        ...user.plans,
        [id]: {
          ...user.plans[id],
          ...payload,
          updatedAt: new Date().toISOString()
        }
      }
    })
  } else {
    await updateData('users/' + (auth.currentUser ? auth.currentUser.uid : getUser().uid) + '/plans/' + id, payload)
  }

  return payload
}

export async function movePlan(id, newPosition) {
  if (newPosition < 1) throw new Error('Invalid position')

  const plans = getPlans()

  if (newPosition > plans.length) newPosition = plans.length

  const planToMove = plans.find(e => e.id === id)

  if (!planToMove) throw new Error('Plan not found')

  if (plans.length > 1) {
    // update positions
    if (newPosition > planToMove.position) {
      const plansToUpdate = plans.filter(w => w.position > planToMove.position && w.position <= newPosition)
      plansToUpdate.forEach(w => {
        updatePlan(w.id, {
          position: w.position - 1
        })
      })
    }
    if (newPosition < planToMove.position) {
      const plansToUpdate = plans.filter(w => w.position < planToMove.position && w.position >= newPosition)
      plansToUpdate.forEach(w => {
        updatePlan(w.id, {
          position: w.position + 1
        })
      })
    }
  }
  await updatePlan(id, {
    position: newPosition
  })

  return {
    ...planToMove,
    position: newPosition
  }
}

export async function deletePlan(id) {
  const plans = getPlans()
  const planToDelete = plans.find(e => e.id === id)
  if (!planToDelete) throw new Error('Plan not found')
  if (plans.length > 1) {
    // update positions
    const plansToUpdate = plans.filter(e => e.position > planToDelete.position)
    plansToUpdate.forEach(e => {
      updatePlan(e.id, {
        position: e.position - 1
      })
    })
  }

  const user = getUser()
  if (user.uid === USER_GUEST_UID) {
    LocalStorage.set(LOCALSTORAGE_DB_USER, {
      ...user,
      plans: Object.keys(user.plans).reduce((acc, key) => {
        if (key !== id) {
          acc[key] = user.plans[key]
        }
        return acc
      }, {})
    })
  } else {
    await removeData('users/' + (auth.currentUser ? auth.currentUser.uid : getUser().uid) + '/plans/' + id)
  }
}
