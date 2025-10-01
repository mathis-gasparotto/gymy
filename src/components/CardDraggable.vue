<template>
  <draggable
    :list="list"
    class="list-group"
    ghost-class="ghost"
    itemKey="id"
    handle=".draggable-btn"
    @end="onDragEnd"
    @start="onDragStart"
  >
    <template #item="{ element }">
      <q-card
        @click="onCardClick(element)"
        class="cursor-pointer q-mb-md flex-center column q-px-md"
      >
        <slot name="content" :element="element" />
        <div class="draggable-btn-container" @click.stop>
          <q-icon
            :class="'draggable-btn ' + (drag ? 'cursor-grabbing' : 'cursor-grab')"
            size="sm"
            name="menu"
          ></q-icon>
        </div>
      </q-card>
    </template>
  </draggable>
</template>

<script>
import draggable from 'vuedraggable';

export default {
  name: 'CardDraggable',
  emits: ['cardClick', 'dragStart', 'dragEnd', 'update:drag'],
  components: {
    draggable
  },
  props: {
    list: {
      type: Array,
      required: true
    },
    drag: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onDragStart(e) {
      this.$emit('update:drag', true)
      this.$emit('dragStart', e)
    },
    onDragEnd(e) {
      this.$emit('dragEnd', e)
    },
    onCardClick(e) {
      if (this.drag) {
        return
      }
      this.$emit('cardClick', e)
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
