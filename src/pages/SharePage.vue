<template>
  <q-page class="column flex-center">
    <p>Importation de l'entraînement en cours...</p>
    <q-spinner-ios
        color="primary"
        size="3em"
      />
  </q-page>
</template>

<script>
import translatting from 'src/helpers/translatting'
import { addSharedContentToOwnDB } from 'src/services/shareService'
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'

export default {
  name: 'SharePage',
  created() {
    addSharedContentToOwnDB(this.$route.params.shareId).then((route) => {
      successNotify('Entraînement importé avec succès')
      this.$router.push(route)
    }).catch((err) => {
      errorNotify(translatting().translateError(err))
      this.$router.push({ name: 'index' })
    })
  }
}
</script>

<style scoped lang="scss"></style>
