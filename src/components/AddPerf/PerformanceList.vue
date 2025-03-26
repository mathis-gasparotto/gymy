<template>
  <div class="column flex-center">
    <div class="flex flex-center performance-list">
      <PerformanceCard
        v-for="performance in performancesToShow"
        :key="performance.id"
        :performance="performance"
        @click="$emit('selectWorkout', performance)"
        @edit="edit(performance)"
        @copy="copy(performance)"
        @delete="showDeleteModal(performance)"
      />
    </div>

    <q-btn
      v-if="performances.length > 3"
      color="primary"
      :label="showMore ? 'Voir moins' : 'Voir plus'"
      @click="showMore = !showMore"
      class="q-mt-xl"
    />

    <q-dialog v-model="editForm">
      <q-card class="q-py-md no-wrap column gap-30">
        <q-card-section align="center">
          <q-card-section align="center">
            <div class="text-h6 text-center">Modifier la performance du {{ formatting().dateToDisplay(performanceToEdit.date) }}</div>
          </q-card-section>
          <PerformanceForm
            ref="editPerfForm"
            :init-data="performanceToEdit"
            :exercise="exercise"
            @submit="onEditSubmit"
            :loading="editLoading"
            submit-text="Confirmer"
            close-btn
            close-btn-text="Annuler"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="showCopyModal"
      @hide="onCopyModalClose"
    >
      <q-card class="q-pa-md min-h-xs-auto min-h-100 no-wrap column justify-between">
        <div>
          <div class="row gap-10 no-wrap justify-between items-center q-my-md">
            <q-btn
              color="primary"
              v-if="copyModalProgress > 0"
              class="w-content"
              icon="arrow_back"
              no-wrap
              round
              flat
              padding="sm"
              @click="backCopyProcess"
            />
            <q-linear-progress
              :value="copyModalProgress"
              class="q-mx-auto q-my-md"
            />
          </div>
          <q-card-section align="center">
            <div class="text-h6 text-center">Copier la performance du {{ formatting().dateToDisplay(performanceToCopy.date) }}</div>
          </q-card-section>
          <q-card-section v-if="!workoutCopyingDestination">
            <q-card-section v-if="workouts.length <= 0">Aucune séance non abs disponible</q-card-section>
            <q-card-section v-else>
              <q-item-label class="text-h6 text-center q-mb-lg"> Séances </q-item-label>
              <q-card
                v-for="item in workouts"
                :key="item.id"
                class="q-mb-md cursor-pointer"
                @click="workoutCopyingDestination = item"
              >
                <q-card-section>
                  <q-item-label class="text-center text-weight-bold">{{ item.label }}</q-item-label>
                  <q-item-label
                    v-if="item.id == workout.id"
                    class="text-center text-caption"
                    >(Actuel)</q-item-label
                  >
                </q-card-section>
              </q-card>
            </q-card-section>
          </q-card-section>
          <q-card-section v-else-if="!exerciseCopyingDestination">
            <q-card-section v-if="exercisesListForCopy.length <= 0">Aucun exercise non abs disponible</q-card-section>
            <q-card-section v-else>
              <q-item-label class="text-h6 text-center q-mb-lg"> Exercices - {{ workoutCopyingDestination.label }} </q-item-label>
              <q-card
                v-for="item in exercisesListForCopy"
                :key="item.id"
                class="q-mb-md cursor-pointer"
                @click="exerciseCopyingDestination = item"
              >
                <q-card-section>
                  <q-item-label class="text-center text-weight-bold">{{ item.label }}</q-item-label>
                </q-card-section>
              </q-card>
            </q-card-section>
          </q-card-section>
          <template v-else>
            <PerformanceForm
              ref="addPerfForm"
              :init-data="performanceToCopy"
              :exercise="exercise"
              @submit="onCopySubmit"
              :loading="copyLoading"
              submit-text="Copier"
              close-btn
              close-btn-text="Annuler"
            />
          </template>
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { PERFORMANCE_TYPES, PERFORMANCE_TYPE_DEFAULT, PERFORMANCE_TYPE_BAR, PERFORMANCE_TYPE_ARM } from 'src/helpers/performanceHelper'
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'
import { addPerformance, deletePerformance, deletePerformanceWithRelated, getPerformances, getRelatedExercise, getRelatedPerformance, updatePerformanceWithRelated } from 'src/services/performanceService'
import formatting from 'src/helpers/formatting'
import { Dialog } from 'quasar'
import translatting from 'src/helpers/translatting'
import PerformanceCard from 'src/components/Performances/PerformanceCard.vue'
import PerformanceForm from 'src/components/AddPerf/PerformanceForm.vue'
import { getNoAbsWorkouts } from 'src/services/workoutService'

export default {
  name: 'PerformanceList',
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
  components: {
    PerformanceCard,
    PerformanceForm
  },
  setup() {
    return {
      PERFORMANCE_TYPES,
      formatting
    }
  },
  data() {
    return {
      performances: [],
      types: [
        {
          value: PERFORMANCE_TYPE_DEFAULT,
          label: 'Défaut'
        },
        {
          value: PERFORMANCE_TYPE_BAR,
          label: 'Barre'
        },
        {
          value: PERFORMANCE_TYPE_ARM,
          label: 'Bras'
        }
      ],
      editForm: false,
      editLoading: false,
      performanceToEdit: null,
      showMore: false,
      performanceToCopy: null,
      showCopyModal: false,
      workouts: [],
      workoutCopyingDestination: null,
      exerciseCopyingDestination: null,
      copyLoading: false
    }
  },
  watch: {
    $route() {
      this.showMore = false
    }
  },
  created() {
    this.loadPerformances()
    this.loadWorkouts()
  },
  computed: {
    editInputsValid() {
      const allDefault = this.performanceToEdit.series.filter((serie) => serie.value !== null && serie.value !== '').every((serie) => serie.type === PERFORMANCE_TYPE_DEFAULT)
      const allNoDefault = this.performanceToEdit.series.filter((serie) => serie.value !== null && serie.value !== '').every((serie) => serie.type !== PERFORMANCE_TYPE_DEFAULT)
      return this.performanceToEdit.series && this.performanceToEdit.series.filter((serie) => serie.value !== null && serie.value !== '' && serie.value >= 0).length >= 1 && this.performanceToEdit.date && ((allDefault && !allNoDefault) || (allNoDefault && !allDefault))
    },
    copyInputsValid() {
      const allDefault = this.performanceToCopy.series.filter((serie) => serie.value !== null && serie.value !== '').every((serie) => serie.type === PERFORMANCE_TYPE_DEFAULT)
      const allNoDefault = this.performanceToCopy.series.filter((serie) => serie.value !== null && serie.value !== '').every((serie) => serie.type !== PERFORMANCE_TYPE_DEFAULT)
      return this.performanceToCopy.series && this.performanceToCopy.series.filter((serie) => serie.value !== null && serie.value !== '' && serie.value >= 0).length >= 1 && this.performanceToCopy.date && ((allDefault && !allNoDefault) || (allNoDefault && !allDefault))
    },
    performancesToShow() {
      return this.performances.slice(0, this.showMore ? this.performances.length : 3)
    },
    copyModalProgress() {
      if (this.workoutCopyingDestination && this.exerciseCopyingDestination) {
        return 1
      } else if (this.workoutCopyingDestination) {
        return 0.5
      } else {
        return 0
      }
    },
    exercisesListForCopy() {
      return this.workoutCopyingDestination && this.workoutCopyingDestination.exercises
        ? Object.keys(this.workoutCopyingDestination.exercises)
            .map((key) => {
              return {
                ...this.workoutCopyingDestination.exercises[key],
                id: key
              }
            })
            .filter((exercise) => !exercise.abs)
            .sort((a, b) => a.position - b.position)
        : []
    },
    defaultSeriesType() {
      return this.exercise.defaultSeriesType || PERFORMANCE_TYPE_DEFAULT
    }
  },
  methods: {
    onEditSubmit(payload) {
      this.editLoading = true
      updatePerformanceWithRelated(this.workout.id, this.exercise.id, this.performanceToEdit.id, payload)
        .then(() => {
          this.$emit('reloadPerformances')
          successNotify('Votre performance a bien été modifiée')
          this.editForm = false
        })
        .catch((err) => {
          errorNotify(translatting().translateError(err, "Une erreur est survenue lors de l'édition de votre performance"))
        })
        .finally(() => {
          this.editLoading = false
        })
    },
    addSerieForEdit() {
      this.performanceToEdit.series.push({
        id: new Date().getTime(),
        value: null,
        type: this.defaultSeriesType
      })
    },
    addSerieForCopy() {
      this.performanceToCopy.series.push({
        id: new Date().getTime(),
        value: null,
        type: this.defaultSeriesType
      })
    },
    removeSerieForEdit(id) {
      if (this.performanceToEdit.series.length > 1) {
        this.performanceToEdit.series = this.performanceToEdit.series.filter((serie) => serie.id !== id)
      }
    },
    removeSerieForCopy(id) {
      if (this.performanceToCopy.series.length > 1) {
        this.performanceToCopy.series = this.performanceToCopy.series.filter((serie) => serie.id !== id)
      }
    },
    edit(performance) {
      this.performanceToEdit = {
        comment: null,
        ...performance,
        series: performance.series.map((serie, index) => ({ ...serie, id: index }))
      }
      this.editForm = true
    },
    loadPerformances() {
      this.performances = getPerformances(this.workout.id, this.exercise.id)
    },
    loadWorkouts() {
      this.workouts = getNoAbsWorkouts()
    },
    showDeleteModal(performance) {
      let deleteLoading = false
      const config = {
        title: 'Suppression de la performance',
        message: 'Êtes-vous sûr de vouloir supprimer votre performance du ' + formatting().dateToDisplay(performance.date) + ' ?',
        // persistent: true,
        ok: {
          label: 'Supprimer',
          color: 'negative',
          loading: deleteLoading
        },
        cancel: {
          label: 'Annuler',
          color: 'primary'
        }
      }

      const relatedPerformance = getRelatedPerformance(this.workout.id, this.exercise.id, performance.id)
      if (relatedPerformance) {
        const relatedExercise = getRelatedExercise(this.workout.id, this.exercise.id)
        config.options = {
          type: 'checkbox',
          model: [],
          items: [{ label: 'Supprimer la performance liée de l\'exercice "' + relatedExercise.label + '"', value: 'deleteRelated', color: 'negative' }]
        }
      }

      Dialog.create(config)
        .onOk((data = []) => {
          deleteLoading = true
          const deleteFunction = data.includes('deleteRelated') ? deletePerformanceWithRelated : deletePerformance

          deleteFunction(this.workout.id, this.exercise.id, performance.id)
            .then(() => {
              this.$emit('reloadPerformances')
              successNotify('Votre performance a bien été supprimée')
            })
            .catch((err) => {
              errorNotify(translatting().translateError(err, 'Une erreur est survenue lors de la suppression de votre performance'))
            })
            .finally(() => {
              deleteLoading = false
            })
        })
        .onCancel(() => {
          // console.log('Cancel')
        })
    },
    copy(performance) {
      this.performanceToCopy = {
        comment: null,
        ...performance,
        series: performance.series.map((serie, index) => ({ ...serie, id: index }))
      }
      this.showCopyModal = true
    },
    onCopySubmit(payload) {
      this.copyLoading = true
      addPerformance(this.workoutCopyingDestination.id, this.exerciseCopyingDestination.id, payload)
        .then(() => {
          this.$emit('reloadPerformances')
          successNotify('Votre performance a bien été copiée')
          this.showCopyModal = false
        })
        .catch((err) => {
          errorNotify(translatting().translateError(err, 'Une erreur est survenue lors de la copie de votre performance'))
        })
        .finally(() => {
          this.copyLoading = false
        })
    },
    onCopyModalClose() {
      this.workoutCopyingDestination = null
      this.exerciseCopyingDestination = null
    },
    backCopyProcess() {
      if (this.exerciseCopyingDestination) {
        this.exerciseCopyingDestination = null
      } else {
        this.workoutCopyingDestination = null
      }
    }
  }
}
</script>

<style scoped lang="scss">
.performance-list {
  gap: 10px;
}
</style>
