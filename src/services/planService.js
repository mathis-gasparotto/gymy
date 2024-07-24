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
      ...plansObject[key],
      id: key,
    }
  }).sort((a, b) => a.position - b.position)
}

export function getPlan(id) {
  const data = LocalStorage.getItem(LOCALSTORAGE_DB_USER).plans[id]
  if (!data) return null
  return {
    ...data,
    id: id
  }
}

export function getPlanWorkouts(planId) {
  const plan = getPlan(planId)
  if (!plan) throw new Error('Plan not found')
  return [
    plan.mondayWorkoutId ? getWorkout(plan.mondayWorkoutId) : plan.mondayWorkoutLabel ? {label: plan.mondayWorkoutLabel} : null,
    plan.tuesdayWorkoutId ? getWorkout(plan.tuesdayWorkoutId) : plan.tuesdayWorkoutLabel ? {label: plan.tuesdayWorkoutLabel} : null,
    plan.wednesdayWorkoutId ? getWorkout(plan.wednesdayWorkoutId) : plan.wednesdayWorkoutLabel ? {label: plan.wednesdayWorkoutLabel} : null,
    plan.thursdayWorkoutId ? getWorkout(plan.thursdayWorkoutId) : plan.thursdayWorkoutLabel ? {label: plan.thursdayWorkoutLabel} : null,
    plan.fridayWorkoutId ? getWorkout(plan.fridayWorkoutId) : plan.fridayWorkoutLabel ? {label: plan.fridayWorkoutLabel} : null,
    plan.saturdayWorkoutId ? getWorkout(plan.saturdayWorkoutId) : plan.saturdayWorkoutLabel ? {label: plan.saturdayWorkoutLabel} : null,
    plan.sundayWorkoutId ? getWorkout(plan.sundayWorkoutId) : plan.sundayWorkoutLabel ? {label: plan.sundayWorkoutLabel} : null
  ]
}

export async function addPlan(payload) {
  const id = uid()

  const plans = getPlans()
  const lastPosition = plans.length > 0 ? plans[plans.length - 1].position : 0

  payload = {
    mondayWorkoutId: null,
    mondayWorkoutLabel: null,
    tuesdayWorkoutId: null,
    tuesdayWorkoutLabel: null,
    wednesdayWorkoutId: null,
    wednesdayWorkoutLabel: null,
    thursdayWorkoutId: null,
    thursdayWorkoutLabel: null,
    fridayWorkoutId: null,
    fridayWorkoutLabel: null,
    saturdayWorkoutId: null,
    saturdayWorkoutLabel: null,
    sundayWorkoutId: null,
    sundayWorkoutLabel: null,
    ...payload,
    position: lastPosition + 1
  }

  const user = getUser()
  if (user && user.uid === USER_GUEST_UID) {
    LocalStorage.set(LOCALSTORAGE_DB_USER, {
      ...user,
      plans: {
        ...user.plans,
        [id]: {
          ...payload,
          id: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    })
  } else {
    await createData('users/' + auth.currentUser.uid + '/plans/' + id, { ...payload, id: null })
  }

  return {
    ...payload,
    id: id
  }
}

export async function updatePlan(id, payload) {
  const user = getUser()
  if (user && user.uid === USER_GUEST_UID) {
    LocalStorage.set(LOCALSTORAGE_DB_USER, {
      ...user,
      plans: {
        ...user.plans,
        [id]: {
          ...user.plans[id],
          ...payload,
          id: null,
          updatedAt: new Date().toISOString()
        }
      }
    })
  } else {
    await updateData('users/' + auth.currentUser.uid + '/plans/' + id, { ...payload, id: null })
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
  if (user && user.uid === USER_GUEST_UID) {
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
    await removeData('users/' + auth.currentUser.uid + '/plans/' + id)
  }
}

export function getTodayWorkouts() {
  const plans = getPlans()
  const today = new Date().getDay()
  return plans.map(plan => {
    let workoutId
    let workoutLabel
    switch (today) {
      case 1:
        if (plan.mondayWorkoutId) workoutId = plan.mondayWorkoutId
        if (plan.mondayWorkoutLabel) workoutLabel = plan.mondayWorkoutLabel
        break
      case 2:
        if (plan.tuesdayWorkoutId) workoutId = plan.tuesdayWorkoutId
        if (plan.tuesdayWorkoutLabel) workoutLabel = plan.tuesdayWorkoutLabel
        break
      case 3:
        if (plan.wednesdayWorkoutId) workoutId = plan.wednesdayWorkoutId
        if (plan.wednesdayWorkoutLabel) workoutLabel = plan.wednesdayWorkoutLabel
        break
      case 4:
        if (plan.thursdayWorkoutId) workoutId = plan.thursdayWorkoutId
        if (plan.thursdayWorkoutLabel) workoutLabel = plan.thursdayWorkoutLabel
        break
      case 5:
        if (plan.fridayWorkoutId) workoutId = plan.fridayWorkoutId
        if (plan.fridayWorkoutLabel) workoutLabel = plan.fridayWorkoutLabel
        break
      case 6:
        if (plan.saturdayWorkoutId) workoutId = plan.saturdayWorkoutId
        if (plan.saturdayWorkoutLabel) workoutLabel = plan.saturdayWorkoutLabel
        break
      case 0:
        if (plan.sundayWorkoutId) workoutId = plan.sundayWorkoutId
        if (plan.sundayWorkoutLabel) workoutLabel = plan.sundayWorkoutLabel
        break
    }
    return {
      id: plan.id,
      label: plan.label,
      workout: workoutId ? getWorkout(workoutId) : workoutLabel ? {label: workoutLabel} : null
    }
  })
}
