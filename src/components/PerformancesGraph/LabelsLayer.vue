<template>
  <g class="layer-labels">
    <text
      v-for="(p, i) in points"
      :key="i"
      :x="p.x"
      :y="p.y - 10"
      text-anchor="middle"
      font-size="12"
      fill="#8884d8"
    >
      {{ p.props.data[dataKeys[2]] ? p.props.data[dataKeys[1]] * (reversed ? -1 : 1) : '' }}
    </text>
  </g>
</template>

<script>
import { usePoints } from 'vue3-charts'

export default {
  name: 'LabelsLayer',
  props: {
    dataKeys: {
      type: Object,
      required: true
    },
    reversed: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { points } = usePoints(props.dataKeys)
    return { points }
  }
}
</script>
