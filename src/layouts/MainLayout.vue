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
      <q-page-sticky
        position="bottom-right"
        :offset="[18, 18]"
        v-if="showTimer"
      >
        <q-fab
          color="primary"
          text-color="white"
          icon="timer"
          direction="left"
          label-position="left"
          :label="time"
          :hide-label="!timerAlreadyStarted"
          persistent
        >
          <q-fab-action
            color="green"
            text-color="white"
            @click.capture="startTimer"
            icon="play_arrow"
            external-label
            :label="time"
            label-position="top"
            :hide-label="timerAlreadyStarted"
            v-if="!timerInterval"
          />
          <q-fab-action
            color="warning"
            text-color="white"
            @click.capture="stopTimer"
            icon="pause"
            v-else
          />
          <q-fab-action
            color="primary"
            text-color="white"
            @click.capture="setTimer"
            icon="restart_alt"
            v-if="timerInterval || minutes !== initialMinutes || seconds !== initialSeconds"
          />
        </q-fab>
      </q-page-sticky>
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
import { getUser } from 'src/services/userService'
import { useSound } from '@vueuse/sound'
import endTimerSfx from 'src/assets/sounds/rest-timer-end.mp3'
import timerInProgressSfx from 'src/assets/sounds/timer-in-progress.mp3'
import last3Sec from 'src/assets/sounds/clock-ticking.mp3'

export default {
  name: 'MainLayout',
  setup() {
    const { play: playEndSound } = useSound(endTimerSfx, { volume: 2.5, autoplay: false, interrupt: true })
    const { play: playInProgressSound, stop: stopInProgressSound } = useSound(timerInProgressSfx, { volume: 1, autoplay: false, interrupt: true, loop: true })
    const { play: playLast3SecSound, stop: stopLast3SecSound } = useSound(last3Sec, { volume: 1, autoplay: false, interrupt: true, loop: true })
    return {
      playEndSound,
      playInProgressSound,
      stopInProgressSound,
      playLast3SecSound,
      stopLast3SecSound
    }
  },
  data() {
    return {
      showFooter: true,
      hideNavBarFromComponent: false,
      initialMinutes: 0,
      initialSeconds: 0,
      minutes: 0,
      seconds: 0,
      timerInterval: null,
      excludedRoutesFromTimer: ['share', 'abs', 'account']
    }
  },
  computed: {
    time() {
      return (this.minutes <= 9 ? '0' + this.minutes : this.minutes) + ':' + (this.seconds <= 9 ? '0' + this.seconds : this.seconds)
    },
    showTimer() {
      return !this.excludedRoutesFromTimer.includes(this.$route.name)
    },
    timerAlreadyStarted() {
      return this.timerInterval || this.minutes !== this.initialMinutes || this.seconds !== this.initialSeconds
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
    const user = getUser()
    this.initialMinutes = Number(user.restTime.split(':')[0])
    this.initialSeconds = Number(user.restTime.split(':')[1])
    this.setTimer()
  },
  methods: {
    hideNavBar() {
      this.showFooter = false
      this.hideNavBarFromComponent = true
    },
    showNavBar() {
      this.showFooter = true
      this.hideNavBarFromComponent = false
    },
    setTimer() {
      this.minutes = this.initialMinutes
      this.seconds = this.initialSeconds
      this.stopTimer()
    },
    startTimer() {
      if (this.seconds <= 3 && this.minutes === 0) {
        this.playSoundLast3Sec()
      } else {
        this.playInProgressSound()
      }

      this.timerInterval = setInterval(() => {
        if (this.seconds === 0) {
          if (this.minutes > 0) {
            this.minutes--
            this.seconds = 59
          }
        } else {
          this.seconds--
        }
        if (this.seconds === 3 && this.minutes === 0) {
          this.playSoundLast3Sec()
        }
        if (this.seconds === 0 && this.minutes === 0) {
          this.timerEnd()
          return
        }
      }, 1000)
    },
    stopTimer() {
      this.stopInProgressSound()
      this.stopLast3SecSound()
      clearInterval(this.timerInterval)
      this.timerInterval = null
    },
    timerEnd() {
      this.stopInProgressSound()
      this.stopLast3SecSound()
      this.playEndSound()
      this.setTimer()
    },
    playSoundLast3Sec() {
      this.stopInProgressSound()
      this.playLast3SecSound()
    },
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
