import { auth } from 'src/boot/firebase'
import { LocalStorage, uid } from 'quasar'
import { createData, removeData, updateData } from './firebaseService'
import { LOCALSTORAGE_DB_USER } from 'src/helpers/databaseHelper'

export async function getPerformances(workoutId, exerciceId) {
  const performancesObject = await LocalStorage.getItem(LOCALSTORAGE_DB_USER).exercices[workoutId].exercices[exerciceId].performances
  if (!performancesObject) return []
  return Object.keys(performancesObject).map(key => {
    return {
      id: key,
      ...performancesObject[key]
    }
  }).sort((a, b) => Date(b.date) - Date(a.date))
}

export async function getPerformance(workoutId, exerciceId, id) {
  const data = await LocalStorage.getItem(LOCALSTORAGE_DB_USER).workouts[workoutId].exercices[exerciceId].performances[id]
  if (!data) return null
  return {
    id: id,
    ...data
  }
}

export async function addPerformance(workoutId, exerciceId, payload) {
  const id = uid()

  createData('users/' + auth.currentUser.uid + '/workouts/' + workoutId + '/exercices/' + exerciceId + '/performances/' + id, payload)

  return {
    id: id,
    ...payload
  }
}

export async function updatePerformance(workoutId, exerciceId, id, payload) {
  updateData('users/' + auth.currentUser.uid + '/workouts/' + workoutId + '/exercices/' + exerciceId + '/performances/' + id, payload)

  return payload
}

export async function deletePerformance(workoutId, exerciceId, id) {
  removeData('users/' + auth.currentUser.uid + '/workouts/' + workoutId + '/exercices/' + exerciceId + '/performances/' + id)
}
