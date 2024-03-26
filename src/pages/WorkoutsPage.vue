<template>
  <q-page class="flex h-100 column page-content">
    <q-linear-progress :value="(selectStep-1)/2" class="q-mb-lg q-mt-md w-80 q-mx-auto" />
    <q-btn
      color="primary"
      label="Retour"
      v-if="selectStep > 1"
      class="q-mb-lg w-content"
      icon="arrow_back"
      @click="selectStep -= 1"
    />
    <ChoiceWorkout v-if="selectStep === 1" @selectWorkout="selectWorkout" />
    <ChoiceExercise v-if="selectStep === 2 && workout" :workout="workout" @selectExercise="selectExercise" />
    <AddPerfExercise class="q-mb-lg" v-if="selectStep === 3 && workout && exercise" :workout="workout" :exercise="exercise" @reloadPerformances="reloadPerformances" />
    <PerformanceList v-if="selectStep === 3 && workout && exercise" :workout="workout" :exercise="exercise" @reloadPerformances="reloadPerformances" ref="performanceList" />
    <PerformancesGraph v-if="selectStep === 3 && workout && exercise" :workoutId="workout.id" :exerciseId="exercise.id" ref="performanceGraph" />
  </q-page>
</template>

<script>
import AddPerfExercise from 'src/components/AddPerf/AddPerfExercise.vue'
import ChoiceWorkout from 'src/components/AddPerf/ChoiceWorkout.vue'
import ChoiceExercise from 'src/components/AddPerf/ChoiceExercise.vue'
import PerformanceList from 'src/components/AddPerf/PerformanceList.vue'
import PerformancesGraph from 'src/components/PerformancesGraph/PerformancesGraph.vue'

export default {
  name: 'WorkoutsPage',
  components: {
    AddPerfExercise,
    ChoiceWorkout,
    ChoiceExercise,
    PerformanceList,
    PerformancesGraph
  },
  data () {
    return {
      selectStep: 1,
      workout: null,
      exercise: null,
    }
  },
  methods: {
    selectWorkout(workout) {
      this.workout = workout
      this.selectStep = 2
    },
    selectExercise(exercise) {
      this.exercise = exercise
      this.selectStep = 3
    },
    reloadPerformances() {
      this.$refs.performanceList.loadPerformances()
      this.$refs.performanceGraph.loadPerformances()
    }
  }
}
</script>
