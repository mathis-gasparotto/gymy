import { auth } from 'src/boot/firebase'
import { LocalStorage, uid } from 'quasar'
import { createData, removeData, updateData } from './firebaseService'
import { LOCALSTORAGE_DB_USER } from 'src/helpers/databaseHelper'
import { getUser } from './userService'
import { USER_GUEST_UID } from 'src/helpers/userHelper'

export function getWorkouts() {
  const workoutsObject = LocalStorage.getItem(LOCALSTORAGE_DB_USER).workouts
  if (!workoutsObject) return []
  return Object.keys(workoutsObject).map(key => {
    return {
      id: key,
      ...workoutsObject[key]
    }
  }).sort((a, b) => a.position - b.position)
}

export function getNoAbsWorkouts() {
  const workoutsObject = LocalStorage.getItem(LOCALSTORAGE_DB_USER).workouts
  if (!workoutsObject) return []
  return Object.keys(workoutsObject).map(key => {
    return {
      id: key,
      ...workoutsObject[key]
    }
  }).filter(e => !e.isAbs).sort((a, b) => a.position - b.position)
}

export function getAbsWorkouts() {
  const workoutsObject = LocalStorage.getItem(LOCALSTORAGE_DB_USER).workouts
  if (!workoutsObject) return []
  return Object.keys(workoutsObject).map(key => {
    return {
      id: key,
      ...workoutsObject[key]
    }
  }).filter(e => e.isAbs).sort((a, b) => a.position - b.position)
}

export function getWorkout(id) {
  const data = LocalStorage.getItem(LOCALSTORAGE_DB_USER).workouts[id]
  if (!data) return null
  return {
    id: id,
    ...data
  }
}

export async function addWorkout(payload) {
  const id = uid()

  const workouts = getWorkouts()
  const lastPosition = workouts.length > 0 ? workouts[workouts.length - 1].position : 0

  payload = {
    ...payload,
    position: lastPosition + 1
  }

  const user = getUser()
  if (user && user.uid === USER_GUEST_UID) {
    LocalStorage.set(LOCALSTORAGE_DB_USER, {
      ...user,
      workouts: {
        ...user.workouts,
        [id]: {
          ...payload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    })
  } else {
    await createData('users/' + auth.currentUser.uid + '/workouts/' + id, payload)
  }

  return {
    id: id,
    ...payload
  }
}

export async function updateWorkout(id, payload) {
  const user = getUser()
  if (user && user.uid === USER_GUEST_UID) {
    LocalStorage.set(LOCALSTORAGE_DB_USER, {
      ...user,
      workouts: {
        ...user.workouts,
        [id]: {
          ...user.workouts[id],
          ...payload,
          updatedAt: new Date().toISOString()
        }
      }
    })
  } else {
    await updateData('users/' + auth.currentUser.uid + '/workouts/' + id, payload)
  }

  return payload
}

export async function moveWorkout(id, newPosition) {
  if (newPosition < 1) throw new Error('Invalid position')

  const workouts = getWorkouts()

  if (newPosition > workouts.length) newPosition = workouts.length

  const workoutToMove = workouts.find(e => e.id === id)

  if (!workoutToMove) throw new Error('Workout not found')

  if (workouts.length > 1) {
    // update positions
    if (newPosition > workoutToMove.position) {
      const workoutsToUpdate = workouts.filter(w => w.position > workoutToMove.position && w.position <= newPosition)
      workoutsToUpdate.forEach(w => {
        updateWorkout(w.id, {
          position: w.position - 1
        })
      })
    }
    if (newPosition < workoutToMove.position) {
      const workoutsToUpdate = workouts.filter(w => w.position < workoutToMove.position && w.position >= newPosition)
      workoutsToUpdate.forEach(w => {
        updateWorkout(w.id, {
          position: w.position + 1
        })
      })
    }
  }
  await updateWorkout(id, {
    position: newPosition
  })

  return {
    ...workoutToMove,
    position: newPosition
  }
}

export async function deleteWorkout(id) {
  const workouts = getWorkouts()
  const workoutToDelete = workouts.find(e => e.id === id)
  if (!workoutToDelete) throw new Error('Workout not found')
  if (workouts.length > 1) {
    // update positions
    const workoutsToUpdate = workouts.filter(e => e.position > workoutToDelete.position)
    workoutsToUpdate.forEach(e => {
      updateWorkout(e.id, {
        position: e.position - 1
      })
    })
  }

  const user = getUser()
  if (user && user.uid === USER_GUEST_UID) {
    LocalStorage.set(LOCALSTORAGE_DB_USER, {
      ...user,
      workouts: Object.keys(user.workouts).reduce((acc, key) => {
        if (key !== id) {
          acc[key] = user.workouts[key]
        }
        return acc
      }, {})
    })
  } else {
    await removeData('users/' + auth.currentUser.uid + '/workouts/' + id)
  }
}
