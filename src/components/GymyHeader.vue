<template>
  <p class="title text-h6 q-py-md bg-primary text-center text-bold color-white rounded q-mb-lg" v-html=text />
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

<style scoped lang="scss">
.title {
  width: 100%;
}
</style>
