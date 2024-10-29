<template>
  <div class="column flex-center">
    <div class="timer-container">
      <div class="number-container">
        <span class="number-title">MINUTES</span>
        <div class="digital-container">
          <span class="single-digit">{{ minutes > 9 ? Math.floor(minutes / 10) : 0 }}</span>
          <span class="single-digit">{{ minutes % 10 }}</span>
        </div>
      </div>
      <span class="separator-container">
        <span class="separator"></span>
        <span class="separator"></span>
      </span>
      <div class="number-container">
        <span class="number-title">SECONDES</span>
        <div class="digital-container">
          <span class="single-digit">{{ seconds > 9 ? Math.floor(seconds / 10) : 0 }}</span>
          <span class="single-digit">{{ seconds % 10 }}</span>
        </div>
      </div>
    </div>

    <DurationPicker
      v-if="showEdit && !timerInterval"
      class="q-mb-lg"
      v-model="durationPickerVal"
    />
    <div class="flex flex-center action-btns">
      <q-btn
        color="primary"
        icon="play_arrow"
        round
        size="lg"
        @click="startTimer"
        v-if="!timerInterval"
      />
      <q-btn
        color="negative"
        icon="stop"
        round
        size="lg"
        @click="stopTimer"
        v-else
      />
      <q-btn
        color="secondary"
        icon="restart_alt"
        round
        size="lg"
        @click="setTimer"
      />
      <q-btn
        v-if="!timerInterval"
        color="orange"
        :icon="showEdit ? 'check' : 'edit'"
        round
        size="lg"
        @click="showEdit = !showEdit"
      />
    </div>
  </div>
</template>

<script>
import { getUser } from 'src/services/userService'
import { useSound } from '@vueuse/sound'
import endTimerSfx from 'src/assets/sounds/rest-timer-end.mp3'
import timerInProgressSfx from 'src/assets/sounds/timer-in-progress.mp3'
import DurationPicker from 'src/components/KeenSlider/DurationPicker.vue'

export default {
  name: 'Timer',
  emits: ['timerEnd'],
  props: {
    timer: {
      type: String,
      required: false
    }
  },
  components: {
    DurationPicker
  },
  setup() {
    const { play: playEndSound } = useSound(endTimerSfx, { volume: 2.5, autoplay: false, interrupt: true })
    const { play: playInProgressSound, stop: stopInProgressSound } = useSound(timerInProgressSfx, { volume: 1, autoplay: false, interrupt: true, loop: true })
    return {
      playEndSound,
      playInProgressSound,
      stopInProgressSound
    }
  },
  data() {
    return {
      initialMinutes: 0,
      initialSeconds: 0,
      minutes: 0,
      seconds: 0,
      timerInterval: null,
      showEdit: false
    }
  },
  computed: {
    durationPickerVal: {
      get() {
        return `${this.minutes}:${this.seconds}`
      },
      set(val) {
        this.initialMinutes = Number(val.split(':')[0])
        this.initialSeconds = Number(val.split(':')[1])
        this.initTimerVal = val
        this.minutes = this.initialMinutes
        this.seconds = this.initialSeconds
      }
    }
  },
  created() {
    this.initTimerVal = this.timer
    if (!this.initTimerVal) {
      const user = getUser()
      this.initTimerVal = user.restTime
    }
    this.initialMinutes = Number(this.initTimerVal.split(':')[0])
    this.initialSeconds = Number(this.initTimerVal.split(':')[1])

    this.setTimer()
  },
  methods: {
    setTimer() {
      this.minutes = this.initialMinutes
      this.seconds = this.initialSeconds
      this.stopTimer()
    },
    startTimer() {
      this.playInProgressSound()
      this.timerInterval = setInterval(() => {
        if (this.seconds === 0) {
          if (this.minutes > 0) {
            this.minutes--
            this.seconds = 59
          }
        } else {
          this.seconds--
        }
        if (this.seconds === 0 && this.minutes === 0) {
          this.setTimer()
          this.timerEnd()
          return
        }
      }, 1000)
    },
    stopTimer() {
      this.stopInProgressSound()
      clearInterval(this.timerInterval)
      this.timerInterval = null
    },
    timerEnd() {
      this.$emit('timerEnd')
      this.stopInProgressSound()
      this.playEndSound()
    }
  }
}
</script>

<style scoped lang="scss">
.action-btns {
  gap: 20px;
}
.timer-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 30px;
}
.number-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 5px;
  &:first-child {
    margin-left: 0;
  }
}
.separator-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: flex-end;
  margin: 0 0 10px;
}
.separator {
  display: inline-block;
  width: 6px;
  height: 6px;
  background-color: #404549;
  border-radius: 6px;
  margin: 5px 0;
}
.number-title {
  font-size: 12px;
  margin-bottom: 5px;
}
.digital-container {
  display: flex;
  flex-direction: row;
  padding: 0;
}
.single-digit {
  position: relative;
  display: flex;
  flex: 0 1 25%;
  font-size: 30px;
  background-color: #404549;
  border-radius: 5px;
  padding: 10px 12px;
  color: #fff;
  &:first-child {
    margin-right: 2px;
  }
  &:after {
    position: absolute;
    left: 0px;
    right: 0px;
    top: 50%;
    bottom: 50%;
    content: '';
    width: '100%';
    height: 2px;
    background-color: #232323;
    opacity: 0.4;
  }
}
</style>
