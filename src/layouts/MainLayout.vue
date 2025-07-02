<template>
  <q-layout view="lHh Lpr lFf">
    <!-- <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          Gymy
        </q-toolbar-title>
      </q-toolbar>
    </q-header> -->

    <q-page-container>
      <router-view @hideNavbar="hideNavBar" @showNavbar="showNavBar" />
    </q-page-container>

    <q-footer class="main-nav-bar-container" v-model="showFooter">
      <q-tabs align="center" class="bg-dark main-nav-bar nav-bar" indicator-color="transparent" active-color="primary">
        <q-route-tab :to="{ name: 'index' }" icon="home" class="q-py-md" />
        <q-route-tab :to="{ name: 'workouts' }" icon="fitness_center" class="q-py-md" />
        <q-route-tab :to="{ name: 'abs' }" icon="fa-solid fa-stopwatch-20" class="q-py-md" />
        <q-route-tab :to="{ name: 'plans' }" icon="format_list_bulleted" class="q-py-md" />
        <q-route-tab :to="{ name: 'account' }" icon="account_circle" class="q-py-md" />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script>
import { Keyboard } from '@capacitor/keyboard'

export default {
  name: 'MainLayout',
  data() {
    return {
      showFooter: true,
      hideNavBarFromComponent: false
    }
  },
  created() {
    if (this.$q.platform.is.capacitor) {
      Keyboard.addListener('keyboardWillShow', () => {
        this.showFooter = false
      })
      Keyboard.addListener('keyboardWillHide', () => {
        this.showFooter = !this.hideNavBarFromComponent
      })
    }
  },
  methods: {
    hideNavBar() {
      this.showFooter = false
      this.hideNavBarFromComponent = true
    },
    showNavBar() {
      this.showFooter = true
      this.hideNavBarFromComponent = false
    }
  }
}
</script>

<style lang="scss">
.main-nav-bar {
  border-radius: 20px 20px 0 0;

  &-container {
    background-color: transparent;

    .q-tab {
      flex: 1 1 auto;

      &__label {
        font-size: 12px;

        @media (min-width: 992px) {
          font-size: 14px;
        }
      }

      @media (min-width: 992px) {
        padding: 0 16px;
      }
    }
  }
}
</style>
