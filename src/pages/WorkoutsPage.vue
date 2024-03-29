<template>
  <ChoiceWorkout @selectWorkout="selectWorkout" />
</template>

<script>
import ChoiceWorkout from 'src/components/AddPerf/ChoiceWorkout.vue'

export default {
  name: 'WorkoutsPage',
  components: {
    ChoiceWorkout
  },
  methods: {
    selectWorkout(workout) {
      this.$router.push({
        name: 'exercises',
        params: {
          workoutId: workout.id
        }
      })
    }
  }
}
</script>
