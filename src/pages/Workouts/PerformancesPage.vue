<template>
  <div class="flex justify-between justify-xs-center gap-20">
    <div class="column items-start q-mb-lg w-content h-content gap-15">
      <q-btn
        v-if="previousExercise"
        color="negative"
        label="Précédent"
        class="w-content h-content"
        icon="arrow_back"
        :to="{ name: 'performances', params: { workoutId: $route.params.workoutId, exerciseId: previousExercise.id } }"
      />
      <q-btn
        v-if="previousExercise && previousExercise.abs"
        color="negative"
        label="Abs"
        class="w-content h-content"
        icon="open_in_new"
        :to="{ name: 'abs' }"
      />
    </div>
    <div class="column items-end q-mb-lg w-content h-content gap-15">
      <q-btn
        v-if="nextExercise"
        color="secondary"
        label="Suivant"
        class="w-content h-content"
        icon-right="arrow_forward"
        :to="{ name: 'performances', params: { workoutId: $route.params.workoutId, exerciseId: nextExercise.id } }"
      />
      <q-btn
        v-if="nextExercise && nextExercise.abs"
        color="secondary"
        label="Abs"
        class="w-content h-content"
        icon-right="open_in_new"
        :to="{ name: 'abs' }"
      />
    </div>
  </div>
  <AddPerfExercise
    class="q-mb-lg"
    :workout="workout"
    :exercise="exercise"
    @reloadPerformances="reloadPerformances"
  />
  <div v-if="exercise.abs" class="flex flex-center q-mb-lg">
    <q-btn
      color="primary"
      label="Abs"
      class="w-content h-content"
      icon-right="open_in_new"
      :to="{ name: 'abs' }"
    />
  </div>
  <PerformanceList
    :workout="workout"
    :exercise="exercise"
    @reloadPerformances="reloadPerformances"
    ref="performanceList"
    v-if="!exercise.abs"
  />
  <PerformancesGraph
    :workoutId="workout.id"
    :exerciseId="exercise.id"
    ref="performanceGraph"
    :reversed="exercise.isReverse ?? false"
    v-if="!exercise.abs"
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
      this.$refs.performanceList?.loadPerformances()
      this.$refs.performanceGraph?.loadPerformances()
    }
  }
}
</script>
