<template>
  <q-card-section class="gt-sm flex flex-center">
    <div class="q-mr-lg flex flex-center">
      <AbsIcon v-if="workout.isAbs" :color="isDarkMode ? '#FFF': '#000'" width="40" />
    </div>
    <div :class="{ 'title-container': workout.isAbs }">
      <div class="text-h6 text-center flex flex-center">
        {{ workout.label }}
      </div>
      <div
        v-if="workout.comment"
        class="text-center"
      >
        {{ workout.comment }}
      </div>
    </div>
  </q-card-section>
  <q-card-section class="q-pb-none lt-md">
    <div class="text-h6 text-center">
      {{ workout.label }}
    </div>
    <div
      v-if="workout.comment"
      class="text-center"
      :class="{ 'q-mr-lg': workout.isAbs }"
    >
      {{ workout.comment }}
    </div>
  </q-card-section>
  <q-card-section
    v-if="workout.isAbs"
    class="lt-md abs-indicator-section q-pa-none"
  >
    <AbsIcon :color="isDarkMode ? '#FFF': '#000'" width="50" />
  </q-card-section>
  <q-card-actions
    horizontal
    class="absolute-right gt-sm no-wrap"
  >
    <q-btn
      flat
      round
      color="secondary"
      icon="share"
      @click.stop="$emit('share')"
    />
    <q-btn
      flat
      round
      color="primary"
      icon="edit"
      @click.stop="$emit('edit')"
    />
    <q-btn
      flat
      round
      color="negative"
      icon="delete"
      @click.stop="$emit('showDeleteModal')"
    />
  </q-card-actions>
  <q-card-actions
    horizontal
    class="lt-md no-wrap q-pa-none"
  >
    <q-btn
      flat
      round
      color="secondary"
      icon="share"
      @click.stop="$emit('share')"
    />
    <q-btn
      flat
      round
      color="primary"
      icon="edit"
      @click.stop="$emit('edit')"
    />
    <q-btn
      flat
      round
      color="negative"
      icon="delete"
      @click.stop="$emit('showDeleteModal')"
    />
  </q-card-actions>
</template>

<script>
import { useQuasar } from 'quasar'
import { ref, watch } from 'vue'
import AbsIcon from 'src/components/Icons/Abs.vue';

export default {
  name: 'WorkoutCardContent',
  emits: ['share', 'edit', 'showDeleteModal'],
  components: {
    AbsIcon
  },
  setup () {
    const $q = useQuasar()

    const isDarkMode = ref(false)
    isDarkMode.value = $q.dark.isActive
    watch(() => $q.dark.isActive, val => {
      isDarkMode.value = val
    })

    return {
      isDarkMode
    }
  },
  props: {
    workout: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped lang="scss">
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
