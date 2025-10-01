<template>
  <q-card
    class="q-mb-md flex-center column q-px-md"
    :class="{ 'cursor-pointer': !forAbs }"
    v-if="!draggable"
  >
    <ExerciseCardContent :exercise="exercise" :forAbs="forAbs" @edit="$emit('edit')" @showDeleteModal="$emit('showDeleteModal')" @copy="$emit('copy')" />
  </q-card>
  <ExerciseCardContent v-else :exercise="exercise" :forAbs="forAbs" @edit="$emit('edit')" @showDeleteModal="$emit('showDeleteModal')" @copy="$emit('copy')" />
</template>

<script>
import ExerciseCardContent from 'src/components/Exercises/ExerciseCardContent.vue'

export default {
  name: 'ExerciseCard',
  emits: ['edit', 'showDeleteModal', 'copy'],
  components: {
    ExerciseCardContent
  },
  props: {
    exercise: {
      type: Object,
      required: true
    },
    draggable: {
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
</style>
