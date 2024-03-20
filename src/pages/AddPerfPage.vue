<template>
  <q-page class="flex h-100 column">
    <ChoiceWorkout v-if="selectStep === 1" @selectWorkout="selectWorkout"></ChoiceWorkout>
    <ChoiceExercice v-if="selectStep === 2" :workoutId="workout.id" @selectExercice="selectExercice"></ChoiceExercice>
    <AddPerfExercice v-if="selectStep === 3" :label="exercice.label" @submit="submit"></AddPerfExercice>
  </q-page>
</template>

<script>
import AddPerfExercice from 'src/components/AddPerf/AddPerfExercice.vue'
import ChoiceWorkout from 'src/components/AddPerf/ChoiceWorkout.vue'
import ChoiceExercice from 'src/components/AddPerf/ChoiceExercice.vue'
import { addPerformance } from 'src/services/performanceService'
import { errorNotify, successNotify } from 'src/services/notify'

export default {
  name: 'AddPerfPage',
  components: {
    AddPerfExercice,
    ChoiceWorkout,
    ChoiceExercice
  },
  data () {
    return {
      selectStep: 1,
      workout: null,
      exercice: null,
    }
  },
  methods: {
    selectWorkout(workout) {
      this.workout = workout
      this.selectStep = 2
    },
    selectExercice(exercice) {
      this.exercice = exercice
      this.selectStep = 3
    },
    submit(payload) {
      addPerformance(this.workout.id, this.exercice.id, payload).then(() => {
        successNotify('Performance ajoutée')
        this.$router.push({name: 'index'})
      }).catch(() => {
        errorNotify('Erreur lors de l\'ajout de la performance')
      })
    }
  }
}
</script>
