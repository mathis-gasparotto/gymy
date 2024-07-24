import { LocalStorage, } from 'quasar'
import { retrieveData } from './firebaseService'
import { LOCALSTORAGE_DB_SHARED } from 'src/helpers/databaseHelper'
import { getUser } from './userService'
import { SHARED_DATA_TYPE_WORKOUT } from 'src/helpers/shareHelper'
import { addWorkout } from './workoutService'
import { addExercise } from './exerciseService'

export async function addSharedContentToOwnDB(shareId) {
  const user = getUser()
  const shareData = LocalStorage.getItem(LOCALSTORAGE_DB_SHARED)[shareId]
  if (!shareData) throw new Error('Shared data not found')
  if (shareData.userId === user.uid) throw new Error('You cannot add your own shared content')
  const author = await retrieveData('users/' + shareData.userId)
  if (!author) throw new Error('Author not found')

  let sharedData
  switch (shareData.type) {
    case SHARED_DATA_TYPE_WORKOUT:
      sharedData = author.workouts[shareData.workoutId]
      break
    default:
      throw new Error('Shared data corrupted')
  }

  if (!sharedData) throw new Error('Shared data not found')

  switch (shareData.type) {
    case SHARED_DATA_TYPE_WORKOUT:
      const workout = await addWorkout({
        ...sharedData,
        label: sharedData.label + ' (by ' + author.username + ')',
        exercises: null,
        shareId: null
      })
      const exercises = Object.keys(sharedData.exercises).map(key => {
        return {
          ...sharedData.exercises[key],
          id: null,
          performances: null
        }
      }).sort((a, b) => a.position - b.position)

      await Promise.all(exercises.map((exercise) => {
        return addExercise(workout.id, exercise)
      }))

      return {name: 'exercises', params: {workoutId: workout.id} }
  }

}
