<template>
  <q-page class="page flex flex-center">
    <div
      v-if="!started"
      class="page-content column items-center"
      :class="{ 'overflow-hidden': preWorkoutTimer }"
    >
      <div
        v-if="preWorkoutTimer !== null"
        class="fixed-center z-max fit flex flex-center text-h1 pre-workout-timer"
      >
        {{ preWorkoutTimer > 0 ? preWorkoutTimer : 'Go !' }}
      </div>
      <GymyHeader text="Commencer des séries d'Abs 💪" />
      <div class="text-h6 text-center q-mb-lg">Liste des séries</div>
      <q-list class="q-mb-lg w-100">
        <div
          v-if="workouts.length <= 0"
          class="text-center"
        >
          <p>Aucune série d'abs disponible</p>
          <p>Rendez-vous dans la page des <RouterLink :to="{ name: 'workouts' }">entraînements</RouterLink> pour ajouter un entraînement d'abs</p>
        </div>
        <q-card
          v-for="workout in workouts"
          :key="workout.id"
          class="q-mb-md"
          :class="{ 'bg-primary text-white': workout.selected }"
          @click="selectWorkout(workout)"
        >
          <q-card-section>
            <q-item-label class="text-center text-weight-bold">{{ workout.label }}</q-item-label>
            <q-item-label class="text-center text-weight-bold">
              {{ formatting().durationFromSeconds(workout.durationWithoutFinishers) }}<span v-if="workout.duration !== workout.durationWithoutFinishers"> (dernière : {{ formatting().durationFromSeconds(workout.duration) }})</span> - {{ workout.restTime }}s
            </q-item-label>
          </q-card-section>
        </q-card>
      </q-list>
      <q-input
        name="series_number"
        rounded
        outlined
        label="Nombre de séries à réaliser"
        class="q-mb-lg"
        type="number"
        inputmode="numeric"
        min="1"
        :rules="[(val) => val > 0 || 'Veuillez renseigner un nombre de série supérieur à 0']"
        v-model="seriesNb"
        hide-bottom-space
        suffix="série(s)"
        @update:model-value="onAbsWorkoutSelectectUpdate"
      />
      <div
        v-if="isValid"
        class="q-mb-sm"
      >
        Durée totale : {{ formatting().durationFromSeconds(totalDuration) }}
      </div>
      <div
        v-if="isValid"
        class="q-mb-lg"
      >
        Heure de fin : {{ formatting().timeToDisplay(finishTime.value) }}
      </div>
      <q-btn
        label="Commencer"
        color="primary"
        @click="start"
        :disable="!isValid"
      />
    </div>
    <div
      v-else
      class="page-content column items-center"
    >
      <GymyHeader :text="'Abs - ' + selectedWorkout.label" />
      <div class="flex q-mb-lg">
        <q-btn
          v-if="!paused"
          color="secondary"
          label="Pause"
          icon="pause"
          @click="pauseAbs"
        />
        <q-btn
          v-else
          color="primary"
          label="Reprendre"
          icon="play_arrow"
          @click="resumeAbs"
        />
        <q-btn
          color="negative"
          label="Arrêter"
          class="q-ml-md"
          icon="stop"
          @click="stopAbs"
        />
      </div>
      <div class="text-center q-mb-sm">Temps restant : {{ formatting().durationFromSeconds(totalRemainingTime) }}</div>
      <div
        v-if="finishTime.value"
        class="q-mb-lg"
      >
        Heure de fin : {{ formatting().timeToDisplay(finishTime.value) }}
      </div>
      <div class="text-h5 text-center q-mb-lg">Série {{ currentSeries }}/{{ seriesNb }}</div>
      <div class="text-h4 text-center q-mb-lg">{{ rest ? 'Inter-séries' : 'Étape ' + step + '/' + nbExercises }}</div>
      <div
        class="text-h5 text-center"
        v-if="futurExercise && (timer <= displayNextExercise || rest || currentExercise.restAbs)"
      >
        Prochain : {{ futurExercise.restAbs ? 'Repos 😴' : futurExercise.label }}
      </div>
      <div
        class="next-exercise-space"
        v-else
      ></div>
      <div class="text-h4 text-center q-mt-sm q-mb-lg">{{ rest || currentExercise.restAbs ? 'Repos 😴' : currentExercise.label }}</div>
      <div class="text-h1">{{ timer }}</div>
      <div
        v-if="finished"
        class="fixed-center z-max fit flex flex-center text-h3 finished-display"
      >
        <q-card>
          <q-card-section class="q-pa-lg">Terminé ! 🎉</q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { getAbsWorkouts } from 'src/services/workoutService'
import GymyHeader from 'src/components/GymyHeader.vue'
import { errorNotify } from 'src/helpers/notifyHelper'
import { getExercises } from 'src/services/exerciseService'
import formatting from 'src/helpers/formatting'
import { useSound } from '@vueuse/sound'
import endSound from 'src/assets/sounds/Finish First Mario Kart Wii.mp3'
import countdownSound from 'src/assets/sounds/mariostart.mp3'
import ding from 'src/assets/sounds/ding.mp3'
import timerInProgress from 'src/assets/sounds/timer-in-progress.mp3'
import last3Sec from 'src/assets/sounds/clock-ticking.mp3'

export default {
  name: 'Abs',
  components: {
    GymyHeader
  },
  setup() {
    const { play: playEnd, stop: stopEnd } = useSound(endSound, { volume: 0.5, autoplay: false, interrupt: true })
    const { play: playCountdown, stop: stopCountdown } = useSound(countdownSound, { volume: 0.5, autoplay: false, interrupt: true })
    const { play: playDing, stop: stopDing } = useSound(ding, { volume: 1, autoplay: false, interrupt: true })
    const { play: playInProgress, stop: stopInProgress } = useSound(timerInProgress, { volume: 1, autoplay: false, interrupt: true, loop: true })
    const { play: playLast3Sec, stop: stopLast3Sec } = useSound(last3Sec, { volume: 1, autoplay: false, interrupt: true, loop: true })
    return {
      formatting,
      playEnd,
      playCountdown,
      playDing,
      playInProgress,
      stopInProgress,
      stopEnd,
      stopCountdown,
      stopDing,
      playLast3Sec,
      stopLast3Sec
    }
  },
  data() {
    return {
      modal: false,
      workouts: [],
      seriesNb: null,
      currentSeries: null,
      started: false,
      preWorkoutTimer: null,
      timer: null,
      step: null,
      finished: false,
      rest: false,
      intervals: [],
      timeouts: [],
      totalRemainingTime: null,
      paused: false,
      finishTime: {
        interval: null,
        value: null
      },
      displayNextExercise: 3 // time in secondes before next exercise to display it
    }
  },
  created() {
    this.reloadData()

    // prevent back navigation
    this.$router.beforeEach((to, from, next) => {
      if (this.started) {
        next(false)
      } else {
        next()
      }
    })
    this.finishTime.interval = setInterval(() => {
      if (this.started || this.isValid) {
        this.finishTime.value = this.getEndTime()
      } else {
        this.finishTime.value = null
      }
    }, 1000)
  },
  beforeMount() {
    window.addEventListener('beforeunload', this.preventReload)
  },
  beforeUnmount() {
    this.stopAllIntervals()
    this.stopAllTimeouts()
    this.stopAllSounds()
    this.$emit('showNavbar')
    if (this.finishTime.interval) clearInterval(this.finishTime.interval)
    window.removeEventListener('beforeunload', this.preventReload)
  },
  mounted() {},
  watch: {
    seriesNb(val) {
      this.seriesNb = parseInt(val)
    }
  },
  computed: {
    isValid() {
      return this.seriesNb > 0 && this.workouts.some((workout) => workout.selected)
    },
    selectedWorkout() {
      const workout = this.workouts.find((workout) => workout.selected)
      if (!workout) return null
      workout.exercises = getExercises(workout.id)
      return workout
    },
    totalDuration() {
      return this.selectedWorkout.durationWithoutFinishers * this.seriesNb + this.selectedWorkout.restTime * (this.seriesNb - 1) + (this.selectedWorkout.duration - this.selectedWorkout.durationWithoutFinishers)
    },
    nbExercises() {
      if (this.lastSeries) {
        return this.selectedWorkout.exercises.length
      } else {
        return this.selectedWorkout.exercises.filter((exercise) => !exercise.forLastSeries).length
      }
    },
    currentExercise() {
      if (this.lastSeries) {
        return this.selectedWorkout.exercises[this.step - 1]
      } else {
        return this.selectedWorkout.exercises.filter((ex) => !ex.forLastSeries)[this.step - 1]
      }
    },
    futurExercise() {
      const series = this.lastSeries ? this.selectedWorkout.exercises : this.selectedWorkout.exercises.filter((ex) => !ex.forLastSeries)
      const futurSeries = this.seriesNb === this.currentSeries + 1 ? this.selectedWorkout.exercises : this.selectedWorkout.exercises.filter((ex) => !ex.forLastSeries)
      switch (true) {
        case this.lastExercise && this.lastSeries:
          return null
        case this.lastExercise && this.rest:
          return futurSeries[0]
        case this.lastExercise:
          return { label: 'Repos', restAbs: true }
        default:
          return series[this.step]
      }
    },
    lastExercise() {
      return this.step === this.nbExercises
    },
    lastSeries() {
      return this.currentSeries === this.seriesNb
    }
  },
  methods: {
    reloadData() {
      this.seriesNb = null
      this.currentSeries = null
      this.started = false
      this.preWorkoutTimer = null
      this.timer = null
      this.step = null
      this.finished = false
      this.rest = false
      this.intervals = []
      this.timeouts = []
      this.totalRemainingTime = null
      this.paused = false
      // if (this.finishTime.interval) clearInterval(this.finishTime.interval)
      // this.finishTime.interval = null
      this.finishTime.value = null
      this.workouts = getAbsWorkouts()
        .filter((workout) => workout.exercises)
        .map((workout) => ({
          ...workout,
          selected: false,
          duration: Object.values(workout.exercises).reduce((acc, exercise) => acc + exercise.duration, 0) || 0,
          durationWithoutFinishers: Object.values(workout.exercises).reduce((acc, exercise) => acc + (exercise.forLastSeries ? 0 : exercise.duration), 0) || 0
        }))
    },
    onAbsWorkoutSelectectUpdate() {
      if (this.isValid) {
        this.finishTime.value = this.getEndTime()
        // this.finishTime.interval = setInterval(() => {
        //   this.finishTime.value = this.getEndTime()
        //   if (!this.isValid || this.started || this.preWorkoutTimer !== null) {
        //     clearInterval(this.finishTime.interval)
        //   }
        // }, 1000)
      }
    },
    getEndTime() {
      const duration = this.started ? this.totalRemainingTime : this.totalDuration + 3
      const secondWhenAroundToNextMinute = 45
      const endTime = new Date().getTime() + duration * 1000
      return endTime % 60000 > secondWhenAroundToNextMinute * 1000 ? endTime + 60000 - (endTime % 60000) : endTime
    },
    preventReload(event) {
      if (!this.started) return
      event.preventDefault()
      // Chrome requires returnValue to be set.
      event.returnValue = ''
    },
    selectWorkout(workout) {
      this.workouts.forEach((w) => (w.selected = w.id == workout.id))
      this.onAbsWorkoutSelectectUpdate()
    },
    playSoundLast3Sec() {
      this.stopInProgress()
      this.playLast3Sec()
    },
    pauseAbs() {
      this.paused = true
      this.stopAllIntervals()
      this.stopAllTimeouts()
      this.stopAllSounds()

      // this.finishTime.interval = setInterval(() => {
      //   this.finishTime.value = this.getEndTime()
      // }, 1000)
    },
    resumeAbs() {
      this.paused = false
      this.startTimer(this.timer)

      // clearInterval(this.finishTime.interval)
      // this.finishTime.interval = null
    },
    stopAbs() {
      this.stopAllIntervals()
      this.stopAllTimeouts()
      this.stopAllSounds()
      this.reloadData()
      this.$emit('showNavbar')
    },
    stopAllSounds() {
      this.stopInProgress()
      this.stopEnd()
      this.stopCountdown()
      this.stopDing()
      this.stopLast3Sec()
    },
    stopAllIntervals() {
      this.intervals.forEach((i) => clearInterval(i))
      this.intervals = []
      // if (this.finishTime.interval) clearInterval(this.finishTime.interval)
    },
    stopAllTimeouts() {
      this.timeouts.forEach((t) => clearTimeout(t))
      this.timeouts = []
    },
    start() {
      if (!this.selectedWorkout) {
        errorNotify('Veuillez sélectionner un exercice')
        return
      }
      if (!this.seriesNb) {
        errorNotify('Veuillez renseigner le nombre de séries')
        return
      }
      this.seriesNb = parseInt(this.seriesNb)
      this.preWorkoutTimer = 3
      this.playCountdown()
      this.intervals.push(
        setInterval(() => {
          this.preWorkoutTimer -= 1
          if (this.preWorkoutTimer < 0) {
            this.started = true
            this.$emit('hideNavbar')
            this.currentSeries = 1
            this.preWorkoutTimer = null
            clearInterval(this.intervals.pop())
            this.startSeries(true)
            return
          }
        }, 1000)
      )

      this.totalRemainingTime = this.totalDuration - 1

      this.finishTime.value = this.getEndTime(this.totalRemainingTime)
    },
    startSeries(isFirst = false) {
      this.step = 1
      this.startTimer(isFirst ? this.currentExercise.duration - 1 || 0 : this.currentExercise.duration || 0)
    },
    startTimer(timer) {
      this.timer = timer
      if (this.currentExercise.restAbs) {
        this.stopInProgress()
      }
      if (this.timer <= 3) {
        this.playSoundLast3Sec()
      } else if (!this.currentExercise.restAbs) {
        this.playInProgress()
      }
      this.intervals.push(
        setInterval(() => {
          this.timer--
          this.totalRemainingTime--
          if (this.timer === 3) {
            this.playSoundLast3Sec()
          }
          if (this.timer <= 0) {
            clearInterval(this.intervals.pop())
            this.stopLast3Sec()
            this.nextStep()
            return
          }
        }, 1000)
      )
    },
    startRestTime(timer) {
      this.stopInProgress()
      this.rest = true
      this.timer = timer
      if (this.timer <= 3) {
        this.playSoundLast3Sec()
      }
      this.intervals.push(
        setInterval(() => {
          this.timer--
          this.totalRemainingTime--
          if (this.timer === 3) {
            this.playSoundLast3Sec()
          }
          if (this.timer <= 0) {
            clearInterval(this.intervals.pop())
            this.stopLast3Sec()
            this.nextStep()
            return
          }
        }, 1000)
      )
    },
    nextStep() {
      if (this.step >= this.nbExercises) {
        if (this.currentSeries >= this.seriesNb) {
          this.finished = true
          this.playEnd()
          setTimeout(() => {
            this.timeouts.pop()
            this.stopAbs()
          }, 5000)
        } else {
          this.playDing()
          if (!this.rest) {
            this.startRestTime(this.selectedWorkout.restTime)
          } else {
            this.rest = false
            this.currentSeries += 1
            this.startSeries()
          }
        }
      } else {
        this.playDing()
        this.step += 1
        this.startTimer(this.currentExercise.duration || 0)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.pre-workout-timer {
  background-color: #000000c5;
  color: white;
}
.finished-display {
  background-color: #000000c5;
}
.next-exercise-space {
  height: 2rem;
}
</style>
