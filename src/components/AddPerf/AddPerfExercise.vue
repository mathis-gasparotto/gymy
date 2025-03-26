<template>
  <div class="flex flex-center column">
    <q-card class="q-mb-md flex-center column q-px-none q-px-xs-md">
      <q-card-section>
        <div class="text-h6 text-center">{{ workout.label }} - {{ exercise.label }}</div>
        <div
          v-if="exercise.config"
          class="text-center"
        >
          ({{ exercise.config }})
        </div>
      </q-card-section>
      <q-separator />
      <PerformanceForm
        ref="addPerfForm"
        :exercise="exercise"
        @submit="submit"
        :loading="addLoading"
      />
    </q-card>
  </div>
</template>

<script>
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'
import { addPerformanceWithRelated } from 'src/services/performanceService'
import translatting from 'src/helpers/translatting'
import PerformanceForm from 'src/components/AddPerf/PerformanceForm.vue'

export default {
  name: 'AddPerfExercise',
  components: {
    PerformanceForm
  },
  emits: ['reloadPerformances'],
  props: {
    workout: {
      type: Object,
      required: true
    },
    exercise: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      addLoading: false
    }
  },
  updated() {
    this.$refs.addPerfForm.initInputs()
  },
  methods: {
    submit(payload) {
      this.addLoading = true
      addPerformanceWithRelated(this.workout.id, this.exercise.id, payload)
        .then(() => {
          this.$emit('reloadPerformances')
          successNotify('Performance ajoutée')
          this.$refs.addPerfForm.initInputs()
        })
        .catch((err) => {
          errorNotify(translatting().translateError(err, "Erreur lors de l'ajout de la performance"))
        })
        .finally(() => {
          this.addLoading = false
        })
    }
  }
}
</script>

<style scoped lang="scss"></style>
