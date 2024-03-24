<template>
  <div class="flex column">
    <GymyHeader text="Entrainements" />
    <div v-if="workouts && workouts.length > 0">
      <draggable :list="workouts" class="list-group" ghost-class="ghost" itemKey="id" handle=".draggable-btn" @end="onDragEnd" @start="drag=true">
        <template #item="{ element }">
          <q-card @click="$emit('selectWorkout', element)" class="cursor-pointer q-mb-md flex-center column q-px-md" >
            <q-card-section class="gt-xs">
              <div class="text-h6 text-center">
                {{ element.label }}
              </div>
            </q-card-section>
            <q-card-section class="q-pb-none lt-sm">
              <div class="text-h6 text-center">
                {{ element.label }}
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
    <span v-else class="text-center">Aucun entrainement de disponible</span>
    <q-dialog v-model="editForm">
      <q-card class="q-px-xs q-py-xs">
        <q-card-section>
          <div class="text-h6 text-center">Modifier l'entrainement {{ workoutToEdit.label }}</div>
        </q-card-section>
        <q-card-section>
          <WorkoutForm :initData="workoutToEdit" buttonLabel="Confirmer" :loading="editLoading" @submit="onEditSubmit" />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn label="Annuler" color="negative" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="addForm">
      <q-card class="q-px-xs q-py-xs">
        <q-card-section>
          <div class="text-h6 text-center">Ajouter un entrainement</div>
        </q-card-section>
        <q-card-section>
          <WorkoutForm buttonLabel="Ajouter" buttonIcon="add" :loading="addLoading" @submit="onAddSubmit" />
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
import { addWorkout, deleteWorkout, getWorkouts, updateWorkout, moveWorkout } from 'src/services/workoutService'
import GymyHeader from 'src/components/GymyHeader.vue'
import { Dialog } from 'quasar'
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'
import WorkoutForm from 'src/components/Manage/WorkoutForm.vue'
import draggable from 'vuedraggable'

export default {
  name: 'ChoiceWorkout',
  emits: ['selectWorkout'],
  components: {
    GymyHeader,
    WorkoutForm,
    draggable
  },
  data() {
    return {
      drag: false,
      workouts: {},
      addForm: false,
      addLoading: false,
      editForm: false,
      editLoading: false,
      workoutToEdit: {}
    }
  },
  created() {
    this.loadWorkouts()
  },
  methods: {
    onDragEnd(e) {
      this.drag = false
      const newPosition = e.newIndex + 1
      moveWorkout(e.item['_underlying_vm_'].id, newPosition)
      .catch((err) => {
        console.log(err)
        errorNotify('Une erreur est survenue lors du déplacement de votre entrainement')
        this.loadWorkouts()
      })
    },
    loadWorkouts() {
      this.workouts = getWorkouts()
    },
    onAddSubmit(payload) {
      this.addLoading = true
      addWorkout(payload)
        .then(() => {
          this.loadWorkouts()
          successNotify('Votre entrainement a bien été ajouté')
          this.addForm = false
          this.addLoading = false
        })
        .catch((err) => {
          this.addLoading = false
          errorNotify('Une erreur est survenue lors de l\'ajout de votre entrainement')
        })
    },
    onEditSubmit(payload) {
      this.editLoading = true
      updateWorkout(payload.id, { label: payload.label })
        .then(() => {
          this.loadWorkouts()
          successNotify('Votre entrainement a bien été modifié')
          this.editForm = false
          this.editLoading = false
        })
        .catch((err) => {
          this.editLoading = false
          errorNotify('Une erreur est survenue lors de l\'édition de votre entrainement')
        })
    },
    edit(workout) {
      this.workoutToEdit = workout
      this.editForm = true
    },
    showDeleteModal(workout) {
      let deleteLoading = false
      Dialog.create({
        title: 'Suppression d\'entrainement',
        message: 'Êtes-vous sûr de vouloir supprimer votre entrainement ' + workout.label + ' ?',
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
          deleteWorkout(workout.id)
            .then(() => {
              this.loadWorkouts()
              successNotify('Votre entrainement a bien été supprimé')
            })
            .catch((err) => {
              deleteLoading = false
              errorNotify('Une erreur est survenue lors de la suppression de votre entrainement')
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
