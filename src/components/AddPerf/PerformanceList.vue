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
      <q-card class="q-pa-md min-h-xs-auto min-h-100 no-wrap column justify-between">
        <div>
          <q-card-section align="center">
            <div class="text-h6 text-center">Modifier la performance du {{ formatting().dateToDisplay(performanceToEdit.date) }}</div>
          </q-card-section>
          <q-card-section
            align="center"
            v-for="serie in performanceToEdit.series"
            :key="serie.id"
            class="flex flex-center q-py-sm no-wrap"
          >
            <q-input
              :name="'value-' + serie.id"
              outlined
              class="exercise-input w-40"
              type="number"
              inputmode="decimal"
              v-model="serie.value"
              min="0"
              :rules="[(val) => !val || val >= 0 || 'Veuillez renseigner une valeur positive']"
              label="Performance"
              lazy-rules
              hide-bottom-space
            >
            </q-input>
            <q-select
              outlined
              :name="'type-' + serie.id"
              v-model="serie.type"
              :options="types"
              label="Type de performance"
              class="w-40"
              lazy-rules
              :rules="[(val) => typeof val === 'object' || 'Veuillez renseigner un type de performance']"
              hide-bottom-space
            >
            </q-select>
            <q-btn
              color="negative"
              icon="delete"
              class="btn-delete q-ml-md"
              round
              @click="removeSerieForEdit(serie.id)"
            />
          </q-card-section>
          <q-card-section
            align="center"
            class="q-pt-none q-mb-sm"
          >
            <q-btn
              color="primary"
              icon="add"
              label="Ajouter une série"
              @click="addSerieForEdit"
            />
          </q-card-section>
          <q-card-section
            align="center"
            class="q-pt-none q-mb-sm"
          >
            <q-input
              rounded
              outlined
              name="date"
              v-model="performanceToEdit.date"
              type="date"
              mask="date"
              class="q-mb-sm"
              lazy-rules
              label="Date de la performance"
              hide-bottom-space
            >
            </q-input>
            <q-input
              rounded
              outlined
              name="comment"
              v-model="performanceToEdit.comment"
              type="text"
              lazy-rules
              label="Commentaire (optionnel)"
              hide-bottom-space
            >
            </q-input>
          </q-card-section>
        </div>
        <div>
          <q-card-section
            align="center"
            class="q-pt-none q-mb-sm"
          >
            <q-btn
              color="primary"
              label="Confirmer"
              @click="onEditSubmit"
              :loading="editLoading"
              :disable="!editInputsValid"
            />
          </q-card-section>
          <q-card-actions align="center">
            <q-btn
              label="Annuler"
              color="negative"
              v-close-popup
            />
          </q-card-actions>
        </div>
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
                v-for="workout in workouts"
                :key="workout.id"
                class="q-mb-md"
                @click="workoutCopyingDestination = workout"
              >
                <q-card-section>
                  <q-item-label class="text-center text-weight-bold">{{ workout.label }}</q-item-label>
                </q-card-section>
              </q-card>
            </q-card-section>
          </q-card-section>
          <q-card-section v-else-if="!exerciseCopyingDestination">
            <q-card-section v-if="exercisesListForCopy.length <= 0">Aucun exercise non abs disponible</q-card-section>
            <q-card-section v-else>
              <q-item-label class="text-h6 text-center q-mb-lg"> Exercices </q-item-label>
              <q-card
                v-for="exercise in exercisesListForCopy"
                :key="exercise.id"
                class="q-mb-md"
                @click="exerciseCopyingDestination = exercise"
              >
                <q-card-section>
                  <q-item-label class="text-center text-weight-bold">{{ exercise.label }}</q-item-label>
                </q-card-section>
              </q-card>
            </q-card-section>
          </q-card-section>
          <template v-else>
            <q-card-section
              align="center"
              v-for="serie in performanceToCopy.series"
              :key="serie.id"
              class="flex flex-center q-py-sm no-wrap"
            >
              <q-input
                :name="'value-' + serie.id"
                outlined
                class="exercise-input w-40"
                type="number"
                inputmode="decimal"
                v-model="serie.value"
                min="0"
                :rules="[(val) => !val || val >= 0 || 'Veuillez renseigner une valeur positive']"
                label="Performance"
                lazy-rules
                hide-bottom-space
              >
              </q-input>
              <q-select
                outlined
                :name="'type-' + serie.id"
                v-model="serie.type"
                :options="types"
                label="Type de performance"
                class="w-40"
                lazy-rules
                :rules="[(val) => typeof val === 'object' || 'Veuillez renseigner un type de performance']"
                hide-bottom-space
              >
              </q-select>
              <q-btn
                color="negative"
                icon="delete"
                class="btn-delete q-ml-md"
                round
                @click="removeSerieForCopy(serie.id)"
              />
            </q-card-section>
            <q-card-section
              align="center"
              class="q-pt-none q-mb-sm"
            >
              <q-btn
                color="primary"
                icon="add"
                label="Ajouter une série"
                @click="addSerieForCopy"
              />
            </q-card-section>
            <q-card-section
              align="center"
              class="q-pt-none q-mb-sm"
            >
              <q-input
                rounded
                outlined
                name="date"
                v-model="performanceToCopy.date"
                type="date"
                mask="date"
                class="q-mb-sm"
                lazy-rules
                label="Date de la performance"
                hide-bottom-space
              >
              </q-input>
              <q-input
                rounded
                outlined
                name="comment"
                v-model="performanceToCopy.comment"
                type="text"
                lazy-rules
                label="Commentaire (optionnel)"
                hide-bottom-space
              >
              </q-input>
            </q-card-section>
            <q-card-section
              align="center"
              class="q-pt-none q-mb-sm"
            >
              <q-btn
                color="primary"
                label="Confirmer"
                @click="onCopySubmit"
                :loading="editLoading"
                :disable="!copyInputsValid"
              />
            </q-card-section>
          </template>
        </div>
        <q-card-actions align="center">
          <q-btn
            label="Annuler"
            color="negative"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { PERFORMANCE_TYPE_DEFAULT, PERFORMANCE_TYPE_BAR, PERFORMANCE_TYPE_ARM } from 'src/helpers/performanceHelper'
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'
import { addPerformance, deletePerformance, getPerformances, updatePerformance } from 'src/services/performanceService'
import formatting from 'src/helpers/formatting'
import { Dialog } from 'quasar'
import translatting from 'src/helpers/translatting'
import PerformanceCard from 'src/components/Performances/PerformanceCard.vue'
import { getNoAbsWorkouts, getWorkouts } from 'src/services/workoutService'

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
    PerformanceCard
  },
  setup() {
    return {
      PERFORMANCE_TYPE_DEFAULT,
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
      exerciseCopyingDestination: null
    }
  },
  created() {
    this.loadPerformances()
    this.loadWorkouts()
  },
  computed: {
    editInputsValid() {
      const allDefault = this.performanceToEdit.series.filter((serie) => serie.value !== null && serie.value !== '').every((serie) => serie.type.value === PERFORMANCE_TYPE_DEFAULT)
      const allNoDefault = this.performanceToEdit.series.filter((serie) => serie.value !== null && serie.value !== '').every((serie) => serie.type.value !== PERFORMANCE_TYPE_DEFAULT)
      return this.performanceToEdit.series && this.performanceToEdit.series.filter((serie) => serie.value !== null && serie.value !== '' && serie.value >= 0).length >= 1 && this.performanceToEdit.date && ((allDefault && !allNoDefault) || (allNoDefault && !allDefault))
    },
    copyInputsValid() {
      const allDefault = this.performanceToCopy.series.filter((serie) => serie.value !== null && serie.value !== '').every((serie) => serie.type.value === PERFORMANCE_TYPE_DEFAULT)
      const allNoDefault = this.performanceToCopy.series.filter((serie) => serie.value !== null && serie.value !== '').every((serie) => serie.type.value !== PERFORMANCE_TYPE_DEFAULT)
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
    }
  },
  methods: {
    onEditSubmit() {
      this.editLoading = true
      updatePerformance(this.workout.id, this.exercise.id, this.performanceToEdit.id, {
        series: this.performanceToEdit.series.map((serie) => ({
          ...serie,
          id: null,
          value: serie.value,
          type: serie.type.value
        })),
        date: this.performanceToEdit.date,
        comment: this.performanceToEdit.comment
      })
        .then(() => {
          this.$emit('reloadPerformances')
          successNotify('Votre performance a bien été modifiée')
          this.editForm = false
          this.editLoading = false
        })
        .catch((err) => {
          this.editLoading = false
          errorNotify(translatting().translateError(err, "Une erreur est survenue lors de l'édition de votre performance"))
        })
    },
    addSerieForEdit() {
      this.performanceToEdit.series.push({
        id: new Date().getTime(),
        value: null,
        type: this.types[0]
      })
    },
    addSerieForCopy() {
      this.performanceToCopy.series.push({
        id: new Date().getTime(),
        value: null,
        type: this.types[0]
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
        series: performance.series.map((serie, index) => ({ ...serie, id: index, type: this.types.find((type) => type.value === serie.type) }))
      }
      this.editForm = true
    },
    loadPerformances() {
      this.performances = getPerformances(this.workout.id, this.exercise.id)
    },
    loadWorkouts() {
      this.workouts = getNoAbsWorkouts().filter((workout) => workout.id !== this.workout.id)
    },
    showDeleteModal(performance) {
      let deleteLoading = false
      Dialog.create({
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
      })
        .onOk(() => {
          deleteLoading = true
          deletePerformance(this.workout.id, this.exercise.id, performance.id)
            .then(() => {
              this.$emit('reloadPerformances')
              successNotify('Votre performance a bien été supprimée')
            })
            .catch((err) => {
              deleteLoading = false
              errorNotify('Une erreur est survenue lors de la suppression de votre performance')
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
        series: performance.series.map((serie, index) => ({ ...serie, id: index, type: this.types.find((type) => type.value === serie.type) }))
      }
      this.showCopyModal = true
    },
    onCopySubmit() {
      addPerformance(this.workoutCopyingDestination.id, this.exerciseCopyingDestination.id, {
        series: this.performanceToCopy.series.map((serie) => ({
          ...serie,
          id: null,
          value: serie.value,
          type: serie.type.value
        })),
        date: this.performanceToCopy.date,
        comment: this.performanceToCopy.comment
      })
        .then(() => {
          this.$emit('reloadPerformances')
          successNotify('Votre performance a bien été copiée')
          this.showCopyModal = false
        })
        .catch((err) => {
          errorNotify(translatting().translateError(err, 'Une erreur est survenue lors de la copie de votre performance'))
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
