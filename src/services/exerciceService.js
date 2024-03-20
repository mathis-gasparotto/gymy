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
  }).sort((a, b) => a.order - b.order)
}

export function getExercice(workoutId, id) {
  const data = LocalStorage.getItem(LOCALSTORAGE_DB_USER).workouts[workoutId].exercices[id]
  if (!data) return null
  return {
    id: id,
    ...data
  }
}

export async function addExercice(workoutId, payload) {
  const id = uid()

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

export async function deleteExercice(workoutId, id) {
  removeData('users/' + auth.currentUser.uid + '/workouts/' + workoutId + '/exercices/' + id)
}
