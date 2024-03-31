import { auth } from 'src/boot/firebase'
import { LocalStorage, uid } from 'quasar'
import { createData, removeData, updateData } from './firebaseService'
import { LOCALSTORAGE_DB_USER } from 'src/helpers/databaseHelper'
import { PERFORMANCE_TYPE_BAR, PERFORMANCE_TYPE_DEFAULT } from 'src/helpers/performanceHelper'
import { getUser } from './userService'
import { USER_GUEST_UID } from 'src/helpers/userHelper'

export function getPerformances(workoutId, exerciseId) {
  const performancesObject = LocalStorage.getItem(LOCALSTORAGE_DB_USER).workouts[workoutId].exercises[exerciseId].performances
  if (!performancesObject) return []
  return Object.keys(performancesObject).map(key => {
    return {
      id: key,
      ...performancesObject[key]
    }
  }).sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function getPerformance(workoutId, exerciseId, id) {
  const data = LocalStorage.getItem(LOCALSTORAGE_DB_USER).workouts[workoutId].exercises[exerciseId].performances[id]
  if (!data) return null
  return {
    id: id,
    ...data
  }
}

export function getPerformanceAverage(workoutId, exerciseId, id) {
  const performance = getPerformance(workoutId, exerciseId, id)

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

export async function addPerformance(workoutId, exerciseId, payload) {
  const id = uid()

  payload = checkPerformance(payload)

  const user = getUser()
  if (user.uid === USER_GUEST_UID) {
    LocalStorage.set(LOCALSTORAGE_DB_USER, {
      ...user,
      workouts: {
        ...user.workouts,
        [workoutId]: {
          ...user.workouts[workoutId],
          exercises: {
            ...user.workouts[workoutId].exercises,
            [exerciseId]: {
              ...user.workouts[workoutId].exercises[exerciseId],
              performances: {
                ...user.workouts[workoutId].exercises[exerciseId].performances,
                [id]: {
                  ...payload,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              }
            }
          }
        }
      }
    })
  } else {
    await createData('users/' + (auth.currentUser ? auth.currentUser.uid : getUser().uid) + '/workouts/' + workoutId + '/exercises/' + exerciseId + '/performances/' + id, payload)
  }

  return {
    id: id,
    ...payload
  }
}

export async function updatePerformance(workoutId, exerciseId, id, payload) {

  payload = checkPerformance(payload)

  const user = getUser()
  if (user.uid === USER_GUEST_UID) {
    LocalStorage.set(LOCALSTORAGE_DB_USER, {
      ...user,
      workouts: {
        ...user.workouts,
        [workoutId]: {
          ...user.workouts[workoutId],
          exercises: {
            ...user.workouts[workoutId].exercises,
            [exerciseId]: {
              ...user.workouts[workoutId].exercises[exerciseId],
              performances: {
                ...user.workouts[workoutId].exercises[exerciseId].performances,
                [id]: {
                  ...user.workouts[workoutId].exercises[exerciseId].performances[id],
                  ...payload,
                  updatedAt: new Date().toISOString()
                }
              }
            }
          }
        }
      }
    })
  } else {
    await updateData('users/' + (auth.currentUser ? auth.currentUser.uid : getUser().uid) + '/workouts/' + workoutId + '/exercises/' + exerciseId + '/performances/' + id, payload)
  }

  return payload
}

export async function deletePerformance(workoutId, exerciseId, id) {
  const user = getUser()
  if (user.uid === USER_GUEST_UID) {
    LocalStorage.set(LOCALSTORAGE_DB_USER, {
      ...user,
      workouts: {
        ...user.workouts,
        [workoutId]: {
          ...user.workouts[workoutId],
          exercises: {
            ...user.workouts[workoutId].exercises,
            [exerciseId]: {
              ...user.workouts[workoutId].exercises[exerciseId],
              performances: Object.keys(user.workouts[workoutId].exercises[exerciseId].performances).reduce((acc, key) => {
                if (key !== id) {
                  acc[key] = user.workouts[workoutId].exercises[exerciseId].performances[key]
                }
                return acc
              }, {})
            }
          }
        }
      }
    })
  } else {
    await removeData('users/' + (auth.currentUser ? auth.currentUser.uid : getUser().uid) + '/workouts/' + workoutId + '/exercises/' + exerciseId + '/performances/' + id)
  }
}

function checkPerformance(payload) {
  payload = {
    ...payload,
    comment: payload.comment && payload.comment.trim().length > 0 ? payload.comment.trim() : null
  }
  if (payload.series.length > 0) {
    payload.series = payload.series.filter(serie => serie.value !== null && serie.value!== '' && serie.value >= 0)
    payload.series = payload.series.map(serie => {
      return {
        ...serie,
        value: Number(serie.value)
      }
    })
    const allDefault = payload.series.every(serie => serie.type === PERFORMANCE_TYPE_DEFAULT)
    const allNoDefault = payload.series.every(serie => serie.type !== PERFORMANCE_TYPE_DEFAULT)

    if (!allNoDefault && !allDefault) {
      throw new Error('All series must be of the same type')
    }
  }
  return payload
}
