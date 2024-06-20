<template>
  <q-card class="cursor-pointer q-mb-md flex-center column q-px-md" >
    <q-card-section class="gt-xs flex flex-center">
      <div class="q-mr-lg flex flex-cente">
        <img v-if="workout.isAbs" src="/src/assets/picto-abs.png" width="40px" />
      </div>
      <div :class="{'title-container': workout.isAbs}">
        <div class="text-h6 text-center flex flex-center">
          {{ workout.label }}
        </div>
        <div v-if="workout.comment" class="text-center">
          {{ workout.comment }}
        </div>
      </div>
    </q-card-section>
    <q-card-section class="q-pb-none lt-sm">
      <div class="text-h6 text-center">
        {{ workout.label }}
      </div>
      <div v-if="workout.comment" class="text-center">
        {{ workout.comment }}
      </div>
    </q-card-section>
    <q-card-section v-if="workout.isAbs" class="lt-sm abs-indicator-section">
      <img src="/src/assets/picto-abs.png" width="50px" />
    </q-card-section>
    <q-card-actions horizontal class="absolute-right gt-xs no-wrap">
      <q-btn flat round color="primary" icon="edit" @click.stop="$emit('edit')" />
      <q-btn flat round color="negative" icon="delete" @click.stop="$emit('showDeleteModal')" />
    </q-card-actions>
    <q-card-actions horizontal class="lt-sm no-wrap q-pa-none">
      <q-btn flat round color="primary" icon="edit" @click.stop="$emit('edit')" />
      <q-btn flat round color="negative" icon="delete" @click.stop="$emit('showDeleteModal')" />
    </q-card-actions>
    <div v-if="draggable" class="draggable-btn-container">
      <q-icon :class="'draggable-btn ' + (drag ? 'cursor-grabbing' : 'cursor-grab')" size="sm" name="menu"></q-icon>
    </div>
  </q-card>
</template>

<script>
export default {
  name: 'WorkoutCard',
  emits: ['edit', 'showDeleteModal'],
  props: {
    workout: {
      type: Object,
      required: true
    },
    draggable: {
      type: Boolean,
      default: false
    },
    drag: {
      type: Boolean,
      default: false
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
.abs-indicator-section {
  position: absolute;
  right: 10px;
  height: 100%;
  display: flex;
  align-items: center;
}
.title-container {
  padding-right: 40px;
}
</style>
