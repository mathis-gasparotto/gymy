<template>
  <div class="flex column">
    <GymyHeader text="Entraînements" />
    <div v-if="workouts && workouts.length > 0">
      <draggable
        :list="workouts"
        class="list-group"
        ghost-class="ghost"
        itemKey="id"
        handle=".draggable-btn"
        @end="onDragEnd"
        @start="drag = true"
      >
        <template #item="{ element }">
          <WorkoutCard
            :workout="element"
            draggable
            :drag="drag"
            @share="share(element)"
            @edit="edit(element)"
            @showDeleteModal="showDeleteModal(element)"
            @click="$emit('selectWorkout', element)"
          />
        </template>
      </draggable>
    </div>
    <span
      v-else
      class="text-center"
      >Aucun entraînement de disponible</span
    >
    <q-dialog
      v-model="shareForm"
      @hide="workoutToShare = {}"
    >
      <q-card class="q-px-xs q-py-xs">
        <q-card-section>
          <div class="text-h6 text-center">Partager l'entraînement {{ workoutToShare.label }}</div>
        </q-card-section>
        <q-card-section
          class="column flex-center"
          v-if="isAuthenticated"
        >
          <q-btn
            v-if="!workoutToShare.shareId"
            label="Générer un lien de partage"
            color="primary"
            @click="generateShareId(workoutToShare)"
            :loading="generatingShareLoading"
          />
          <template v-else>
            <q-btn
              label="Partager"
              color="primary"
              class="q-mb-lg"
              @click="shareBtn(workoutToShare)"
            />
            <q-btn
              label="Désactiver le paratage"
              color="negative"
              @click="cancelShare(workoutToShare)"
              :loading="cancelShareLoading"
            />
          </template>
        </q-card-section>
        <q-card-section
          class="text-center text-negative text-bold"
          v-else
        >
          Vous devez être connecté pour pouvoir partager votre entrainement
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            label="Fermer"
            color="negative"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog
      v-model="editForm"
      @hide="workoutToEdit = {}"
    >
      <q-card class="q-px-xs q-py-xs">
        <q-card-section>
          <div class="text-h6 text-center">Modifier l'entraînement {{ workoutToEdit.label }}</div>
        </q-card-section>
        <q-card-section>
          <WorkoutForm
            :initData="workoutToEdit"
            buttonLabel="Confirmer"
            :loading="editLoading"
            @submit="onEditSubmit"
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
      <q-card class="q-px-xs q-py-xs">
        <q-card-section>
          <div class="text-h6 text-center">Ajouter un entraînement</div>
        </q-card-section>
        <q-card-section>
          <WorkoutForm
            buttonLabel="Ajouter"
            buttonIcon="add"
            :loading="addLoading"
            @submit="onAddSubmit"
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
  </div>
</template>

<script>
import { addWorkout, deleteWorkout, getWorkouts, updateWorkout, moveWorkout, enableShareForWorkout, cancelShareForWorkout } from 'src/services/workoutService'
import GymyHeader from 'src/components/GymyHeader.vue'
import { Dialog } from 'quasar'
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'
import WorkoutForm from 'src/components/Workouts/WorkoutForm.vue'
import draggable from 'vuedraggable'
import WorkoutCard from 'src/components/Workouts/WorkoutCard.vue'
import { copyToClipboard } from 'quasar'
import { Share } from '@capacitor/share'
import { getUser } from 'src/services/userService'
import { USER_GUEST_UID } from 'src/helpers/userHelper'

export default {
  name: 'ChoiceWorkout',
  emits: ['selectWorkout'],
  components: {
    GymyHeader,
    WorkoutForm,
    draggable,
    WorkoutCard
  },
  data() {
    return {
      drag: false,
      workouts: {},
      addForm: false,
      addLoading: false,
      editForm: false,
      editLoading: false,
      workoutToEdit: {},
      workoutToShare: {},
      shareForm: false,
      generatingShareLoading: false,
      cancelShareLoading: false
    }
  },
  created() {
    this.loadWorkouts()
  },
  computed: {
    isAuthenticated() {
      const user = getUser()
      return user && user.uid !== USER_GUEST_UID
    }
  },
  methods: {
    onDragEnd(e) {
      this.$q.loading.show({
        delay: 400, // ms
        message: 'Déplacement en cours...',
        boxClass: 'text-h5'
      })
      this.drag = false
      const newPosition = e.newIndex + 1
      moveWorkout(e.item['_underlying_vm_'].id, newPosition)
        .catch((err) => {
          errorNotify('Une erreur est survenue lors du déplacement de votre entraînement')
          this.loadWorkouts()
        })
        .finally(() => {
          this.$q.loading.hide()
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
          successNotify('Votre entraînement a bien été ajouté')
          this.addForm = false
          this.addLoading = false
        })
        .catch((err) => {
          this.addLoading = false
          errorNotify("Une erreur est survenue lors de l'ajout de votre entraînement")
        })
    },
    onEditSubmit(payload) {
      this.editLoading = true
      updateWorkout(payload.id, payload)
        .then(() => {
          this.loadWorkouts()
          successNotify('Votre entraînement a bien été modifié')
          this.editForm = false
          this.editLoading = false
          this.workoutToEdit = {}
        })
        .catch((err) => {
          this.editLoading = false
          errorNotify("Une erreur est survenue lors de l'édition de votre entraînement")
        })
    },
    shareBtn(workout) {
      if (!this.isAuthenticated) return
      Share.share({
        title: "Partage d'un entraînement sur Gymy",
        text: 'Essaie mon entraînement "' + workout.label.trim() + '" sur Gymy !',
        url: process.env.APP_MAIN_URL + '/share/' + workout.shareId,
        dialogTitle: "Partage de l'entraînement"
      })
    },
    cancelShare(workout) {
      this.cancelShareLoading = true
      cancelShareForWorkout(workout.id)
        .then(() => {
          workout.shareId = null
          this.loadWorkouts()
          successNotify('Le partage de votre entraînement a bien été désactivé')
          this.cancelShareLoading = false
        })
        .catch((err) => {
          this.cancelShareLoading = false
          errorNotify('Une erreur est survenue lors de la désactivation du partage de votre entraînement')
        })
    },
    generateShareId(workout) {
      if (!this.isAuthenticated) return
      this.generatingShareLoading = true
      enableShareForWorkout(workout.id)
        .then(({ shareId }) => {
          workout.shareId = shareId
          this.loadWorkouts()
          copyToClipboard(process.env.APP_MAIN_URL + '/share/' + shareId).then(() => {
            successNotify('Le lien de partage a été copié')
            this.generatingShareLoading = false
          })
        })
        .catch((err) => {
          this.generatingShareLoading = false
          errorNotify('Une erreur est survenue lors de la génération du code de partage')
        })
    },
    edit(workout) {
      this.workoutToEdit = { ...workout }
      this.editForm = true
    },
    share(workout) {
      this.workoutToShare = { ...workout }
      this.shareForm = true
    },
    showDeleteModal(workout) {
      let deleteLoading = false
      Dialog.create({
        title: "Suppression d'entraînement",
        message: 'Êtes-vous sûr de vouloir supprimer votre entraînement ' + workout.label + ' ?',
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
              successNotify('Votre entraînement a bien été supprimé')
            })
            .catch((err) => {
              deleteLoading = false
              errorNotify('Une erreur est survenue lors de la suppression de votre entraînement')
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
