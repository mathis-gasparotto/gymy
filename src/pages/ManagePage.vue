<template>
  <q-page class="flex h-100 column page-content">
    <q-btn
      color="primary"
      label="Retour"
      v-if="workoutSelected"
      class="q-mb-lg w-content"
      icon="arrow_back"
      @click="workoutSelected = null"
    />
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
