<template>
  <div class="flex column">
    <GymyHeader text="Choix de l'exercice" />
    <div v-if="exercices && exercices.length > 0">
      <q-card  v-for="exercice in exercices" :key="exercice.id" class="q-mb-md flex-center column q-px-md">
        <q-card-section>
          <div class="text-h6">
            {{ exercice.label }}
          </div>
        </q-card-section>
        <q-card-actions horizontal class="absolute-right no-wrap">
          <q-btn flat round color="primary" icon="edit" />
          <q-btn flat round color="negative" icon="delete" />
        </q-card-actions>
      </q-card>
    </div>
    <span v-else class="text-center">Aucun exercice de disponible</span>
  </div>
</template>

<script>
import { getExercices } from 'src/services/exerciceService'
import GymyHeader from 'src/components/GymyHeader.vue'

export default {
  name: 'ManageExercices',
  props: {
    workout: {
      type: Object,
      required: true
    }
  },
  components: {
    GymyHeader
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
      this.exercices = await getExercices(this.workout.id)
    }
  }
}
</script>

<style scoped lang="scss">
</style>
