import { auth } from 'src/boot/firebase'
import { uid } from 'quasar'
import { LocalDb } from './localDbService'
import { createData, removeData, updateData } from './firebaseService'
import { LOCALSTORAGE_DB_USER } from 'src/helpers/databaseHelper'
import { PERFORMANCE_TYPE_BAR, PERFORMANCE_TYPE_DEFAULT } from 'src/helpers/performanceHelper'
import { getUser } from './userService'
import { USER_GUEST_UID } from 'src/helpers/userHelper'
import { getExercise, updateExercise } from './exerciseService'
import { getWorkout } from './workoutService'

export function getPerformances(workoutId, exerciseId) {
  const performancesObject = LocalDb.get(LOCALSTORAGE_DB_USER).workouts?.[workoutId]?.exercises?.[exerciseId]?.performances
  if (!performancesObject) return []
  return Object.keys(performancesObject)
    .map((key) => {
      return {
        ...performancesObject[key],
        id: key
      }
    })
    .sort((a, b) => (b.date === a.date ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(b.date) - new Date(a.date)))
}

export function getRelatedExercise(workoutId, exerciseId) {
  const exercise = getExercise(workoutId, exerciseId)
  if (exercise.link?.workout && exercise.link?.exercise) {
    const relatedExercise = getExercise(exercise.link.workout, exercise.link.exercise)
    if (relatedExercise) {
      const relatedExerciseWorkout = getWorkout(exercise.link.workout)
      return { workout: relatedExerciseWorkout, ...relatedExercise }
    } else {
      updateExercise(workoutId, exerciseId, { link: null })
    }
  }
  return null
}

export function getPerformance(workoutId, exerciseId, id) {
  const data = LocalDb.get(LOCALSTORAGE_DB_USER).workouts?.[workoutId]?.exercises?.[exerciseId]?.performances?.[id]
  if (!data) return null
  return {
    ...data,
    id: id
  }
}

export function getRelatedPerformance(workoutId, exerciseId, id) {
  const relatedExercise = getRelatedExercise(workoutId, exerciseId)
  if (relatedExercise) {
    return getPerformance(relatedExercise.workout.id, relatedExercise.id, id)
  }
  return null
}

export function getPerformanceAverage(workoutId, exerciseId, id) {
  const performance = getPerformance(workoutId, exerciseId, id)

  if (!performance) return null
  if (performance.series.length === 0) return null

  const allDefault = performance.series.every((serie) => serie.type === PERFORMANCE_TYPE_DEFAULT)
  const allNoDefault = performance.series.every((serie) => serie.type !== PERFORMANCE_TYPE_DEFAULT)

  if (!allNoDefault && !allDefault) return null

  let value
  if (allDefault) {
    value = performance.series.reduce((acc, serie) => Number(acc) + Number(serie.value), 0) / performance.series.length
  } else {
    value = performance.series.reduce((acc, serie) => Number(acc) + (serie.type === PERFORMANCE_TYPE_BAR ? Number(serie.value) / 2 : Number(serie.value)), 0) / performance.series.length
  }
  return Math.round(value * 100) / 100
}

export async function addPerformance(workoutId, exerciseId, payload, customId = null) {
  const id = customId || uid()

  payload = checkPerformance(payload)

  const user = getUser()
  if (user && user.uid === USER_GUEST_UID) {
    LocalDb.set(LOCALSTORAGE_DB_USER, {
      ...user,
      workouts: {
        ...user.workouts,
        [workoutId]: {
          ...user.workouts?.[workoutId],
          exercises: {
            ...user.workouts?.[workoutId]?.exercises,
            [exerciseId]: {
              ...user.workouts?.[workoutId]?.exercises?.[exerciseId],
              performances: {
                ...user.workouts?.[workoutId]?.exercises?.[exerciseId]?.performances,
                [id]: {
                  ...payload,
                  id: null,
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
    await createData('users/' + auth.currentUser.uid + '/workouts/' + workoutId + '/exercises/' + exerciseId + '/performances/' + id, { ...payload, id: null })
  }

  return {
    ...payload,
    id: id
  }
}

export async function addPerformanceWithRelated(workoutId, exerciseId, payload) {
  const performance = await addPerformance(workoutId, exerciseId, payload)

  const exercise = getExercise(workoutId, exerciseId)

  const relatedExercise = getRelatedExercise(workoutId, exerciseId)
  if (relatedExercise) {
    addPerformance(exercise.link.workout, exercise.link.exercise, payload, performance.id)
  }

  return performance
}

export async function updatePerformance(workoutId, exerciseId, id, payload) {
  const user = getUser()
  if (user && user.uid === USER_GUEST_UID) {
    LocalDb.set(LOCALSTORAGE_DB_USER, {
      ...user,
      workouts: {
        ...user.workouts,
        [workoutId]: {
          ...user.workouts?.[workoutId],
          exercises: {
            ...user.workouts?.[workoutId]?.exercises,
            [exerciseId]: {
              ...user.workouts?.[workoutId]?.exercises?.[exerciseId],
              performances: {
                ...user.workouts?.[workoutId]?.exercises?.[exerciseId]?.performances,
                [id]: {
                  ...user.workouts?.[workoutId]?.exercises?.[exerciseId]?.performances?.[id],
                  ...payload,
                  id: null,
                  updatedAt: new Date().toISOString()
                }
              }
            }
          }
        }
      }
    })
  } else {
    await updateData('users/' + auth.currentUser.uid + '/workouts/' + workoutId + '/exercises/' + exerciseId + '/performances/' + id, { ...payload, id: null })
  }

  return payload
}

export async function updatePerformanceWithRelated(workoutId, exerciseId, id, payload) {
  const performance = updatePerformance(workoutId, exerciseId, id, payload)

  const relatedExercise = getRelatedExercise(workoutId, exerciseId)

  if (relatedExercise) {
    const relatedPerformance = getPerformance(relatedExercise.workout.id, relatedExercise.id, id)
    if (relatedPerformance) {
      updatePerformance(relatedExercise.workout.id, relatedExercise.id, relatedPerformance.id, payload)
    }
  }

  return performance
}

export async function deletePerformance(workoutId, exerciseId, id) {
  const user = getUser()
  if (user && user.uid === USER_GUEST_UID) {
    LocalDb.set(LOCALSTORAGE_DB_USER, {
      ...user,
      workouts: {
        ...user.workouts,
        [workoutId]: {
          ...user.workouts?.[workoutId],
          exercises: {
            ...user.workouts?.[workoutId]?.exercises,
            [exerciseId]: {
              ...user.workouts?.[workoutId]?.exercises?.[exerciseId],
              performances: Object.keys(user.workouts?.[workoutId]?.exercises?.[exerciseId]?.performances).reduce((acc, key) => {
                if (key !== id) {
                  acc[key] = user.workouts?.[workoutId]?.exercises?.[exerciseId]?.performances[key]
                }
                return acc
              }, {})
            }
          }
        }
      }
    })
  } else {
    await removeData('users/' + auth.currentUser.uid + '/workouts/' + workoutId + '/exercises/' + exerciseId + '/performances/' + id)
  }
}

export async function deletePerformanceWithRelated(workoutId, exerciseId, id) {
  const relatedExercise = getRelatedExercise(workoutId, exerciseId)

  if (relatedExercise) {
    const relatedPerformance = getPerformance(relatedExercise.workout.id, relatedExercise.id, id)
    if (relatedPerformance) {
      deletePerformance(relatedExercise.workout.id, relatedExercise.id, relatedPerformance.id)
    }
  }

  deletePerformance(workoutId, exerciseId, id)
}

function checkPerformance(payload) {
  payload = {
    ...payload,
    comment: payload.comment && payload.comment.trim().length > 0 ? payload.comment.trim() : null
  }
  if (payload.series.length > 0) {
    payload.series = payload.series.filter((serie) => serie.value !== null && serie.value !== '' && serie.value >= 0)
    payload.series = payload.series.map((serie) => {
      return {
        ...serie,
        value: Number(serie.value)
      }
    })
    const allDefault = payload.series.every((serie) => serie.type === PERFORMANCE_TYPE_DEFAULT)
    const allNoDefault = payload.series.every((serie) => serie.type !== PERFORMANCE_TYPE_DEFAULT)

    if (!allNoDefault && !allDefault) {
      throw new Error('All series must be of the same type')
    }
  }
  return payload
}
