<template>
  <p class="title text-h6 q-py-md bg-primary text-center text-bold color-white rounded q-mb-lg">
    {{ text }}
  </p>
</template>

<script>
export default {
  name: 'GymyHeader',
  props: {
    text: {
      type: String,
      required: true
    }
  }
}
</script>
