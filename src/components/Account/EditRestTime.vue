<template>
  <div>
    <q-btn
      @click="show = true"
      color="primary"
      class="w-content"
      >Modifier mon temps de repos</q-btn
    >
    <q-dialog v-model="show">
      <q-card class="q-px-md q-py-xs">
        <q-card-section align="center">
          <div class="text-h6 text-center">Modifier votre temps de repos</div>
        </q-card-section>
        <q-card-section
          align="center"
          class="column"
        >
          <DurationPicker
            v-model="newRestTime"
            class="w-content q-mx-auto q-mb-lg"
          />
          <q-btn
            label="Enregistrer"
            class="w-content q-mx-auto"
            :loading="loading"
            color="primary"
            @click="submit"
          />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            label="Annuler"
            color="negative"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { updateUser } from 'src/services/userService'
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'
import formatting from 'src/helpers/formatting'
import DurationPicker from 'src/components/KeenSlider/DurationPicker.vue'

export default {
  name: 'EditRestTime',
  emits: ['reloadUser'],
  components: {
    DurationPicker
  },
  props: {
    initData: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      newRestTime: null,
      show: false,
      loading: false
    }
  },
  created() {
    this.newRestTime = this.initData
  },
  methods: {
    submit() {
      if (!this.newRestTime) return
      this.loading = true
      updateUser({ restTime: formatting().durationFormatFromString(this.newRestTime) })
        .then(() => {
          this.$emit('reloadUser')
          this.loading = false
          this.show = false
          successNotify('Votre nombre de série par défaut a bien été modifié')
        })
        .catch((err) => {
          this.loading = false
          errorNotify('Une erreur est survenue lors de la modification de votre nombre de série par défaut')
        })
    }
  }
}
</script>

<styles scoped lang="scss"></styles>
