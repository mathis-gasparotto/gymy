<template>
  <div class="flex column">
    <GymyHeader :text="'Entraînements<br/>' + plan.label" />
    <div v-if="planWorkouts && planWorkouts.length > 0">
      <div class="relative">
        <div class="plan-template absolute">
          <div
            class="q-mb-lg"
            v-for="(workout, index) in cachedList"
            :key="workout.id"
          >
            <h2 class="q-mb-sm text-center text-h5">{{ getDayByIndex(index) }}</h2>
            <q-card
              flat
              class="flex-center column q-px-md plan-template__card relative"
            >
              <div
                v-if="!workout.restDay"
                class="invisible"
              >
                <q-card-section class="gt-xs">
                  <div class="text-h6 text-center">
                    {{ workout.label }}
                  </div>
                </q-card-section>
                <q-card-section class="q-pb-none lt-sm">
                  <div class="text-h6 text-center">
                    {{ workout.label }}
                  </div>
                </q-card-section>
                <q-card-actions
                  horizontal
                  class="lt-sm no-wrap q-pa-none"
                >
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="fa-solid fa-circle-minus"
                  />
                </q-card-actions>
              </div>
              <q-card-section class="absolute">
                <div class="text-h6 text-center color-primary flex flex-center">
                  Repos
                  <q-btn
                    flat
                    round
                    color="primary"
                    inversed
                    icon="add_circle"
                    @click="remove(index)"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
        <draggable
          :list="planWorkouts"
          class="list-group"
          ghost-class="ghost"
          itemKey="index"
          handle=".draggable-btn"
          @end="onDragEnd"
          @start="drag = true"
          :move="onMove"
        >
          <template #item="{ element, index }">
            <div class="q-mb-lg">
              <h2 class="q-mb-sm text-center text-h5 workout-day no-hover">{{ getDayByIndex(index) }}</h2>
              <q-card
                class="flex-center column q-px-md"
                v-if="!element.restDay"
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
                    color="negative"
                    icon="fa-solid fa-circle-minus"
                    @click="remove(index)"
                  />
                </q-card-actions>
                <q-card-actions
                  horizontal
                  class="lt-sm no-wrap q-pa-none"
                >
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="fa-solid fa-circle-minus"
                    @click="remove(index)"
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
              <q-card
                class="flex-center column q-px-md plan-template__card restDay cursor-pointer"
                v-else
                @click="showAddPlanFunction(index)"
              >
                <q-card-section> </q-card-section>
              </q-card>
            </div>
          </template>
        </draggable>
      </div>
    </div>
    <span
      v-else
      class="text-center"
      >Aucun entraînement de disponible</span
    >
    <q-dialog
      v-model="showAddPlan"
      @hide="resetForm"
    >
      <q-card class="q-px-xs q-py-xs">
        <q-card-section class="text-h5 text-center"> Choisissez un entraînement </q-card-section>
        <q-card-section>
          <q-card
            class="cursor-pointer q-mb-md"
            v-for="workout in workouts"
            :key="workout.id"
            @click="selectWorkout(workout)"
          >
            <q-card-section class="text-h6 text-center">
              {{ workout.label }}
            </q-card-section>
          </q-card>
        </q-card-section>
        <q-expansion-item
          icon="sym_o_add_box"
          label="Définir un entraînement personnalisé"
          class="q-mb-lg bordered-y"
        >
          <q-card-section>
            <q-form
              @submit.prevent="submitCustomWorkout"
              class="flex-center column"
            >
              <q-input
                name="label"
                rounded
                outlined
                label="Libellé"
                class="q-mb-md"
                type="text"
                v-model="customWorkout.label"
                lazy-rules
                :rules="[(val) => val.trim().length > 2 || 'Veuillez renseigner minimum 3 caractères']"
              />
              <q-btn
                color="primary"
                label="Enregistrer"
                type="submit"
                :disable="!customWorkoutFormValid"
                :loading="customWorkoutFormLoading"
              />
            </q-form>
          </q-card-section>
        </q-expansion-item>
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
import { getNoAbsWorkouts } from 'src/services/workoutService'
import { getPlanWorkouts, updatePlan } from 'src/services/planService'
import GymyHeader from 'src/components/GymyHeader.vue'
import { errorNotify } from 'src/helpers/notifyHelper'
import draggable from 'vuedraggable'
import { uid } from 'quasar'
import formatting from 'src/helpers/formatting'

export default {
  name: 'PlanWorkouts',
  props: {
    plan: {
      type: Object,
      required: true
    }
  },
  components: {
    GymyHeader,
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
      workoutToEdit: {},
      planWorkouts: [],
      showAddPlan: false,
      indexToAddWorkout: null,
      customWorkout: {
        label: ''
      },
      customWorkoutFormLoading: false,
      showCustomWorkoutForm: false,
      cachedList: []
    }
  },
  created() {
    this.workouts = getNoAbsWorkouts()
    this.loadPlanWorkouts()
    this.cachedList = [...this.planWorkouts]
  },
  computed: {
    customWorkoutFormValid() {
      return this.customWorkout.label.trim().length > 2
    }
  },
  watch: {
    planWorkouts: {
      handler() {
        this.cachedList = [...this.planWorkouts]
      },
      deep: true
    }
  },
  methods: {
    submitCustomWorkout() {
      this.selectWorkout(this.customWorkout)
    },
    showAddPlanFunction(index) {
      this.indexToAddWorkout = index
      this.showAddPlan = true
    },
    getDayByIndex(index) {
      switch (index) {
        case 0:
          return 'Lundi'
        case 1:
          return 'Mardi'
        case 2:
          return 'Mercredi'
        case 3:
          return 'Jeudi'
        case 4:
          return 'Vendredi'
        case 5:
          return 'Samedi'
        case 6:
          return 'Dimanche'
      }
    },
    onMove(e) {
      let move = {}
      switch (true) {
        case e.willInsertAfter && e.draggedContext.futureIndex > e.draggedContext.index:
          move = {
            from: e.draggedContext.futureIndex - 1,
            to: e.draggedContext.futureIndex
          }
          break
        case !e.willInsertAfter && e.draggedContext.futureIndex < e.draggedContext.index:
          move = {
            from: e.draggedContext.futureIndex + 1,
            to: e.draggedContext.futureIndex
          }
          break
        case e.willInsertAfter && e.draggedContext.futureIndex < e.draggedContext.index:
          move = {
            from: e.draggedContext.futureIndex,
            to: e.draggedContext.futureIndex + 1
          }
          break
        case !e.willInsertAfter && e.draggedContext.futureIndex > e.draggedContext.index:
          move = {
            from: e.draggedContext.futureIndex,
            to: e.draggedContext.futureIndex - 1
          }
          break
      }
      this.cachedList = formatting().array_move(this.cachedList, move.from, move.to)
    },
    onDragEnd(e) {
      this.drag = false
      updatePlan(this.plan.id, {
        mondayWorkoutId: this.planWorkouts[0].restDay ? null : this.planWorkouts[0].id || null,
        mondayWorkoutLabel: this.planWorkouts[0].restDay ? null : this.planWorkouts[0].id ? null : this.planWorkouts[0].label,
        tuesdayWorkoutId: this.planWorkouts[1].restDay ? null : this.planWorkouts[1].id || null,
        tuesdayWorkoutLabel: this.planWorkouts[1].restDay ? null : this.planWorkouts[1].id ? null : this.planWorkouts[1].label,
        wednesdayWorkoutId: this.planWorkouts[2].restDay ? null : this.planWorkouts[2].id || null,
        wednesdayWorkoutLabel: this.planWorkouts[2].restDay ? null : this.planWorkouts[2].id ? null : this.planWorkouts[2].label,
        thursdayWorkoutId: this.planWorkouts[3].restDay ? null : this.planWorkouts[3].id || null,
        thursdayWorkoutLabel: this.planWorkouts[3].restDay ? null : this.planWorkouts[3].id ? null : this.planWorkouts[3].label,
        fridayWorkoutId: this.planWorkouts[4].restDay ? null : this.planWorkouts[4].id || null,
        fridayWorkoutLabel: this.planWorkouts[4].restDay ? null : this.planWorkouts[4].id ? null : this.planWorkouts[4].label,
        saturdayWorkoutId: this.planWorkouts[5].restDay ? null : this.planWorkouts[5].id || null,
        saturdayWorkoutLabel: this.planWorkouts[5].restDay ? null : this.planWorkouts[5].id ? null : this.planWorkouts[5].label,
        sundayWorkoutId: this.planWorkouts[6].restDay ? null : this.planWorkouts[6].id || null,
        sundayWorkoutLabel: this.planWorkouts[6].restDay ? null : this.planWorkouts[6].id ? null : this.planWorkouts[6].label
      }).catch((err) => {
        errorNotify('Une erreur est survenue lors du déplacement de votre entraînement')
        this.loadPlanWorkouts()
      })
    },
    loadPlanWorkouts() {
      this.planWorkouts = getPlanWorkouts(this.plan.id)
      this.planWorkouts = this.planWorkouts.map((planWorkout) => {
        if (!planWorkout) {
          return {
            idForList: uid(),
            restDay: true,
            label: 'Repos'
          }
        } else {
          return {
            ...planWorkout,
            idForList: uid()
          }
        }
      })
    },
    remove(index) {
      let payload = {}
      switch (index) {
        case 0:
          payload = {
            mondayWorkoutId: null,
            mondayWorkoutLabel: null
          }
          break
        case 1:
          payload = {
            tuesdayWorkoutId: null,
            tuesdayWorkoutLabel: null
          }
          break
        case 2:
          payload = {
            wednesdayWorkoutId: null,
            wednesdayWorkoutLabel: null
          }
          break
        case 3:
          payload = {
            thursdayWorkoutId: null,
            thursdayWorkoutLabel: null
          }
          break
        case 4:
          payload = {
            fridayWorkoutId: null,
            fridayWorkoutLabel: null
          }
          break
        case 5:
          payload = {
            saturdayWorkoutId: null,
            saturdayWorkoutLabel: null
          }
          break
        case 6:
          payload = {
            sundayWorkoutId: null,
            sundayWorkoutLabel: null
          }
          break
      }
      updatePlan(this.plan.id, payload)
        .then(() => {
          this.loadPlanWorkouts()
        })
        .catch((err) => {
          errorNotify('Une erreur est survenue lors du retrait de votre entraînement au programme')
          this.loadPlanWorkouts()
        })
    },
    selectWorkout(workout) {
      let payload = {}
      if (!workout.id && workout.label) {
        switch (this.indexToAddWorkout) {
          case 0:
            payload = {
              mondayWorkoutLabel: workout.label
            }
            break
          case 1:
            payload = {
              tuesdayWorkoutLabel: workout.label
            }
            break
          case 2:
            payload = {
              wednesdayWorkoutLabel: workout.label
            }
            break
          case 3:
            payload = {
              thursdayWorkoutLabel: workout.label
            }
            break
          case 4:
            payload = {
              fridayWorkoutLabel: workout.label
            }
            break
          case 5:
            payload = {
              saturdayWorkoutLabel: workout.label
            }
            break
          case 6:
            payload = {
              sundayWorkoutLabel: workout.label
            }
            break
        }
      } else {
        switch (this.indexToAddWorkout) {
          case 0:
            payload = {
              mondayWorkoutId: workout.id
            }
            break
          case 1:
            payload = {
              tuesdayWorkoutId: workout.id
            }
            break
          case 2:
            payload = {
              wednesdayWorkoutId: workout.id
            }
            break
          case 3:
            payload = {
              thursdayWorkoutId: workout.id
            }
            break
          case 4:
            payload = {
              fridayWorkoutId: workout.id
            }
            break
          case 5:
            payload = {
              saturdayWorkoutId: workout.id
            }
            break
          case 6:
            payload = {
              sundayWorkoutId: workout.id
            }
            break
        }
      }
      updatePlan(this.plan.id, payload)
        .then(() => {
          this.loadPlanWorkouts()
          this.showAddPlan = false
          this.indexToAddWorkout = null
        })
        .catch((err) => {
          errorNotify("Une erreur est survenue lors de l'ajout de votre entraînement au programme")
          this.loadPlanWorkouts()
        })
    },
    resetForm() {
      this.customWorkout = {
        label: ''
      }
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

.workout-day {
  opacity: 0;
}

.restDay {
  opacity: 0;
}

.plan-template {
  width: 100%;
  top: -20px;
  left: 0;

  &__card {
    outline: 3px dashed $primary;
    outline-offset: -3px;
    min-height: 90px;

    @media (min-width: 600px) {
      min-height: 64px;
    }

    &-button {
      height: 42px;
    }
  }
}
</style>
