<template>
  <div class="flex column">
    <GymyHeader :text="'Exercices - ' + workout.label" />
    <div v-if="exercices && exercices.length > 0">
      <draggable :list="exercices" class="list-group" ghost-class="ghost" itemKey="id" @end="onDragEnd">
        <template #item="{ element }">
          <q-card @click="$emit('selectExercice', element)"
            class="q-mb-md flex-center column q-px-md">
            <q-card-section class="sm">
              <div class="text-h6">
                {{ element.label }}
              </div>
            </q-card-section>
            <q-card-section class="q-pb-none lt-sm">
              <div class="text-h6">
                {{ element.label }}
              </div>
            </q-card-section>
            <q-card-actions horizontal class="absolute-right sm no-wrap">
              <q-btn flat round color="primary" icon="edit" @click.stop="edit(element)" />
              <q-btn flat round color="negative" icon="delete" @click.stop="showDeleteModal(element)" />
            </q-card-actions>
            <q-card-actions horizontal class="lt-sm no-wrap q-pa-none">
              <q-btn flat round color="primary" icon="edit" @click.stop="edit(element)" />
              <q-btn flat round color="negative" icon="delete" @click.stop="showDeleteModal(element)" />
            </q-card-actions>
          </q-card>
        </template>
      </draggable>
    </div>
    <span v-else class="text-center">Aucun exercice de disponible dans cet entrainement</span>
    <q-dialog v-model="editForm">
      <q-card class="q-px-xl q-py-xl">
        <q-card-section>
          <div class="text-h6 text-center">Modifier l'exercice {{ exerciceToEdit.label }}</div>
        </q-card-section>
        <q-card-section>
          <ExerciceForm :initData="exerciceToEdit" buttonLabel="Confirmer" :loading="editLoading"
            @submit="onEditSubmit" />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn label="Annuler" color="negative" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="addForm">
      <q-card class="q-px-xl q-py-xl">
        <q-card-section>
          <div class="text-h6 text-center">Ajouter un exercice</div>
        </q-card-section>
        <q-card-section>
          <ExerciceForm buttonLabel="Ajouter" buttonIcon="add" :loading="addLoading" @submit="onAddSubmit" />
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
import { addExercice, deleteExercice, getExercices, moveExercice, updateExercice } from 'src/services/exerciceService'
import GymyHeader from 'src/components/GymyHeader.vue'
import { Dialog } from 'quasar'
import { errorNotify, successNotify } from 'src/services/notifyService'
import ExerciceForm from 'src/components/Manage/ExerciceForm.vue'
import draggable from 'vuedraggable'

export default {
  name: 'ManageExercices',
  emits: ['selectExercice'],
  components: {
    GymyHeader,
    ExerciceForm,
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
      exercices: [],
      addForm: false,
      addLoading: false,
      editForm: false,
      editLoading: false,
      exerciceToEdit: {},
    }
  },
  created() {
    this.loadExercices()
  },
  methods: {
    onDragEnd(e) {
      const newPosition = e.newIndex + 1
      moveExercice(this.workout.id, e.item['_underlying_vm_'].id, newPosition)
        .catch((err) => {
          console.log(err)
          errorNotify('Une erreur est survenue lors du déplacement de votre exercice')
          this.loadExercices()
        })
    },
    async loadExercices() {
      this.exercices = await getExercices(this.workout.id)
    },
    onAddSubmit(payload) {
      this.addLoading = true
      addExercice(this.workout.id, payload)
        .then(async () => {
          await this.loadExercices()
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
      updateExercice(this.workout.id, payload.id, { label: payload.label })
        .then(async () => {
          await this.loadExercices()
          successNotify('Votre exercice a bien été modifié')
          this.editForm = false
          this.editLoading = false
        })
        .catch((err) => {
          this.editLoading = false
          errorNotify('Une erreur est survenue lors de l\'édition de votre exercice')
        })
    },
    edit(exercice) {
      this.exerciceToEdit = exercice
      this.editForm = true
    },
    showDeleteModal(exercice) {
      let deleteLoading = false
      Dialog.create({
        title: 'Suppression d\'exercice',
        message: 'Êtes-vous sûr de vouloir supprimer votre exercice ' + exercice.label + ' ?',
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
          deleteExercice(this.workout.id, exercice.id)
            .then(async () => {
              await this.loadExercices()
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

<style scoped lang="scss">
</style>
