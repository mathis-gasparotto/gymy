<template>
  <q-page class="flex h-100 column page-content">
    <q-linear-progress :value="(selectStep-1)/3" class="q-mb-lg q-mt-md w-80 q-mx-auto" />
    <q-btn
      color="primary"
      label="Retour"
      v-if="selectStep > 1"
      class="q-mb-lg w-content"
      icon="arrow_back"
      @click="selectStep -= 1"
    />
    <ChoiceWorkout v-if="selectStep === 1" @selectWorkout="selectWorkout" />
    <ChoiceExercice v-if="selectStep === 2" :workout="workout" @selectExercice="selectExercice" />
    <AddPerfExercice class="q-mb-lg" v-if="selectStep === 3" :workout="workout" :exercice="exercice" @reloadPerformances="$refs.performanceList.loadPerformances()" />
    <PerformanceList v-if="selectStep === 3" :workout="workout" :exercice="exercice" ref="performanceList" />
  </q-page>
</template>

<script>
import AddPerfExercice from 'src/components/AddPerf/AddPerfExercice.vue'
import ChoiceWorkout from 'src/components/AddPerf/ChoiceWorkout.vue'
import ChoiceExercice from 'src/components/AddPerf/ChoiceExercice.vue'
import PerformanceList from 'src/components/AddPerf/PerformanceList.vue'
import { addPerformance } from 'src/services/performanceService'
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'

export default {
  name: 'AddPerfPage',
  components: {
    AddPerfExercice,
    ChoiceWorkout,
    ChoiceExercice,
    PerformanceList
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
    }
  }
}
</script>
