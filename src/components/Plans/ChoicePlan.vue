<template>
  <div class="flex column">
    <GymyHeader text="Planifications" />
    <div v-if="plans && plans.length > 0">
      <draggable
        :list="plans"
        class="list-group"
        ghost-class="ghost"
        itemKey="id"
        handle=".draggable-btn"
        @end="onDragEnd"
        @start="drag = true"
      >
        <template #item="{ element }">
          <q-card
            @click="$emit('selectPlan', element)"
            class="cursor-pointer q-mb-md flex-center column q-px-md"
          >
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
            <q-card-actions
              horizontal
              class="absolute-right gt-xs no-wrap"
            >
              <q-btn
                flat
                round
                color="primary"
                icon="edit"
                @click.stop="edit(element)"
              />
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                @click.stop="showDeleteModal(element)"
              />
            </q-card-actions>
            <q-card-actions
              horizontal
              class="lt-sm no-wrap q-pa-none"
            >
              <q-btn
                flat
                round
                color="primary"
                icon="edit"
                @click.stop="edit(element)"
              />
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                @click.stop="showDeleteModal(element)"
              />
            </q-card-actions>
            <div class="draggable-btn-container">
              <q-icon
                :class="'draggable-btn ' + (drag ? 'cursor-grabbing' : 'cursor-grab')"
                size="sm"
                name="menu"
              ></q-icon>
            </div>
          </q-card>
        </template>
      </draggable>
    </div>
    <span
      v-else
      class="text-center"
      >Aucune planification de disponible</span
    >
    <q-dialog v-model="editForm">
      <q-card class="q-px-xs q-py-xs">
        <q-card-section>
          <div class="text-h6 text-center">Modifier la planification {{ planToEdit.label }}</div>
        </q-card-section>
        <q-card-section>
          <PlanForm
            :initData="planToEdit"
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
          <div class="text-h6 text-center">Ajouter une planification</div>
        </q-card-section>
        <q-card-section>
          <PlanForm
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
import { addPlan, deletePlan, getPlans, updatePlan, movePlan } from 'src/services/planService'
import GymyHeader from 'src/components/GymyHeader.vue'
import { Dialog } from 'quasar'
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'
import PlanForm from 'src/components/Plans/PlanForm.vue'
import draggable from 'vuedraggable'

export default {
  name: 'ChoicePlan',
  emits: ['selectPlan'],
  components: {
    GymyHeader,
    PlanForm,
    draggable
  },
  data() {
    return {
      drag: false,
      plans: {},
      addForm: false,
      addLoading: false,
      editForm: false,
      editLoading: false,
      planToEdit: {}
    }
  },
  created() {
    this.loadPlans()
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
      movePlan(e.item['_underlying_vm_'].id, newPosition)
        .catch((err) => {
          errorNotify('Une erreur est survenue lors du déplacement de votre planification')
          this.loadPlans()
        })
        .finally(() => {
          this.$q.loading.hide()
        })
    },
    loadPlans() {
      this.plans = getPlans()
    },
    onAddSubmit(payload) {
      this.addLoading = true
      addPlan(payload)
        .then(() => {
          this.loadPlans()
          successNotify('Votre planification a bien été ajoutée')
          this.addForm = false
          this.addLoading = false
        })
        .catch((err) => {
          this.addLoading = false
          errorNotify("Une erreur est survenue lors de l'ajout de votre planification")
        })
    },
    onEditSubmit(payload) {
      this.editLoading = true
      updatePlan(payload.id, { label: payload.label })
        .then(() => {
          this.loadPlans()
          successNotify('Votre planification a bien été modifiée')
          this.editForm = false
          this.editLoading = false
        })
        .catch((err) => {
          this.editLoading = false
          errorNotify("Une erreur est survenue lors de l'édition de votre planification")
        })
    },
    edit(plan) {
      this.planToEdit = plan
      this.editForm = true
    },
    showDeleteModal(plan) {
      let deleteLoading = false
      Dialog.create({
        title: "Suppression d'entraînement",
        message: 'Êtes-vous sûr de vouloir supprimer votre planification ' + plan.label + ' ?',
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
          deletePlan(plan.id)
            .then(() => {
              this.loadPlans()
              successNotify('Votre planification a bien été supprimée')
            })
            .catch((err) => {
              deleteLoading = false
              errorNotify('Une erreur est survenue lors de la suppression de votre planification')
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
