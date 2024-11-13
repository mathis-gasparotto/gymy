<template>
  <q-card class="flex-center column q-px-md">
    <q-card-section>
      <div class="text-h6">
        {{ formatting().dateToDisplay(performance.date) }}
      </div>
    </q-card-section>
    <q-card-section class="column flex-center">
      {{ performance.series.map((serie) => serie.value + (serie.type === PERFORMANCE_TYPE_DEFAULT ? '' : ' (' + getPerfromanceType(serie.type) + ')')).join(' - ') }}
      <div
        v-if="performance.comment"
        class="text-center"
      >
        {{ performance.comment }}
      </div>
    </q-card-section>
    <q-card-actions
      horizontal
      class="no-wrap q-pa-none"
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
        @click.stop="$emit('delete')"
      />
    </q-card-actions>
  </q-card>
</template>

<script>
import { PERFORMANCE_TYPE_DEFAULT, PERFORMANCE_TYPE_BAR, PERFORMANCE_TYPE_ARM } from 'src/helpers/performanceHelper'
import formatting from 'src/helpers/formatting'

export default {
  name: 'PerformanceCard',
  emits: ['edit', 'delete', 'copy'],
  props: {
    performance: {
      type: Object,
      required: true
    }
  },
  setup() {
    return {
      PERFORMANCE_TYPE_DEFAULT,
      formatting
    }
  },
  methods: {
    getPerfromanceType(typeData) {
      switch (typeData) {
        case PERFORMANCE_TYPE_BAR:
          return 'Barre'
        case PERFORMANCE_TYPE_ARM:
          return 'Bras'
        default:
          return 'Défaut'
      }
    }
  }
}
</script>

<style scoped lang="scss"></style>
