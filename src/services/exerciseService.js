import { auth } from 'src/boot/firebase'
import { uid } from 'quasar'
import { LocalDb } from './localDbService'
import { createData, removeData, updateData } from './firebaseService'
import { LOCALSTORAGE_DB_USER } from 'src/helpers/databaseHelper'
import { getUser } from './userService'
import { USER_GUEST_UID } from 'src/helpers/userHelper'

export function getExercises(workoutId) {
  const exercisesObject = LocalDb.get(LOCALSTORAGE_DB_USER).workouts?.[workoutId]?.exercises
  if (!exercisesObject) return []
  return Object.keys(exercisesObject)
    .map((key) => {
      return {
        ...exercisesObject[key],
        id: key
      }
    })
    .sort((a, b) => a.position - b.position)
}

export function getNextExercise(workoutId, id) {
  const exercises = getExercises(workoutId).filter((e) => e.id === id || !e.disabled)
  const index = exercises.findIndex((e) => e.id === id)
  if (index === -1) return null
  if (index === exercises.length - 1) return null
  return exercises[index + 1]
}

export function getPreviousExercise(workoutId, id) {
  const exercises = getExercises(workoutId).filter((e) => e.id === id || !e.disabled)
  const index = exercises.findIndex((e) => e.id === id)
  if (index === -1) return null
  if (index === 0) return null
  return exercises[index - 1]
}

export function getExercise(workoutId, id) {
  const data = LocalDb.get(LOCALSTORAGE_DB_USER).workouts?.[workoutId]?.exercises[id]
  if (!data) return null
  return {
    ...data,
    id: id
  }
}

export async function addExercise(workoutId, payload) {
  const id = uid()

  const exercises = getExercises(workoutId)
  const lastPosition = exercises.length > 0 ? exercises[exercises.length - 1].position : 0

  payload = {
    ...payload,
    position: lastPosition + 1
  }

  const user = getUser()

  if (user && user.uid === USER_GUEST_UID) {
    const dataToStore = {...user}
    if (!dataToStore.workouts[workoutId].exercises) {
      dataToStore.workouts[workoutId].exercises = {}
    }
    dataToStore.workouts[workoutId].exercises[id] = {
      ...payload,
      id: null,
      performances: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    LocalDb.set(LOCALSTORAGE_DB_USER, dataToStore)
  } else {
    await createData('users/' + auth.currentUser.uid + '/workouts/' + workoutId + '/exercises/' + id, { ...payload, id: null })
  }

  return {
    ...payload,
    id: id
  }
}

export async function copyExercise(workoutId, id, workoutDestinationId) {
  const exercise = getExercise(workoutId, id)

  if (!exercise) throw new Error('Exercise not found')

  let newExercise = { ...exercise }
  newExercise.link = {
    workout: workoutId,
    exercise: id
  }

  newExercise = await addExercise(workoutDestinationId, newExercise)

  await updateExercise(workoutId, id, {
    link: {
      workout: workoutDestinationId,
      exercise: newExercise.id
    }
  })

  return newExercise
}

export async function updateExercise(workoutId, id, payload, timestamp = true) {
  const user = getUser()
  const updatedAt = timestamp ? new Date().toISOString() : user.workouts?.[workoutId]?.exercises[id]?.updatedAt
  if (user && user.uid === USER_GUEST_UID) {
    const dataToStore = {...user}
    dataToStore.workouts[workoutId].exercises[id] = {
      ...user.workouts?.[workoutId]?.exercises[id],
      ...payload,
      id: null,
      updatedAt
    }
    LocalDb.set(LOCALSTORAGE_DB_USER, dataToStore)
  } else {
    await updateData('users/' + auth.currentUser.uid + '/workouts/' + workoutId + '/exercises/' + id, { ...payload, id: null}, timestamp)
  }

  return payload
}

export async function moveExercise(workoutId, newExercisesOrder) {
  await Promise.all(
    newExercisesOrder.map((id, index) => {
      return updateExercise(workoutId, id, {
        position: index + 1
      }, false)
    })
  )

  return newExercisesOrder
}

export async function deleteExercise(workoutId, id) {
  const exercises = getExercises(workoutId)
  const exerciseToDelete = exercises.find((e) => e.id === id)
  if (!exerciseToDelete) throw new Error('Exercise not found')
  if (exercises.length > 1) {
    // update positions
    const exercisesToUpdate = exercises.filter((e) => e.position > exerciseToDelete.position)
    exercisesToUpdate.forEach((e) => {
      updateExercise(workoutId, e.id, {
        position: e.position - 1
      })
    })
  }

  const user = getUser()
  if (user && user.uid === USER_GUEST_UID) {
    const dataToStore = {...user}
    delete dataToStore.workouts[workoutId].exercises[id]
    LocalDb.set(LOCALSTORAGE_DB_USER, dataToStore)
  } else {
    await removeData('users/' + auth.currentUser.uid + '/workouts/' + workoutId + '/exercises/' + id)
  }
}
