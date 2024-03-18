<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center column">
        <router-view class="q-py-md" />
        <!-- <div class="flex flex-center column q-py-md bg-transparent">
          <div class="q-mb-sm">
            <q-btn
              unelevated
              :style="{ textTransform: 'unset', lineHeight: '1rem' }"
              class="text-h6"
              padding="0"
              @click="openURL(`${siteUrl}`)"
              >gymy.app</q-btn
            >
          </div>
          <div>
            <q-btn
              unelevated
              :style="{ textTransform: 'unset', lineHeight: '1rem' }"
              padding="0"
              @click="openURL(`${siteUrl}`)"
              >Mentions légales</q-btn
            >
            /
            <q-btn
              unelevated
              :style="{ textTransform: 'unset', lineHeight: '1rem' }"
              padding="0"
              @click="openURL(`${siteUrl}`)"
              >RGPD</q-btn
            >
            /
            <q-btn
              unelevated
              :style="{ textTransform: 'unset', lineHeight: '1rem' }"
              padding="0"
              @click="openURL(`${siteUrl}/#faq`)"
              >FAQ</q-btn
            >
          </div>
        </div> -->
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar'
export default {
  name: 'WelcomeLayout',
  setup() {
    return {
      openURL
    }
  },
  data() {
    return {
      siteUrl: process.env.SITE_URL
    }
  }
}
</script>
