import { auth } from 'src/boot/firebase'
import { LocalStorage, uid } from 'quasar'
import { createData, removeData, updateData } from './firebaseService'
import { LOCALSTORAGE_DB_USER } from 'src/helpers/databaseHelper'

export function getExercises(workoutId) {
  const exercisesObject = LocalStorage.getItem(LOCALSTORAGE_DB_USER).workouts[workoutId].exercises
  if (!exercisesObject) return []
  return Object.keys(exercisesObject).map(key => {
    return {
      id: key,
      ...exercisesObject[key]
    }
  }).sort((a, b) => a.position - b.position)
}

export function getExercise(workoutId, id) {
  const data = LocalStorage.getItem(LOCALSTORAGE_DB_USER).workouts[workoutId].exercises[id]
  if (!data) return null
  return {
    id: id,
    ...data
  }
}

export async function addExercise(workoutId, payload) {
  const id = uid()

  const exercises = getExercises(workoutId)
  const lastOrder = exercises.length > 0 ? exercises[exercises.length - 1].position : 0

  payload = {
    ...payload,
    position: lastOrder + 1
  }

  await createData('users/' + auth.currentUser.uid + '/workouts/' + workoutId + '/exercises/' + id, payload)

  return {
    id: id,
    ...payload
  }
}

export async function updateExercise(workoutId, id, payload) {
  await updateData('users/' + auth.currentUser.uid + '/workouts/' + workoutId + '/exercises/' + id, payload)

  return payload
}

export async function moveExercise(workoutId, id, newPosition) {
  if (newPosition < 1) throw new Error('Invalid position')

  const exercises = getExercises(workoutId)

  if (newPosition > exercises.length) newPosition = exercises.length

  const exerciseToMove = exercises.find(e => e.id === id)

  if (!exerciseToMove) throw new Error('Exercise not found')

  if (exercises.length > 1) {
    // update positions
    if (newPosition > exerciseToMove.position) {
      const exercisesToUpdate = exercises.filter(e => e.position > exerciseToMove.position && e.position <= newPosition)
      exercisesToUpdate.forEach(e => {
        updateExercise(workoutId, e.id, {
          position: e.position - 1
        })
      })
    }
    if (newPosition < exerciseToMove.position) {
      const exercisesToUpdate = exercises.filter(e => e.position < exerciseToMove.position && e.position >= newPosition)
      exercisesToUpdate.forEach(e => {
        updateExercise(workoutId, e.id, {
          position: e.position + 1
        })
      })
    }
  }
  await updateExercise(workoutId, id, {
    position: newPosition
  })

  return {
    ...exerciseToMove,
    position: newPosition
  }
}

export function deleteExercise(workoutId, id) {
  const exercises = getExercises(workoutId)
  const exerciseToDelete = exercises.find(e => e.id === id)
  if (!exerciseToDelete) throw new Error('Exercise not found')
  if (exercises.length > 1) {
    // update positions
    const exercisesToUpdate = exercises.filter(e => e.position > exerciseToDelete.position)
    exercisesToUpdate.forEach(e => {
      updateExercise(workoutId, e.id, {
        position: e.position - 1
      })
    })
  }
  removeData('users/' + auth.currentUser.uid + '/workouts/' + workoutId + '/exercises/' + id)
}
