<template>
  <div class="flex column">
    <GymyHeader :text="(workout.isAbs ? 'Abs - ' : 'Exercices - ')+ workout.label" />
    <div v-if="exercises && exercises.length > 0">
      <draggable :list="exercises" class="list-group" ghost-class="ghost" itemKey="id" handle=".draggable-btn" @end="onDragEnd" @start="drag=true">
        <template #item="{ element }">
          <ExerciseCard :forAbs="workout.isAbs" :exercise="element" draggable :drag="drag" @edit="edit(element)" @showDeleteModal="showDeleteModal(element)" @click="() => { if (!workout.isAbs) $emit('selectExercise', element) }" />
        </template>
      </draggable>
    </div>
    <span v-else class="text-center">Aucun exercice de disponible dans cet entrainement</span>
    <q-dialog v-model="editForm">
      <q-card class="q-px-xs q-py-xs">
        <q-card-section>
          <div class="text-h6 text-center">Modifier l'exercice {{ exerciseToEdit.label }}</div>
        </q-card-section>
        <q-card-section>
          <ExerciseForm :initData="exerciseToEdit" buttonLabel="Confirmer" :loading="editLoading"
            @submit="onEditSubmit" :for-abs-workout="workout.isAbs" />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn label="Annuler" color="negative" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="addForm">
      <q-card class="q-px-xs q-py-xs">
        <q-card-section>
          <div class="text-h6 text-center">Ajouter un exercice</div>
        </q-card-section>
        <q-card-section>
          <ExerciseForm buttonLabel="Ajouter" buttonIcon="add" :loading="addLoading" @submit="onAddSubmit" :for-abs-workout="workout.isAbs" />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn label="Annuler" color="negative" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" @click="addForm = true" />
    </q-page-sticky>
  </div>
</template>

<script>
import { addExercise, deleteExercise, getExercises, moveExercise, updateExercise } from 'src/services/exerciseService'
import GymyHeader from 'src/components/GymyHeader.vue'
import { Dialog } from 'quasar'
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'
import ExerciseForm from 'src/components/Manage/ExerciseForm.vue'
import draggable from 'vuedraggable'
import ExerciseCard from 'src/components/Exercise/ExerciseCard.vue'

export default {
  name: 'ChoiceExercise',
  emits: ['selectExercise'],
  components: {
    GymyHeader,
    ExerciseForm,
    draggable,
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
      drag: false
    }
  },
  created() {
    this.loadExercises()
  },
  methods: {
    onDragEnd(e) {
      this.drag = false
      const newPosition = e.newIndex + 1
      moveExercise(this.workout.id, e.item['_underlying_vm_'].id, newPosition)
        .catch((err) => {
          errorNotify('Une erreur est survenue lors du déplacement de votre exercice')
          this.loadExercises()
        })
    },
    loadExercises() {
      this.exercises = getExercises(this.workout.id)
    },
    onAddSubmit(payload) {
      this.addLoading = true
      addExercise(this.workout.id, payload)
        .then(() => {
          this.loadExercises()
          successNotify('Votre exercice a bien été ajouté')
          this.addForm = false
          this.addLoading = false
        })
        .catch((err) => {
          this.addLoading = false
          errorNotify('Une erreur est survenue lors de l\'ajout de votre exercice')
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
          errorNotify('Une erreur est survenue lors de l\'édition de votre exercice')
        })
    },
    edit(exercise) {
      this.exerciseToEdit = exercise
      this.editForm = true
    },
    showDeleteModal(exercise) {
      let deleteLoading = false
      Dialog.create({
        title: 'Suppression d\'exercice',
        message: 'Êtes-vous sûr de vouloir supprimer votre exercice ' + exercice.label + ' ?',
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
    }
  }
}
</script>

<style scoped lang="scss"></style>
