<template>
  <q-card class="q-mb-md flex-center column q-px-md" :class="{ 'cursor-pointer': !forAbs }">
    <q-card-section class="gt-xs">
      <div class="text-h6 text-center">
        {{ exercise.label }}
      </div>
      <div v-if="exercise.config" class="text-center">
        ({{ exercise.config }})
      </div>
      <div v-if="exercise.duration && forAbs" class="text-h6 text-center">
        {{ exercise.duration }}s
      </div>
    </q-card-section>
    <q-card-section class="q-pb-none lt-sm">
      <div class="text-h6 text-center">
        {{ exercise.label }}
      </div>
      <div v-if="exercise.config" class="text-center">
        ({{ exercise.config }})
      </div>
    </q-card-section>
    <q-card-section v-if="exercise.duration && forAbs" class="lt-sm duration-section">
      <div class="text-h6 text-center">
        {{ exercise.duration }}s
      </div>
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
  name: 'ExerciseCard',
  emits: ['edit', 'showDeleteModal'],
  props: {
    exercise: {
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
    },
    forAbs: {
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
.duration-section {
    position: absolute;
    right: 10px;
    height: 100%;
    display: flex;
    align-items: center;
}
</style>
