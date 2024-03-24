<template>
  <div class="flex column">
    <GymyHeader :text="'Exercises - ' + workout.label" />
    <div v-if="exercises && exercises.length > 0">
      <draggable :list="exercises" class="list-group" ghost-class="ghost" itemKey="id" handle=".draggable-btn" @end="onDragEnd" @start="drag=true">
        <template #item="{ element }">
          <q-card @click="$emit('selectExercise', element)"
            class="q-mb-md flex-center column q-px-md cursor-pointer">
            <q-card-section class="gt-xs">
              <div class="text-h6 text-center">
                {{ element.label }}
              </div>
              <div v-if="element.config" class="text-center">
                ({{ element.config }})
              </div>
            </q-card-section>
            <q-card-section class="q-pb-none lt-sm">
              <div class="text-h6 text-center">
                {{ element.label }}
              </div>
              <div v-if="element.config" class="text-center">
                ({{ element.config }})
              </div>
            </q-card-section>
            <q-card-actions horizontal class="absolute-right gt-xs no-wrap">
              <q-btn flat round color="primary" icon="edit" @click.stop="edit(element)" />
              <q-btn flat round color="negative" icon="delete" @click.stop="showDeleteModal(element)" />
            </q-card-actions>
            <q-card-actions horizontal class="lt-sm no-wrap q-pa-none">
              <q-btn flat round color="primary" icon="edit" @click.stop="edit(element)" />
              <q-btn flat round color="negative" icon="delete" @click.stop="showDeleteModal(element)" />
            </q-card-actions>
            <div class="draggable-btn-container">
              <q-icon :class="'draggable-btn ' + (drag ? 'cursor-grabbing' : 'cursor-grab')" size="sm" name="menu"></q-icon>
            </div>
          </q-card>
        </template>
      </draggable>
    </div>
    <span v-else class="text-center">Aucun exercise de disponible dans cet entrainement</span>
    <q-dialog v-model="editForm">
      <q-card class="q-px-xs q-py-xs">
        <q-card-section>
          <div class="text-h6 text-center">Modifier l'exercise {{ exerciseToEdit.label }}</div>
        </q-card-section>
        <q-card-section>
          <ExerciseForm :initData="exerciseToEdit" buttonLabel="Confirmer" :loading="editLoading"
            @submit="onEditSubmit" />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn label="Annuler" color="negative" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="addForm">
      <q-card class="q-px-xs q-py-xs">
        <q-card-section>
          <div class="text-h6 text-center">Ajouter un exercise</div>
        </q-card-section>
        <q-card-section>
          <ExerciseForm buttonLabel="Ajouter" buttonIcon="add" :loading="addLoading" @submit="onAddSubmit" />
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

export default {
  name: 'ChoiceExercise',
  emits: ['selectExercise'],
  components: {
    GymyHeader,
    ExerciseForm,
    draggable
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
          console.log(err)
          errorNotify('Une erreur est survenue lors du déplacement de votre exercise')
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
          successNotify('Votre exercise a bien été ajouté')
          this.addForm = false
          this.addLoading = false
        })
        .catch((err) => {
          this.addLoading = false
          errorNotify('Une erreur est survenue lors de l\'ajout de votre exercise')
        })
    },
    onEditSubmit(payload) {
      this.editLoading = true
      updateExercise(this.workout.id, payload.id, { label: payload.label, config: payload.config || null})
        .then(() => {
          this.loadExercises()
          successNotify('Votre exercise a bien été modifié')
          this.editForm = false
          this.editLoading = false
        })
        .catch((err) => {
          this.editLoading = false
          errorNotify('Une erreur est survenue lors de l\'édition de votre exercise')
        })
    },
    edit(exercise) {
      this.exerciseToEdit = exercise
      this.editForm = true
    },
    showDeleteModal(exercise) {
      let deleteLoading = false
      Dialog.create({
        title: 'Suppression d\'exercise',
        message: 'Êtes-vous sûr de vouloir supprimer votre exercise ' + exercise.label + ' ?',
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
              successNotify('Votre exercise a bien été supprimé')
            })
            .catch((err) => {
              deleteLoading = false
              errorNotify('Une erreur est survenue lors de la suppression de votre exercise')
            })
        })
        .onCancel(() => {
          // console.log('Cancel')
        })
    }
  }
}
</script>

<style scoped lang="scss">
.draggable-btn {
  &-container {
    position: absolute;
    left: 10px;
    height: 100%;
    display: flex;
    align-items: center;
  }
}
</style>
