<template>
  <div class="flex column">
    <GymyHeader text="Choix de l'entrainement" />
    <div v-if="workouts && workouts.length > 0">
      <q-card v-for="workout in workouts" :key="workout.id" @click="$emit('selectWorkout', workout)" class="clickable q-mb-md flex-center column q-px-md">
        <q-card-section>
          <div class="text-h6">
            {{ workout.label }}
          </div>
        </q-card-section>
        <q-card-actions horizontal class="absolute-right no-wrap">
          <q-btn flat round color="primary" icon="edit" @click.stop="edit" />
          <q-btn flat round color="negative" icon="delete" @click.stop="showDeleteModal(workout)" />
        </q-card-actions>
      </q-card>
    </div>
    <span v-else class="text-center">Aucun entrainement de disponible</span>
    <q-dialog v-model="addForm">
      <q-card class="q-px-xl q-py-xl">
        <q-card-section>
          <div class="text-h6 text-center">Ajouter un entrainement</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="onsubmit()" class="flex-center column">
            <q-input
              name="label"
              rounded
              outlined
              label="Nom de l'entrainement"
              autofocus
              class="q-mb-md"
              type="text"
              v-model="workoutToAdd.label"
              lazy-rules
              :rules="[
                (val) => val.trim().length > 2 || 'Veullez renseigner minimum 3 caractères'
              ]"
              hide-bottom-space
            ></q-input>
            <q-btn
              color="primary"
              label="Ajouter"
              icon="add"
              type="submit"
              :disable="!addFormValid"
            />
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" @click="showAddForm" />
    </q-page-sticky>
  </div>
</template>

<script>
import { addWorkout, deleteWorkout, getWorkouts } from 'src/services/workoutService'
import GymyHeader from 'src/components/GymyHeader.vue'
import { Dialog } from 'quasar'
import { errorNotify, successNotify } from 'src/services/notifyService'

export default {
  name: 'ManageWorkouts',
  emits: ['selectWorkout'],
  components: {
    GymyHeader
  },
  data() {
    return {
      workouts: {},
      addForm: false,
      addLoading: false,
      workoutToAdd: {
        label: ''
      }
    }
  },
  created() {
    this.loadWorkouts()
  },
  computed: {
    addFormValid() {
      return this.workoutToAdd.label.trim().length > 2
    }
  },
  methods: {
    async loadWorkouts() {
      this.workouts = await getWorkouts()
    },
    onsubmit() {
      if (!this.addFormValid) return
      this.addLoading = true
      addWorkout(this.workoutToAdd)
        .then(() => {
          successNotify('Votre entrainement a bien été ajouté')
          this.addForm = false
          this.loadWorkouts()
        })
        .catch((err) => {
          this.addLoading = false
          errorNotify('Une erreur est survenue lors de l\'ajout de votre entrainement')
        })
    },
    edit() {
      console.log('edit')
    },
    showAddForm() {
      this.addForm = true
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
            .then(() => {
              successNotify('Votre entrainement a bien été supprimé')
              this.loadWorkouts()
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
</style>src/services/notifyService
