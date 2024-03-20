<template>
  <div class="flex column page-content">
    <p class="text-h6 q-py-md q-px-md bg-primary text-center text-bold color-white rounded">
      Choix de l'entrainement
    </p>
    <div v-if="workouts && workouts.length > 0">
      <q-card v-for="workout in workouts" :key="workout.id" @click="$emit('selectWorkout', workout)" class="clickable q-mb-md flex-center column q-px-md">
        <q-card-section>
          <div class="text-h6">
            {{ workout.label }}
          </div>
        </q-card-section>
      </q-card>
    </div>
    <span v-else class="text-center">Aucun entrainement de disponible</span>
  </div>
</template>

<script>
import { getWorkouts } from 'src/services/workoutService'

export default {
  name: 'ChoiceWorkout',
  emits: ['selectWorkout'],
  data() {
    return {
      workouts: {}
    }
  },
  created() {
    this.initWorkouts()
  },
  methods: {
    async initWorkouts() {
      this.workouts = await getWorkouts()
    }
  }
}
</script>

<style scoped lang="scss">
</style>
