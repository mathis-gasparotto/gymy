<template>
  <q-page class="flex flex-center page">
    <div class="page-content column items-center">
      <GymyHeader text="Compte" />
      <div class="w-100" v-if="user">
        <div class="w-100 flex account-info-line row no-wrap" v-if="user.uid !== USER_GUEST_UID">
          <div class="w-50 text-bold text-right">
            Nom d'utilisateur
          </div>
          <div class="w-50 text-left">
            {{ user.username }}
          </div>
        </div>
        <div class="w-100 flex account-info-line row no-wrap" v-if="user.uid !== USER_GUEST_UID">
          <div class="w-50 text-bold text-right">
            Email
          </div>
          <div class="w-50 text-left">
            {{ user.email }}
          </div>
        </div>
        <div class="w-100 flex account-info-line row no-wrap">
          <div class="w-50 text-bold text-right">
            Nombre de séries par défaut
          </div>
          <div class="w-50 text-left">
            {{ user.defaultNumberOfSeries }}
          </div>
        </div>
        <div class="w-100 flex account-info-line row no-wrap">
          <div class="w-50 text-bold text-right">
            Temps de repos
          </div>
          <div class="w-50 text-left">
            {{ formatting().durationFormatFromString(user.restTime) }}
          </div>
        </div>
      </div>
      <EditDefaultNumberOfSeries :initData="user.defaultNumberOfSeries" @reloadUser="loadUser" class="q-mt-lg" />
      <EditRestTime :initData="user.restTime" @reloadUser="loadUser" class="q-mt-lg" />
      <EditUsername v-if="user.uid !== USER_GUEST_UID" @reloadUser="loadUser" class="q-mt-lg" />
      <UpdatePassword v-if="user.uid !== USER_GUEST_UID" class="q-mt-lg" />
      <SignupAsGuest :user="user" v-if="user.uid === USER_GUEST_UID" class="q-mt-lg" />
      <q-btn @click="logout" color="negative" class="w-content q-mt-xl">Se déconnecter</q-btn>
      <q-btn @click="deleteAccount" color="negative" class="w-content q-mt-xl" v-if="user.uid !== USER_GUEST_UID">Supprimer mon compte</q-btn>
    </div>
  </q-page>
</template>

<script>
import { deleteAllUserData, logout as logoutFirebase } from 'src/services/authService'
import GymyHeader from 'src/components/GymyHeader.vue'
import { getUser } from 'src/services/userService'
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'
import { Dialog } from 'quasar'
import formatting from 'src/helpers/formatting'
import { USER_GUEST_UID } from 'src/helpers/userHelper'
import EditDefaultNumberOfSeries from 'src/components/Account/EditDefaultNumberOfSeries.vue'
import EditRestTime from 'src/components/Account/EditRestTime.vue'
import UpdatePassword from 'src/components/Account/UpdatePassword.vue'
import SignupAsGuest from 'src/components/Account/SignupAsGuest.vue'
import EditUsername from 'src/components/Account/EditUsername.vue'

export default {
  name: 'AccountPage',
  components: {
    GymyHeader,
    EditDefaultNumberOfSeries,
    EditRestTime,
    UpdatePassword,
    SignupAsGuest,
    EditUsername
  },
  setup() {
    return {
      formatting,
      USER_GUEST_UID
    }
  },
  data() {
    return {
      user: null
    }
  },
  created() {
    this.loadUser()
  },
  methods: {
    loadUser() {
      this.user = getUser()
    },
    deleteAccount() {
      let deleteLoading = false
      Dialog.create({
        title: 'Supprimer mon compte',
        message: 'Toutes vos données seront perdues et cette action est irréversible.',
        cancel: {
          label: 'Annuler',
          color: 'primary'
        },
        ok: {
          label: 'Supprimer',
          color: 'negative',
          loading: deleteLoading
        }
      }).onOk(() => {
        deleteLoading = true
        deleteAllUserData().then(() => {
          this.$router.push({ name: 'login' })
          successNotify('Votre compte a bien été supprimé')
        }).catch(() => {
          deleteLoading = false
          errorNotify('Une erreur est survenue lors de la suppression de votre compte')
        })
      })
    },
    logout() {
      if (this.user.uid === USER_GUEST_UID) {
        return Dialog.create({
          title: 'Se déconnecter',
          message: 'Toutes vos données seront perdues et cette action est irréversible.',
          cancel: {
            label: 'Annuler',
            color: 'primary'
          },
          ok: {
            label: 'se déconnecter',
            color: 'negative'
          }
        }).onOk(() => {
          logoutFirebase().then(() => {
            this.$router.push({ name: 'login' })
          })
        })
      }
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
