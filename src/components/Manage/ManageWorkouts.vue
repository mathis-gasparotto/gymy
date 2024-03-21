<template>
  <div class="flex column">
    <GymyHeader text="Entrainements" />
    <div v-if="workouts && workouts.length > 0">
      <q-card v-for="workout in workouts" :key="workout.id" @click="$emit('selectWorkout', workout)" class="cursor-pointer q-mb-md flex-center column q-px-md">
        <q-card-section class="sm">
          <div class="text-h6">
            {{ workout.label }}
          </div>
        </q-card-section>
        <q-card-section class="q-pb-none lt-sm">
          <div class="text-h6">
            {{ workout.label }}
          </div>
        </q-card-section>
        <q-card-actions horizontal class="absolute-right sm q-d no-wrap">
          <q-btn flat round color="primary" icon="edit" @click.stop="edit(workout)" />
          <q-btn flat round color="negative" icon="delete" @click.stop="showDeleteModal(workout)" />
        </q-card-actions>
        <q-card-actions horizontal class="lt-sm no-wrap q-pa-none">
          <q-btn flat round color="primary" icon="edit" @click.stop="edit(workout)" />
          <q-btn flat round color="negative" icon="delete" @click.stop="showDeleteModal(workout)" />
        </q-card-actions>
      </q-card>
    </div>
    <span v-else class="text-center">Aucun entrainement de disponible</span>
    <q-dialog v-model="editForm">
      <q-card class="q-px-xl q-py-xl">
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
      <q-card class="q-px-xl q-py-xl">
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
import { addWorkout, deleteWorkout, getWorkouts, updateWorkout } from 'src/services/workoutService'
import GymyHeader from 'src/components/GymyHeader.vue'
import { Dialog } from 'quasar'
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'
import WorkoutForm from 'src/components/Manage/WorkoutForm.vue'

export default {
  name: 'ManageWorkouts',
  emits: ['selectWorkout'],
  components: {
    GymyHeader,
    WorkoutForm
  },
  data() {
    return {
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
    async loadWorkouts() {
      this.workouts = await getWorkouts()
    },
    onAddSubmit(payload) {
      this.addLoading = true
      addWorkout(payload)
        .then(async () => {
          await this.loadWorkouts()
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
        .then(async () => {
          await this.loadWorkouts()
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
          unelevated: true,
          loading: deleteLoading
        },
        cancel: {
          label: 'Annuler',
          color: 'primary',
          unelevated: true
        }
      })
        .onOk(() => {
          deleteLoading = true
          deleteWorkout(workout.id)
            .then(async () => {
              await this.loadWorkouts()
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
</style>
