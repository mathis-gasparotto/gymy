import { auth } from 'src/boot/firebase'
import { uid } from 'quasar'
import { LocalDb } from './localDbService'
import { createData, removeData, updateData } from './firebaseService'
import { LOCALSTORAGE_DB_USER } from 'src/helpers/databaseHelper'
import { getUser } from './userService'
import { USER_GUEST_UID } from 'src/helpers/userHelper'
import { SHARED_DATA_TYPE_WORKOUT } from 'src/helpers/shareHelper'

export function getWorkouts() {
  const workoutsObject = LocalDb.get(LOCALSTORAGE_DB_USER).workouts
  if (!workoutsObject) return []
  return Object.keys(workoutsObject).map(key => {
    return {
      ...workoutsObject[key],
      id: key
    }
  }).sort((a, b) => a.position - b.position)
}

export function getNoAbsWorkouts() {
  const workoutsObject = LocalDb.get(LOCALSTORAGE_DB_USER).workouts
  if (!workoutsObject) return []
  return Object.keys(workoutsObject).map(key => {
    return {
      ...workoutsObject[key],
      id: key
    }
  }).filter(e => !e.isAbs).sort((a, b) => a.position - b.position)
}

export function getAbsWorkouts() {
  const workoutsObject = LocalDb.get(LOCALSTORAGE_DB_USER).workouts
  if (!workoutsObject) return []
  return Object.keys(workoutsObject).map(key => {
    return {
      ...workoutsObject[key],
      id: key
    }
  }).filter(e => e.isAbs).sort((a, b) => a.position - b.position)
}

export function getWorkout(id) {
  const data = LocalDb.get(LOCALSTORAGE_DB_USER).workouts[id]
  if (!data) return null
  return {
    ...data,
    id: id
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
    const dataToStore = {...user}
    if (!dataToStore.workouts) {
      dataToStore.workouts = {}
    }
    dataToStore.workouts[id] = {
      ...payload,
      id: null,
      exercises: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    LocalDb.set(LOCALSTORAGE_DB_USER, dataToStore)
  } else {
    await createData('users/' + auth.currentUser.uid + '/workouts/' + id, { ...payload, id: null })
  }

  return {
    ...payload,
    id: id
  }
}

export async function updateWorkout(id, payload, timestamp = true) {
  const user = getUser()
  const updatedAt = timestamp ? new Date().toISOString() : user.workouts?.[id]?.updatedAt
  if (user && user.uid === USER_GUEST_UID) {
    const dataToStore = {...user}
    dataToStore.workouts[id] = {
      ...user.workouts[id],
      ...payload,
      id: null,
      updatedAt
    }
    LocalDb.set(LOCALSTORAGE_DB_USER, dataToStore)
  } else {
    await updateData('users/' + auth.currentUser.uid + '/workouts/' + id, { ...payload, id: null }, timestamp)
  }

  return payload
}

export async function moveWorkout(newWorkoutOrder) {
  await Promise.all(
    newWorkoutOrder.map((id, index) => {
      return updateWorkout(id, {
        position: index + 1
      }, false)
    })
  )

  return newWorkoutOrder
}

export async function deleteWorkout(id) {
  const workouts = getWorkouts()
  const workoutToDelete = workouts.find(e => e.id === id)
  if (!workoutToDelete) throw new Error('Workout not found')
  if (workoutToDelete.shareId) await removeData('shared/' + workoutToDelete.shareId)
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
    const dataToStore = {...user}
    delete dataToStore.workouts[id]
    LocalDb.set(LOCALSTORAGE_DB_USER, dataToStore)
  } else {
    await removeData('users/' + auth.currentUser.uid + '/workouts/' + id)
  }
}

export async function enableShareForWorkout(id) {
  const user = getUser()
  if (!user || user.uid === USER_GUEST_UID) return
  const shareId = uid().replaceAll('-', '')
  const payload = {
    shareId: shareId
  }
  await updateData('users/' + auth.currentUser.uid + '/workouts/' + id, payload)
  await createData('shared/' + shareId, {
    workoutId: id,
    userId: auth.currentUser.uid,
    type: SHARED_DATA_TYPE_WORKOUT
  })

  return payload
}

export async function cancelShareForWorkout(id) {
  const user = getUser()
  if (!user || user.uid === USER_GUEST_UID) return
  const workout = getWorkout(id)

  await removeData('shared/' + workout.shareId)
  workout.shareId = null

  await updateData('users/' + auth.currentUser.uid + '/workouts/' + id, {
    shareId: null
  })

  return workout
}
