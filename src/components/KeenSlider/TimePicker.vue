<template>
  <div
    :style="{
      // height: '200px',
      height: '150px',
      // padding: '50px',
      display: 'flex',
      'justify-content': 'center',
      borderRadius: '20px',
      // background: '#000'
      background: 'linear-gradient(black, #333, black)'
    }"
  >
    <div :style="{ width: '70px' }">
      <Wheel
        v-model="time.hours"
        :length="24"
        :width="23"
        side="left"
      />
    </div>
    <div :style="{ width: '70px' }">
      <Wheel
        v-model="time.minutes"
        :length="60"
        :width="23"
        perspective="left"
        side="right"
      />
    </div>
  </div>
</template>

<script>
import Wheel from './Wheel.vue'
export default {
  name: 'TimePicker',
  emits: ['update:modelValue'],
  components: {
    Wheel
  },
  props: {
    modelValue: {
      type: String,
      default: '00:00'
    }
  },
  data() {
    return {
      time: {
        hours: 0,
        minutes: 0
      }
    }
  },
  created() {
    this.time.hours = Number(this.modelValue.split(':')[0]) || 0
    this.time.minutes = Number(this.modelValue.split(':')[1]) || 0
  },
  watch: {
    time: {
      immediate: true,
      handler() {
        this.updateModelValue()
      },
      deep: true
    }
  },
  methods: {
    updateModelValue() {
      this.$emit('update:modelValue', `${this.time.hours}:${this.time.minutes}`)
    }
  }
}
</script>

<style lang="scss" scoped></style>
