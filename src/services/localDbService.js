import { LocalStorage } from 'quasar'

export const LocalDb = {
  set(key, value) {
    LocalStorage.set(key, value)
  },
  get(key) {
    return LocalStorage.getItem(key)
  },
  remove(key) {
    LocalStorage.remove(key)
  }
}
