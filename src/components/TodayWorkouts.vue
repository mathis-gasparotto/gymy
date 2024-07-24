<template>
  <div class="column flex-center">
    <h2 class="text-h5 q-mb-0">Entraînements d'aujourd'hui</h2>
    <div v-if="todayWorkouts.length === 0" class="q-mt-md">Aucun programme...</div>
    <div v-for="plan in todayWorkouts" :key="plan.id">
      <h3 class="text-h6 text-center">{{ plan.label }}</h3>
      <q-card v-if="plan.workout" @click="plan.workout.id ? $router.push({name: 'exercises', params: {workoutId: plan.workout.id }}) : undefined" class="cursor-pointer q-mb-md flex-center column q-px-md" >
        <q-card-section>
          <div class="text-h6 text-center">
            {{ plan.workout.label }}
          </div>
          <div v-if="plan.workout.comment" class="text-center">
            {{ plan.workout.comment }}
          </div>
        </q-card-section>
      </q-card>
      <q-card v-else class="q-mb-md flex-center column q-px-md" >
        <q-card-section>
          <div class="text-h6 text-center">
            Repos 😌
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { getTodayWorkouts } from 'src/services/planService'

export default {
  name: 'TodayWorkouts',
  data() {
    return {
      todayWorkouts: []
    }
  },
  created() {
    this.todayWorkouts = getTodayWorkouts()
  }
}
</script>

<style scoped lang="scss">
</style>
