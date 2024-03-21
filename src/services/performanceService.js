import { auth } from 'src/boot/firebase'
import { LocalStorage, uid } from 'quasar'
import { createData, removeData, updateData } from './firebaseService'
import { LOCALSTORAGE_DB_USER } from 'src/helpers/databaseHelper'
import { PERFORMANCE_TYPE_BAR, PERFORMANCE_TYPE_DEFAULT } from 'src/helpers/performanceHelper'

export async function getPerformances(workoutId, exerciceId) {
  const performancesObject = await LocalStorage.getItem(LOCALSTORAGE_DB_USER).workouts[workoutId].exercices[exerciceId].performances
  if (!performancesObject) return []
  return Object.keys(performancesObject).map(key => {
    return {
      id: key,
      ...performancesObject[key]
    }
  }).sort((a, b) => new Date(b.date) - new Date(a.date))
}

export async function getPerformance(workoutId, exerciceId, id) {
  const data = await LocalStorage.getItem(LOCALSTORAGE_DB_USER).workouts[workoutId].exercices[exerciceId].performances[id]
  if (!data) return null
  return {
    id: id,
    ...data
  }
}

export async function getPerformanceAverage(workoutId, exerciceId, id) {
  const performance = await getPerformance(workoutId, exerciceId, id)

  if (!performance) return null
  if (performance.series.length === 0) return null

  const allDefault = performance.series.every(serie => serie.type === PERFORMANCE_TYPE_DEFAULT)
  const allNoDefault = performance.series.every(serie => serie.type !== PERFORMANCE_TYPE_DEFAULT)

  if (!allNoDefault && !allDefault) return null

  let value
  if (allDefault) {
    value = performance.series.reduce((acc, serie) => Number(acc) + Number(serie.value), 0) / performance.series.length
  } else {
    value = performance.series.reduce((acc, serie) => Number(acc) + (serie.type === PERFORMANCE_TYPE_BAR ? Number(serie.value) / 2 : Number(serie.value)), 0) / performance.series.length
  }
  return Math.round(value * 100) / 100
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
