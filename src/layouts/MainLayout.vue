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
      <router-view />
    </q-page-container>

    <q-footer class="main-nav-bar-container">
      <q-tabs align="center" class="bg-dark main-nav-bar nav-bar" indicator-color="transparent" active-color="primary">
        <q-route-tab :to="{ name: 'index' }" icon="home" label="Accueil" />
        <q-route-tab :to="{ name: 'workouts' }" icon="fitness_center" label="Entrainements" />
        <q-route-tab :to="{ name: 'plans' }" icon="format_list_bulleted" label="Planifications" />
        <q-route-tab :to="{ name: 'account' }" icon="account_circle" label="Compte" />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script>

export default {
  name: 'MainLayout'
}
</script>

<style lang="scss">
.main-nav-bar {
  border-radius: 20px 20px 0 0;

  &-container {
    background-color: transparent;

    .q-tab {
      flex: 1 1 auto;
      padding: 0;
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
