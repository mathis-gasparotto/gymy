<template>
  <q-page class="flex h-100 column page-content">
    <ManageWorkouts v-if="!workoutSelected" @selectWorkout="(workout) => workoutSelected = workout" />
    <ManageExercices v-else :workout="workoutSelected" />
  </q-page>
</template>

<script>
import ManageWorkouts from 'src/components/Manage/ManageWorkouts.vue'
import ManageExercices from 'src/components/Manage/ManageExercices.vue'

export default {
  name: 'ManagePage',
  components: {
    ManageWorkouts,
    ManageExercices
  },
  data() {
    return {
      workoutSelected: null
    }
  }
}
</script>
