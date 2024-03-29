<template>
  <AddPerfExercise class="q-mb-lg" :workout="workout" :exercise="exercise" @reloadPerformances="reloadPerformances" />
  <PerformanceList :workout="workout" :exercise="exercise" @reloadPerformances="reloadPerformances" ref="performanceList" />
  <PerformancesGraph :workoutId="workout.id" :exerciseId="exercise.id" ref="performanceGraph" />
</template>

<script>
import AddPerfExercise from 'src/components/AddPerf/AddPerfExercise.vue'
import PerformanceList from 'src/components/AddPerf/PerformanceList.vue'
import PerformancesGraph from 'src/components/PerformancesGraph/PerformancesGraph.vue'
import { getExercise } from 'src/services/exerciseService'
import { getWorkout } from 'src/services/workoutService'

export default {
  name: 'PerformancesPage',
  components: {
    AddPerfExercise,
    PerformanceList,
    PerformancesGraph
  },
  data () {
    return {
      workout: null,
      exercise: null,
    }
  },
  created() {
    this.loadWorkout()
    this.loadExercise()
  },
  methods: {
    loadWorkout() {
      this.workout = getWorkout(this.$route.params.workoutId)
      if (!this.workout) {
        errorNotify('Impossible de charger l\'entraînement')
        this.$router.push({name: 'workouts'})
      }
    },
    loadExercise() {
      this.exercise = getExercise(this.$route.params.workoutId, this.$route.params.exerciseId)
      if (!this.exercise) {
        errorNotify('Impossible de charger l\'exercise')
        this.$router.push({name: 'exercises', params: {workoutId: this.$route.params.workoutId}})
      }
    },
    reloadPerformances() {
      this.$refs.performanceList.loadPerformances()
      this.$refs.performanceGraph.loadPerformances()
    }
  }
}
</script>
