<template>
  <div class="flex column page-content">
    <p class="text-h6 q-py-md q-px-md bg-primary text-center text-bold color-white rounded">
      Choix de l'exercice
    </p>
    <div v-if="exercices && exercices.length > 0">
      <q-card  v-for="exercice in exercices" :key="exercice.id" @click="$emit('selectExercice', exercice)" class="clickable q-mb-md flex-center column q-px-md">
        <q-card-section>
          <div class="text-h6">
            {{ exercice.label }}
          </div>
        </q-card-section>
      </q-card>
    </div>
    <span v-else class="text-center">Aucun exercice de disponible</span>
  </div>
</template>

<script>
import { getExercices } from 'src/services/exerciceService'

export default {
  name: 'ChoiceExercice',
  emits: ['selectExercice'],
  props: {
    workoutId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      exercices: {}
    }
  },
  created() {
    this.initExercices()
  },
  methods: {
    async initExercices() {
      this.exercices = await getExercices(this.workoutId)
    }
  }
}
</script>

<style scoped lang="scss">
</style>
