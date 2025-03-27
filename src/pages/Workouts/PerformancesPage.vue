<template>
  <div class="flex justify-between justify-xs-center gap-20">
    <div>
      <q-btn
        v-if="previousExercise"
        color="negative"
        label="Précédent"
        class="q-mb-lg w-content"
        icon="arrow_back"
        :to="{ name: 'performances', params: { workoutId: $route.params.workoutId, exerciseId: previousExercise.id } }"
      />
    </div>
    <div>
      <q-btn
        v-if="nextExercise"
        color="secondary"
        :label="nextExercise.abs ? 'Abs' : 'Suivant'"
        class="q-mb-lg w-content"
        icon-right="arrow_forward"
        :to="nextExercise.abs ? { name: 'abs' } : { name: 'performances', params: { workoutId: $route.params.workoutId, exerciseId: nextExercise.id } }"
      />
    </div>
  </div>
  <AddPerfExercise
    class="q-mb-lg"
    :workout="workout"
    :exercise="exercise"
    @reloadPerformances="reloadPerformances"
  />
  <PerformanceList
    :workout="workout"
    :exercise="exercise"
    @reloadPerformances="reloadPerformances"
    ref="performanceList"
  />
  <PerformancesGraph
    :workoutId="workout.id"
    :exerciseId="exercise.id"
    ref="performanceGraph"
    :reversed="exercise.isReverse ?? false"
  />
</template>

<script>
import AddPerfExercise from 'src/components/AddPerf/AddPerfExercise.vue'
import PerformanceList from 'src/components/AddPerf/PerformanceList.vue'
import PerformancesGraph from 'src/components/Performances/Graph/PerformancesGraph.vue'
import { errorNotify } from 'src/helpers/notifyHelper'
import { getExercise, getNextExercise, getPreviousExercise } from 'src/services/exerciseService'
import { getWorkout } from 'src/services/workoutService'

export default {
  name: 'PerformancesPage',
  components: {
    AddPerfExercise,
    PerformanceList,
    PerformancesGraph
  },
  data() {
    return {
      workout: null,
      exercise: null
    }
  },
  created() {
    this.loadWorkout()
    this.loadExercise()
  },
  watch: {
    $route() {
      this.loadExercise().then(() => {
        this.reloadPerformances()
      })
    }
  },
  computed: {
    nextExercise() {
      return getNextExercise(this.$route.params.workoutId, this.$route.params.exerciseId)
    },
    previousExercise() {
      return getPreviousExercise(this.$route.params.workoutId, this.$route.params.exerciseId)
    }
  },
  methods: {
    loadWorkout() {
      this.workout = getWorkout(this.$route.params.workoutId)
      if (!this.workout) {
        errorNotify("Impossible de charger l'entraînement")
        this.$router.push({ name: 'workouts' })
      }
    },
    loadExercise() {
      return new Promise((resolve) => {
        this.exercise = getExercise(this.$route.params.workoutId, this.$route.params.exerciseId)
        if (!this.exercise) {
          errorNotify("Impossible de charger l'exercice")
          this.$router.push({ name: 'exercises', params: { workoutId: this.$route.params.workoutId } })
        }
        resolve(this.exercise)
      })
    },
    reloadPerformances() {
      this.$refs.performanceList.loadPerformances()
      this.$refs.performanceGraph.loadPerformances()
    }
  }
}
</script>
