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

    <q-footer class="nav-bar-container">
      <q-tabs align="center" class="bg-dark nav-bar" indicator-color="transparent" active-color="primary">
        <q-route-tab :to="{ name: 'index' }" icon="home" label="Accueil" />
        <q-route-tab :to="{ name: 'manage' }" icon="fitness_center" label="Entrainements" />
        <q-route-tab :to="{ name: 'addPerf' }" icon="add" label="Ajouter une perf" />
        <!-- <q-route-tab :to="{ name: 'account' }" icon="account_circle" label="Compte" /> -->
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script>

export default {
  name: 'MainLayout'
}
</script>

<style lang="scss" scoped>
.nav-bar {
  border-radius: 20px 20px 0 0;

  &-container {
    background-color: transparent;

    .q-tab {
      flex: 1 1 auto;

      &__label {
        font-size: 16px;
        font-weight: 300;
      }
    }
  }
}
</style>
