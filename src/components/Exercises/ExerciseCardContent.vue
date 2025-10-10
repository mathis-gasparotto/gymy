<template>
  <template v-if="exercise.abs && !forAbs">
    <q-card-section
      class="gt-xs"
      :class="{ disabled: exercise.disabled }"
    >
      <div class="text-h6 text-center">Abs</div>
      <div
        v-if="exercise.config"
        class="text-center"
      >
        {{ exercise.config }}
      </div>
    </q-card-section>
    <q-card-section
      class="q-pb-none lt-sm"
      :class="{ disabled: exercise.disabled }"
    >
      <div class="text-h6 text-center">Abs</div>
      <div
        v-if="exercise.config"
        class="text-center"
      >
        {{ exercise.config }}
      </div>
    </q-card-section>
  </template>
  <template v-else>
    <q-card-section
      class="gt-xs"
      :class="{ disabled: exercise.disabled }"
    >
      <div class="text-h6 text-center">
        {{ forAbs && exercise.restAbs ? 'Repos 😴' : exercise.label }}
      </div>
      <div
        v-if="exercise.config && (!forAbs || !exercise.restAbs)"
        class="text-center"
      >
        {{ exercise.config }}
      </div>
      <div
        v-if="exercise.duration && forAbs"
        class="text-h6 text-center"
      >
        {{ exercise.duration }}s
      </div>
    </q-card-section>
    <q-card-section
      class="q-pb-none lt-sm"
      :class="{ disabled: exercise.disabled }"
    >
      <div class="text-h6 text-center">
        {{ forAbs && exercise.restAbs ? 'Repos 😴' : exercise.label }}
      </div>
      <div
        v-if="exercise.config && (!forAbs || !exercise.restAbs)"
        class="text-center"
        :class="{ 'q-mr-lg': exercise.duration && forAbs }"
      >
        {{ exercise.config }}
      </div>
      <div
        v-if="exercise.forLastSeries && forAbs"
        class="text-center"
      >
        Finisher !
      </div>
      <div
        v-if="exercise.notForLastSeries && forAbs"
        class="text-center text-caption"
      >
        Exclu de la dernière série
      </div>
    </q-card-section>
  </template>
  <q-card-section
    v-if="exercise.duration && forAbs"
    class="lt-sm duration-section q-pa-xs"
    :class="{ disabled: exercise.disabled }"
  >
    <div class="text-h6 text-center">{{ exercise.duration }}s</div>
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
      @click.stop="$emit('edit')"
    />
    <q-btn
      flat
      round
      color="secondary"
      icon="content_copy"
      @click.stop="$emit('copy')"
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
    class="lt-sm no-wrap q-pa-none"
  >
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
      color="secondary"
      icon="content_copy"
      @click.stop="$emit('copy')"
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
export default {
  name: 'ExerciseCardContent',
  emits: ['edit', 'showDeleteModal', 'copy'],
  props: {
    exercise: {
      type: Object,
      required: true
    },
    forAbs: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped lang="scss">
.duration-section {
  position: absolute;
  right: 10px;
  height: 100%;
  display: flex;
  align-items: center;
}
</style>
