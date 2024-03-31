export const DEFAULT_NUMBER_OF_SERIES = 4
export const DEFAULT_REST_TIME = '01:00'
export const USER_GUEST_UID = 'guest'
export const USER_GUEST = {
  uid: USER_GUEST_UID,
  defaultNumberOfSeries: DEFAULT_NUMBER_OF_SERIES,
  restTime: DEFAULT_REST_TIME,
  username: 'Invité'
}

export const DEFAULT_USERNAME = 'guest_' + new Date().getTime() + Math.floor(Math.random() * 100)
