<template>
  <ChoiceExercise :workout="workout" @selectExercise="selectExercise" />
</template>

<script>
import ChoiceExercise from 'src/components/AddPerf/ChoiceExercise.vue'
import { errorNotify } from 'src/helpers/notifyHelper'
import { getWorkout } from 'src/services/workoutService'

export default {
  name: 'ExercisesPage',
  components: {
    ChoiceExercise
  },
  data () {
    return {
      workout: null,
    }
  },
  created() {
    this.loadWorkout()
  },
  methods: {
    loadWorkout() {
      this.workout = getWorkout(this.$route.params.workoutId)
      if (!this.workout) {
        errorNotify('Impossible de charger l\'entraînement')
        this.$router.push({name: 'workouts'})
      }
    },
    selectExercise(exercise) {
      this.$router.push({
        name: 'performances',
        params: {
          workoutId: this.$route.params.workoutId,
          exerciseId: exercise.id
        }
      })
    }
  }
}
</script>
