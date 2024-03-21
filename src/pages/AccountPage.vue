<template>
  <q-page class="flex flex-center page">
    <div class="page-content column items-center">
      <GymyHeader text="Compte" />
      <div class="w-100 flex account-info-line row no-wrap" v-if="user">
        <div class="w-50 text-bold text-right">
          Nom d'utilisateur
        </div>
        <div class="w-50 text-left">
          {{ user.username }}
        </div>
      </div>
      <div class="w-100 flex account-info-line row no-wrap" v-if="user">
        <div class="w-50 text-bold text-right">
          Email
        </div>
        <div class="w-50 text-left">
          {{ user.email }}
        </div>
      </div>
      <div class="w-100 flex account-info-line row no-wrap" v-if="user">
        <div class="w-50 text-bold text-right">
          Nombre de séries par défaut
        </div>
        <div class="w-50 text-left">
          {{ user.defaultNumberOfSeries }}
        </div>
      </div>
      <q-btn @click="showEditDefaultNumberOfSeries = true" color="primary" class="w-content q-mt-lg" icon="edit">Modifier le nombre de séries par défaut</q-btn>
      <q-btn @click="logout" color="negative" class="w-content q-mt-xl">Se déconnecter</q-btn>
      <q-btn @click="deleteAccount" color="negative" class="w-content q-mt-xl">Supprimer son compte</q-btn>
      <q-dialog v-model="showEditDefaultNumberOfSeries">
        <q-card class="q-px-xl q-py-xl">
          <q-card-section align="center">
            <div class="text-h6 text-center">Modifier votre nombre de série par défaut</div>
          </q-card-section>
          <q-card-section align="center" class="column">
            <q-input
              name="defaultNumberOfSeries"
              outlined
              class="q-mb-md"
              type="number"
              inputmode="numeric"
              v-model="newDefaultNumberOfSeries"
              min="0"
              :rules="[
                (val) => (val !== null && val !== '') || 'Veullez remplir ce champ',
                (val) => val >= 1 || 'Veullez renseigner une valeur positif supérieur à 0',
              ]"
              label="Nombre de séries par défaut*"
              lazy-rules
              hide-bottom-space
            >
            </q-input>
            <q-btn
              label="Enregistrer"
              @click="submitDefaultNumberOfSeries"
              :disable="!newDefaultNumberOfSeriesValid"
              :loading="defaultNumberOfSeriesLoading"
              color="primary"
            />
          </q-card-section>
          <q-card-actions align="center">
            <q-btn label="Annuler" color="negative" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import { deleteAllUserData, logout as logoutFirebase } from 'src/services/authService'
import GymyHeader from 'src/components/GymyHeader.vue'
import { getUser, updateUser } from 'src/services/userService'
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'
import { Dialog } from 'quasar'

export default {
  name: 'AccountPage',
  components: {
    GymyHeader
  },
  data() {
    return {
      user: null,
      newDefaultNumberOfSeries: null,
      showEditDefaultNumberOfSeries: false,
      defaultNumberOfSeriesLoading: false,
    }
  },
  created() {
    this.loadUser()
  },
  computed: {
    newDefaultNumberOfSeriesValid() {
      return this.newDefaultNumberOfSeries !== null && this.newDefaultNumberOfSeries !== '' && this.newDefaultNumberOfSeries >= 1
    }
  },
  methods: {
    async loadUser() {
      this.user = await getUser()
      this.newDefaultNumberOfSeries = this.user.defaultNumberOfSeries
    },
    submitDefaultNumberOfSeries() {
      this.defaultNumberOfSeriesLoading = true
      updateUser({ defaultNumberOfSeries: Number(this.newDefaultNumberOfSeries) }).then(async () => {
        await this.loadUser()
        this.defaultNumberOfSeriesLoading = false
        this.showEditDefaultNumberOfSeries = false
        successNotify('Votre nombre de série par défaut a bien été modifié')
      }).catch((err) => {
        this.defaultNumberOfSeriesLoading = false
        errorNotify('Une erreur est survenue lors de la modification de votre nombre de série par défaut')
      })
    },
    deleteAccount() {
      let deleteLoading = false
      Dialog.create({
        title: 'Supprimer son compte',
        message: 'Êtes-vous sûr de vouloir supprimer votre compte ?',
        cancel: {
          label: 'Annuler',
          color: 'primary',
          unelevated: true
        },
        ok: {
          label: 'Supprimer',
          color: 'negative',
          unelevated: true,
          loading: deleteLoading
        },
        persistent: true
      }).onOk(() => {
        deleteLoading = true
        deleteAllUserData().then(() => {
          this.$router.push({ name: 'login' })
        }).catch(() => {
          deleteLoading = false
          errorNotify('Une erreur est survenue lors de la suppression de votre compte')
        })
      })
    },
    logout() {
      logoutFirebase().then(() => {
        this.$router.push({ name: 'login' })
      })
    }
  }
}
</script>

<styles scoped lang="scss">
.account-info-line {
  gap: 10px;
}
</styles>
