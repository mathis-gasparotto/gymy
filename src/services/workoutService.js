import { auth } from 'src/boot/firebase'
import { LocalStorage, uid } from 'quasar'
import { createData, removeData, updateData } from './firebaseService'
import { LOCALSTORAGE_DB_USER } from 'src/helpers/databaseHelper'

export async function getWorkouts() {
  const workoutsObject = await LocalStorage.getItem(LOCALSTORAGE_DB_USER).workouts
  if (!workoutsObject) return []
  return Object.keys(workoutsObject).map(key => {
    return {
      id: key,
      ...workoutsObject[key]
    }
  }).sort((a, b) => Date(b.createdAt) - Date(a.createdAt))
}

export async function getWorkout(id) {
  const data = await LocalStorage.getItem(LOCALSTORAGE_DB_USER).workouts[id]
  if (!data) return null
  return {
    id: id,
    ...data
  }
}

export async function addWorkout(payload) {
  const id = uid()

  createData('users/' + auth.currentUser.uid + '/workouts/' + id, payload)

  return {
    id: id,
    ...payload
  }
}

export async function updateWorkout(id, payload) {
  updateData('users/' + auth.currentUser.uid + '/workouts/' + id, payload)

  return payload
}

export async function deleteWorkout(id) {
  removeData('users/' + auth.currentUser.uid + '/workouts/' + id)
}
