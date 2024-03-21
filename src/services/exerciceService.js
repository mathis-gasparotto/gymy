import { auth } from 'src/boot/firebase'
import { LocalStorage, uid } from 'quasar'
import { createData, removeData, updateData } from './firebaseService'
import { LOCALSTORAGE_DB_USER } from 'src/helpers/databaseHelper'

export async function getExercices(workoutId) {
  const exercicesObject = await LocalStorage.getItem(LOCALSTORAGE_DB_USER).workouts[workoutId].exercices
  if (!exercicesObject) return []
  return Object.keys(exercicesObject).map(key => {
    return {
      id: key,
      ...exercicesObject[key]
    }
  }).sort((a, b) => a.position - b.position)
}

export async function getExercice(workoutId, id) {
  const data = await LocalStorage.getItem(LOCALSTORAGE_DB_USER).workouts[workoutId].exercices[id]
  if (!data) return null
  return {
    id: id,
    ...data
  }
}

export async function addExercice(workoutId, payload) {
  const id = uid()

  const exercices = await getExercices(workoutId)
  const lastOrder = exercices.length > 0 ? exercices[exercices.length - 1].position : 0

  payload = {
    ...payload,
    position: lastOrder + 1
  }

  createData('users/' + auth.currentUser.uid + '/workouts/' + workoutId + '/exercices/' + id, payload)

  return {
    id: id,
    ...payload
  }
}

export async function updateExercice(workoutId, id, payload) {
  updateData('users/' + auth.currentUser.uid + '/workouts/' + workoutId + '/exercices/' + id, payload)

  return payload
}

export async function moveExercice(workoutId, id, newPosition) {
  if (newPosition < 1) throw new Error('Invalid position')

  const exercices = await getExercices(workoutId)

  if (newPosition > exercices.length) newPosition = exercices.length

  const exerciceToMove = exercices.find(e => e.id === id)

  if (!exerciceToMove) throw new Error('Exercice not found')

  if (exercices.length > 1) {
    // update positions
    if (newPosition > exerciceToMove.position) {
      const exercicesToUpdate = exercices.filter(e => e.position > exerciceToMove.position && e.position <= newPosition)
      exercicesToUpdate.forEach(e => {
        updateExercice(workoutId, e.id, {
          position: e.position - 1
        })
      })
    }
    if (newPosition < exerciceToMove.position) {
      const exercicesToUpdate = exercices.filter(e => e.position < exerciceToMove.position && e.position >= newPosition)
      exercicesToUpdate.forEach(e => {
        updateExercice(workoutId, e.id, {
          position: e.position + 1
        })
      })
    }
  }
  updateExercice(workoutId, id, {
    position: newPosition
  })

  return {
    ...exerciceToMove,
    position: newPosition
  }
}

export async function deleteExercice(workoutId, id) {
  const exercices = await getExercices(workoutId)
  const exerciceToDelete = exercices.find(e => e.id === id)
  if (!exerciceToDelete) throw new Error('Exercice not found')
  if (exercices.length > 1) {
    // update positions
    const exercicesToUpdate = exercices.filter(e => e.position > exerciceToDelete.position)
    exercicesToUpdate.forEach(e => {
      updateExercice(workoutId, e.id, {
        position: e.position - 1
      })
    })
  }
  removeData('users/' + auth.currentUser.uid + '/workouts/' + workoutId + '/exercices/' + id)
}
