import { DEFAULT_NUMBER_OF_SERIES, DEFAULT_REST_TIME } from './userHelper'
import { PERFORMANCE_TYPE_DEFAULT, PERFORMANCE_TYPES } from './performanceHelper'

export const LOCALSTORAGE_DB_USER = 'user'
export const LOCALSTORAGE_DB_SHARED = 'shared_db'

export const LOCALSTORAGE_DATABASES = [LOCALSTORAGE_DB_USER]

export function formatUserLocalStorageDatabase(data) {
  if (!data) return null
  const user = formatUser(data)

  const plans = formatPlans(data.plans)
  user.plans = plans

  const workouts = formatWorkouts(data.workouts)
  user.workouts = workouts

  return user
}

const userProps = [
  {
    name: 'createdAt',
    type: 'datetime',
    default: new Date().toISOString()
  },
  {
    name: 'updatedAt',
    type: 'datetime',
    default: new Date().toISOString()
  },
  {
    name: 'lastLoginAt',
    type: 'datetime',
    default: new Date().toISOString()
  },
  {
    name: 'defaultNumberOfSeries',
    type: 'number',
    default: DEFAULT_NUMBER_OF_SERIES
  },
  {
    name: 'restTime',
    type: 'string',
    default: DEFAULT_REST_TIME
  }
]

const planProps = [
  {
    name: 'createdAt',
    type: 'datetime',
    default: new Date().toISOString()
  },
  {
    name: 'updatedAt',
    type: 'datetime',
    default: new Date().toISOString()
  },
  {
    name: 'position',
    type: 'number'
  },
  {
    name: 'label',
    type: 'string'
  },
  {
    name: 'mondayWorkoutId',
    type: 'string',
    default: null
  },
  {
    name: 'mondayWorkoutLabel',
    type: 'string',
    default: null
  },
  {
    name: 'tuesdayWorkoutId',
    type: 'string',
    default: null
  },
  {
    name: 'tuesdayWorkoutLabel',
    type: 'string',
    default: null
  },
  {
    name: 'wednesdayWorkoutId',
    type: 'string',
    default: null
  },
  {
    name: 'wednesdayWorkoutLabel',
    type: 'string',
    default: null
  },
  {
    name: 'thursdayWorkoutId',
    type: 'string',
    default: null
  },
  {
    name: 'thursdayWorkoutLabel',
    type: 'string',
    default: null
  },
  {
    name: 'fridayWorkoutId',
    type: 'string',
    default: null
  },
  {
    name: 'fridayWorkoutLabel',
    type: 'string',
    default: null
  },
  {
    name: 'saturdayWorkoutId',
    type: 'string',
    default: null
  },
  {
    name: 'saturdayWorkoutLabel',
    type: 'string',
    default: null
  },
  {
    name: 'sundayWorkoutId',
    type: 'string',
    default: null
  },
  {
    name: 'sundayWorkoutLabel',
    type: 'string',
    default: null
  }
]

const workoutProps = [
  {
    name: 'createdAt',
    type: 'datetime',
    default: new Date().toISOString()
  },
  {
    name: 'updatedAt',
    type: 'datetime',
    default: new Date().toISOString()
  },
  {
    name: 'position',
    type: 'number'
  },
  {
    name: 'label',
    type: 'string'
  },
  {
    name: 'comment',
    type: 'string',
    default: null
  },
  {
    name: 'isAbs',
    type: 'boolean',
    default: false
  },
  {
    name: 'restTime',
    type: 'number',
    default: null
  },
  {
    name: 'shareId',
    type: 'string',
    default: null
  }
]

const exerciseProps = [
  {
    name: 'createdAt',
    type: 'datetime',
    default: new Date().toISOString()
  },
  {
    name: 'updatedAt',
    type: 'datetime',
    default: new Date().toISOString()
  },
  {
    name: 'position',
    type: 'number'
  },
  {
    name: 'duration',
    type: 'number',
    default: null
  },
  {
    name: 'forLastSeries',
    type: 'boolean',
    default: false
  },
  {
    name: 'notForLastSeries',
    type: 'boolean',
    default: false
  },
  {
    name: 'abs',
    type: 'boolean',
    default: false
  },
  {
    name: 'restAbs',
    type: 'boolean',
    default: false
  },
  {
    name: 'label',
    type: 'string'
  },
  {
    name: 'config',
    type: 'string',
    default: null
  },
  {
    name: 'isReverse',
    type: 'boolean',
    default: false
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: false
  },
  {
    name: 'linkedTo',
    type: 'object',
    default: null
  }
]

const performanceProps = [
  {
    name: 'createdAt',
    type: 'datetime',
    default: new Date().toISOString()
  },
  {
    name: 'updatedAt',
    type: 'datetime',
    default: new Date().toISOString()
  },
  {
    name: 'date',
    type: 'date',
    default: new Date().toISOString().split('T')[0]
  },
  {
    name: 'comment',
    type: 'string',
    default: null
  }
]

const serieProps = [
  {
    name: 'type',
    type: 'enum',
    choices: PERFORMANCE_TYPES,
    default: PERFORMANCE_TYPE_DEFAULT
  },
  {
    name: 'value',
    type: 'number',
    default: null
  }
]

function formatUser(data) {
  let toReturn = {}
  userProps.forEach((prop) => {
    if (prop.type === 'datetime') {
      return (toReturn[prop.name] = data[prop.name] && new Date(data[prop.name]) ? new Date(data[prop.name]).toISOString() : prop.default)
    }
    if (prop.name === 'restTime') {
      return (toReturn[prop.name] = data[prop.name].match(/^-?[\d]?[\d]:[0-5]\d$/) ? data[prop.name] : DEFAULT_REST_TIME)
    }
    if (typeof toReturn[prop.name] !== prop.type) {
      return (toReturn[prop.name] = prop.default)
    }
    toReturn[prop.name] = data[prop.name]
  })
  return toReturn
}

function formatPlans(plans) {
  const planIds = Object.keys(plans || {})
  return planIds.length > 0
    ? planIds.reduce((acc, id, index) => {
        acc[id] = {}
        planProps.forEach((prop) => {
          if (prop.type === 'datetime') {
            return (acc[id][prop.name] = plans[id][prop.name] && new Date(plans[id][prop.name]) ? new Date(plans[id][prop.name]).toISOString() : prop.default)
          }
          if (typeof plans[id][prop.name] !== prop.type) {
            if (prop.name === 'position') {
              return (acc[id][prop.name] = index + 1)
            }
            if (prop.name === 'label') {
              return (acc[id][prop.name] = 'Plan ' + (index + 1))
            }
            return (acc[id][prop.name] = prop.default)
          }
          acc[id][prop.name] = plans[id][prop.name]
        })
        return acc
      }, {})
    : null
}

function formatWorkouts(workouts) {
  const workoutIds = Object.keys(workouts || {})
  return workoutIds.length > 0
    ? workoutIds.reduce((workoutAcc, workoutId, index) => {
        workoutAcc[workoutId] = {}
        workoutProps.forEach((prop) => {
          if (prop.type === 'datetime') {
            return (workoutAcc[workoutId][prop.name] = workouts[workoutId][prop.name] && new Date(workouts[workoutId][prop.name]) ? new Date(workouts[workoutId][prop.name]).toISOString() : prop.default)
          }
          if (typeof workouts[workoutId][prop.name] !== prop.type) {
            if (prop.name === 'position') {
              return (workoutAcc[workoutId][prop.name] = index + 1)
            }
            if (prop.name === 'label') {
              return (workoutAcc[workoutId][prop.name] = 'Entraînement ' + (index + 1))
            }
            return (workoutAcc[workoutId][prop.name] = prop.default)
          }
          workoutAcc[workoutId][prop.name] = workouts[workoutId][prop.name]
        })

        const exercises = formatExercises(workouts[workoutId].exercises)
        workoutAcc[workoutId].exercises = exercises

        return workoutAcc
      }, {})
    : null
}

function formatExercises(exercises) {
  const exerciseIds = Object.keys(exercises || {})
  return exerciseIds.length > 0
    ? exerciseIds.reduce((exerciseAcc, exerciseId, index) => {
        exerciseAcc[exerciseId] = {}
        exerciseProps.forEach((prop) => {
          if (prop.type === 'datetime') {
            return (exerciseAcc[exerciseId][prop.name] = exercises[exerciseId][prop.name] && new Date(exercises[exerciseId][prop.name]) ? new Date(exercises[exerciseId][prop.name]).toISOString() : prop.default)
          }
          if (typeof exercises[exerciseId][prop.name] !== prop.type) {
            if (prop.name === 'position') {
              return (exerciseAcc[exerciseId][prop.name] = index + 1)
            }
            if (prop.name === 'label') {
              return (exerciseAcc[exerciseId][prop.name] = 'Exercice ' + (index + 1))
            }
            return (exerciseAcc[exerciseId][prop.name] = prop.default)
          }
          exerciseAcc[exerciseId][prop.name] = exercises[exerciseId][prop.name]
        })

        const performances = formatPerformances(exercises[exerciseId].performances)
        exerciseAcc[exerciseId].performances = performances

        return exerciseAcc
      }, {})
    : null
}

function formatPerformances(performances) {
  const performanceIds = Object.keys(performances || {})
  return performanceIds.length > 0
    ? performanceIds.reduce((performanceAcc, performanceId, index) => {
        performanceAcc[performanceId] = {}
        performanceProps.forEach((prop) => {
          if (prop.type === 'datetime') {
            return (performanceAcc[performanceId][prop.name] = performances[performanceId][prop.name] && new Date(performances[performanceId][prop.name]) ? new Date(performances[performanceId][prop.name]).toISOString() : prop.default)
          }
          if (prop.type === 'date') {
            return (performanceAcc[performanceId][prop.name] = performances[performanceId][prop.name] && new Date(performances[performanceId][prop.name]) ? new Date(performances[performanceId][prop.name]).toISOString().split('T')[0] : prop.default)
          }
          if (typeof performances[performanceId][prop.name] !== prop.type) {
            if (prop.name === 'position') {
              return (performanceAcc[performanceId][prop.name] = index + 1)
            }
            if (prop.name === 'label') {
              return (performanceAcc[performanceId][prop.name] = 'Performance ' + (index + 1))
            }
            return (performanceAcc[performanceId][prop.name] = prop.default)
          }
          performanceAcc[performanceId][prop.name] = performances[performanceId][prop.name]
        })

        const series = formatSeries(performances[performanceId].series)
        performanceAcc[performanceId].series = Object.keys(series).length > 0 ? series : null

        return performanceAcc
      }, {})
    : null
}

function formatSeries(series) {
  const serieIds = Object.keys(series || {})
  return serieIds.length > 0
    ? serieIds.reduce((serieAcc, serieId) => {
        // return serieAcc if no value
        if (typeof series[serieId].value !== 'number') return serieAcc

        serieAcc[serieId] = {}
        serieProps.forEach((prop) => {
          if (prop.name === 'type') {
            return (serieAcc[serieId][prop.name] = PERFORMANCE_TYPES.includes(series[serieId][prop.name]) ? series[serieId][prop.name] : prop.default)
          }
          if (typeof series[serieId][prop.name] !== prop.type) {
            return (serieAcc[serieId][prop.name] = prop.default)
          }
          serieAcc[serieId][prop.name] = series[serieId][prop.name]
        })

        return serieAcc
      }, {})
    : null
}
