<template>
  <div class="flex column">
    <GymyHeader :text="(workout.isAbs ? 'Abs - ' : 'Exercices - ') + workout.label" />
    <div v-if="exercises && exercises.length > 0">
      <CardDraggable
        :list="exercises"
        @dragEnd="onDragEnd"
        @cardClick="(e) => onClickExercise(e)"
        v-model:drag="drag"
      >
        <template #content="{ element }">
          <ExerciseCard
            :forAbs="workout.isAbs"
            :exercise="element"
            draggable
            @edit="edit(element)"
            @showDeleteModal="showDeleteModal(element)"
            @copy="copy(element)"
          />
        </template>
      </CardDraggable>
    </div>
    <span
      v-else
      class="text-center"
      >Aucun exercice de disponible dans cet entraînement</span
    >
    <q-dialog v-model="editForm">
      <q-card class="q-px-md q-py-xs">
        <q-card-section>
          <div class="text-h6 text-center">Modifier l'exercice {{ exerciseToEdit.abs ? 'Abs' : exerciseToEdit.label }}</div>
        </q-card-section>
        <q-card-section>
          <ExerciseForm
            :initData="exerciseToEdit"
            buttonLabel="Confirmer"
            :loading="editLoading"
            @submit="onEditSubmit"
            :for-abs-workout="workout.isAbs"
          />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            label="Annuler"
            color="negative"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="addForm">
      <q-card class="q-px-md q-py-xs">
        <q-card-section>
          <div class="text-h6 text-center">Ajouter un exercice</div>
        </q-card-section>
        <q-card-section>
          <ExerciseForm
            buttonLabel="Ajouter"
            buttonIcon="add"
            :loading="addLoading"
            @submit="onAddSubmit"
            :for-abs-workout="workout.isAbs"
          />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            label="Annuler"
            color="negative"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
    >
      <q-btn
        fab
        icon="add"
        color="primary"
        @click="addForm = true"
      />
    </q-page-sticky>

    <q-dialog
      v-model="showCopyModal"
      @hide="onCopyModalClose"
    >
      <q-card class="q-pa-md min-h-xs-auto min-h-100 no-wrap column justify-between">
        <div>
          <div class="row gap-10 no-wrap justify-between items-center q-my-md">
            <q-linear-progress
              :value="copyModalProgress"
              class="q-mx-auto q-my-md"
            />
          </div>
          <q-card-section align="center">
            <div class="text-h6 text-center">Copier l'exercice "{{ exerciseToCopy.label }}"</div>
          </q-card-section>
          <q-card-section>
            <q-card-section v-if="workouts.length <= 0">Aucune séance non abs disponible</q-card-section>
            <q-card-section v-else>
              <q-item-label class="text-h6 text-center q-mb-lg"> Séances </q-item-label>
              <q-card
                v-for="item in workouts"
                :key="item.id"
                class="q-mb-md cursor-pointer"
                :class="{ 'bg-primary text-white': workoutCopyingDestination === item }"
                @click="workoutCopyingDestination === item ? (workoutCopyingDestination = null) : (workoutCopyingDestination = item)"
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
          <q-card-section
            align="center"
            class="q-pt-none q-mb-sm"
          >
            <q-btn
              color="primary"
              label="Confirmer"
              @click="onCopySubmit"
              :loading="copyLoading"
              :disable="!workoutCopyingDestination"
            />
          </q-card-section>
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
import { addExercise, copyExercise, deleteExercise, getExercises, moveExercise, updateExercise } from 'src/services/exerciseService'
import GymyHeader from 'src/components/GymyHeader.vue'
import { Dialog } from 'quasar'
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'
import ExerciseForm from 'src/components/Exercises/ExerciseForm.vue'
import CardDraggable from 'src/components/CardDraggable.vue'
import ExerciseCard from 'src/components/Exercises/ExerciseCard.vue'
import { getAbsWorkouts, getNoAbsWorkouts } from 'src/services/workoutService'

export default {
  name: 'ChoiceExercise',
  emits: ['selectExercise'],
  components: {
    GymyHeader,
    ExerciseForm,
    CardDraggable,
    ExerciseCard
  },
  props: {
    workout: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      exercises: [],
      addForm: false,
      addLoading: false,
      editForm: false,
      editLoading: false,
      exerciseToEdit: {},
      drag: false,
      exerciseToCopy: null,
      showCopyModal: false,
      workouts: [],
      workoutCopyingDestination: null,
      copyLoading: false
    }
  },
  created() {
    this.loadExercises()
    this.loadWorkouts()
  },
  computed: {
    copyModalProgress() {
      if (this.workoutCopyingDestination) {
        return 1
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
    onClickExercise(exercise) {
      if (!this.workout.isAbs && !exercise.abs) {
        this.$emit('selectExercise', exercise)
      } else if (!this.workout.isAbs && exercise.abs) {
        this.$router.push({ name: 'abs' })
      }
    },
    onDragEnd(e) {
      this.$q.loading.show({
        delay: 400, // ms
        message: 'Déplacement en cours...',
        boxClass: 'text-h5'
      })
      const newExercisesOrder = this.exercises.map((e) => e.id)
      moveExercise(this.workout.id, newExercisesOrder)
        .catch((err) => {
          errorNotify('Une erreur est survenue lors du déplacement de votre exercice')
        })
        .finally(() => {
          this.loadExercises()
          this.$q.loading.hide()
          this.drag = false
        })
    },
    loadExercises() {
      this.exercises = getExercises(this.workout.id)
    },
    onAddSubmit(payload) {
      this.addLoading = true
      this.$q.loading.show({
        delay: 0, // ms
        message: 'Ajout en cours...',
        boxClass: 'text-h5'
      })
      addExercise(this.workout.id, payload)
        .then(() => {
          this.loadExercises()
          successNotify('Votre exercice a bien été ajouté')
          this.addForm = false
          setTimeout(() => {
            this.$q.loading.hide()
          }, 1000)
        })
        .catch((err) => {
          errorNotify("Une erreur est survenue lors de l'ajout de votre exercice")
        })
        .finally(() => {
          this.addLoading = false
        })
    },
    onEditSubmit(payload) {
      this.editLoading = true
      updateExercise(this.workout.id, payload.id, payload)
        .then(() => {
          this.loadExercises()
          successNotify('Votre exercice a bien été modifié')
          this.editForm = false
          this.editLoading = false
        })
        .catch((err) => {
          this.editLoading = false
          errorNotify("Une erreur est survenue lors de l'édition de votre exercice")
        })
    },
    edit(exercise) {
      this.exerciseToEdit = exercise
      this.editForm = true
    },
    showDeleteModal(exercise) {
      let deleteLoading = false
      Dialog.create({
        title: "Suppression d'exercice",
        message: 'Êtes-vous sûr de vouloir supprimer votre exercice ' + (exercise.abs ? 'Abs' : exercise.label) + ' ?',
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
          deleteExercise(this.workout.id, exercise.id)
            .then(() => {
              this.loadExercises()
              successNotify('Votre exercice a bien été supprimé')
            })
            .catch((err) => {
              deleteLoading = false
              errorNotify('Une erreur est survenue lors de la suppression de votre exercice')
            })
        })
        .onCancel(() => {
          // console.log('Cancel')
        })
    },
    loadWorkouts() {
      this.workouts = this.workout.isAbs ? getAbsWorkouts() : getNoAbsWorkouts()
    },
    copy(exercise) {
      this.exerciseToCopy = exercise
      this.showCopyModal = true
    },
    onCopySubmit() {
      this.copyLoading = true
      copyExercise(this.workout.id, this.exerciseToCopy.id, this.workoutCopyingDestination.id)
        .then(() => {
          this.loadExercises()
          successNotify('Votre exercice a bien été copié')
          this.showCopyModal = false
        })
        .catch((err) => {
          errorNotify(translatting().translateError(err, 'Une erreur est survenue lors de la copie de votre exercice'))
        })
        .finally(() => {
          this.copyLoading = false
        })
    },
    onCopyModalClose() {
      this.workoutCopyingDestination = null
    }
  }
}
</script>

<style scoped lang="scss"></style>
