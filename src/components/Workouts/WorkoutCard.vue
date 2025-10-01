<template>
  <q-card class="cursor-pointer q-mb-md flex-center column q-px-md" v-if="!draggable">
    <WorkoutCardContent :workout="workout" @share="$emit('share')" @edit="$emit('edit')" @showDeleteModal="$emit('showDeleteModal')" />
  </q-card>
  <WorkoutCardContent v-else :workout="workout" @share="$emit('share')" @edit="$emit('edit')" @showDeleteModal="$emit('showDeleteModal')" />
</template>

<script>
import WorkoutCardContent from 'src/components/Workouts/WorkoutCardContent.vue'

export default {
  name: 'WorkoutCard',
  emits: ['share', 'edit', 'showDeleteModal'],
  components: {
    WorkoutCardContent
  },
  props: {
    workout: {
      type: Object,
      required: true
    },
    draggable: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped lang="scss">
</style>
