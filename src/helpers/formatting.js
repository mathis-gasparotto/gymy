export default () => ({
  kebabCaseFormatting(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase()
  },
  camelCaseFormatting(str) {
    return str.replace(/-([a-z])/g, function (g) {
      return g[1].toUpperCase()
    })
  },
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  },
  capitalizeAll(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
  },
  dateTimeFormatFromBDD(date) {
    let d = new Date(date)
    return `${d.getFullYear()}/${d.getMonth() + 1 >= 10 ? d.getMonth() + 1 : '0' + (d.getMonth() + 1)}/${d.getDate() >= 10 ? d.getDate() : '0' + d.getDate()} ${d.getHours() >= 10 ? d.getHours() : '0' + d.getHours()}:${d.getMinutes() >= 10 ? d.getMinutes() : '0' + d.getMinutes()}`
  },
  dateFormatFromBDD(date) {
    let d = new Date(date)
    return `${d.getFullYear()}/${d.getMonth() + 1 >= 10 ? d.getMonth() + 1 : '0' + (d.getMonth() + 1)}/${d.getDate() >= 10 ? d.getDate() : '0' + d.getDate()}`
  },
  dateTimeToDisplay(date) {
    let d = new Date(date)
    return `${d.getDate() >= 10 ? d.getDate() : '0' + d.getDate()}/${d.getMonth() + 1 >= 10 ? d.getMonth() + 1 : '0' + (d.getMonth() + 1)}/${d.getFullYear()} à ${d.getHours() >= 10 ? d.getHours() : '0' + d.getHours()}h${d.getMinutes() >= 10 ? d.getMinutes() : '0' + d.getMinutes()}`
  },
  parseLocalDate(date) {
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-').map(Number)
      return new Date(year, month - 1, day)
    }
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
  },
  dateToDisplay(date) {
    const d = this.parseLocalDate(date)
    return `${d.getDate() >= 10 ? d.getDate() : '0' + d.getDate()}/${d.getMonth() + 1 >= 10 ? d.getMonth() + 1 : '0' + (d.getMonth() + 1)}/${d.getFullYear()}`
  },
  dateToDisplayMonthAndYear(date) {
    let d = new Date(date)
    return `${d.getMonth() + 1 >= 10 ? d.getMonth() + 1 : '0' + (d.getMonth() + 1)}/${d.getFullYear()}`
  },
  dateToDisplayMonthAndYearCompact(date) {
    let d = new Date(date)
    return `${d.getMonth() + 1 >= 10 ? d.getMonth() + 1 : '0' + (d.getMonth() + 1)}/${d.getFullYear().toString().slice(-2)}`
  },
  dateToDisplayMonth(date) {
    let d = new Date(date)
    return d.getMonth() + 1 >= 10 ? d.getMonth() + 1 : '0' + (d.getMonth() + 1)
  },
  dateToDisplayYear(date) {
    let d = new Date(date)
    return d.getFullYear()
  },
  dateToDisplayDay(date) {
    let d = new Date(date)
    return d.getDate() >= 10 ? d.getDate() : '0' + d.getDate()
  },
  dateToInput(date) {
    const d = this.parseLocalDate(date)
    return `${d.getFullYear()}-${d.getMonth() + 1 >= 10 ? d.getMonth() + 1 : '0' + (d.getMonth() + 1)}-${d.getDate() >= 10 ? d.getDate() : '0' + d.getDate()}`
  },
  dateTimeFormatToBDD(date) {
    return new Date(date)
  },
  maxStringLenght(str, max) {
    return str.length > max ? str.substring(0, max) + '...' : str
  },
  durationFormatFromString(duration) {
    const minutes = Number(duration.split(':')[0])
    const seconds = Number(duration.split(':')[1])
    return `${minutes > 9 ? minutes : '0' + minutes}:${seconds > 9 ? seconds : '0' + seconds}`
  },
  durationFromSeconds(duration) {
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes > 9 ? minutes : '0' + minutes}:${seconds > 9 ? seconds : '0' + seconds}`
  },
  timeToDisplay(date) {
    let d = new Date(date)
    return `${d.getHours() >= 10 ? d.getHours() : '0' + d.getHours()}h${d.getMinutes() >= 10 ? d.getMinutes() : '0' + d.getMinutes()}`
  },
  array_move(array, old_index, new_index) {
    const arr = [...array]
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1
      while (k--) {
        arr.push(undefined)
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0])
    return arr.filter((el) => !!el)
  },
  weekNumber(date) {
    const d = this.parseLocalDate(date)
    d.setDate(d.getDate() + 4 - (d.getDay() || 7))
    const yearStart = new Date(d.getFullYear(), 0, 1)
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  },
  weekString(date) {
    const d = this.parseLocalDate(date)
    d.setDate(d.getDate() + 4 - (d.getDay() || 7))
    const isoYear = d.getFullYear()
    const week = this.weekNumber(date)
    return `${isoYear}-W${week >= 10 ? week : '0' + week}`
  },
  firstDayOfWeek(weekNumber) {
    const [year, weekPart] = weekNumber.split('-')
    const week = parseInt(weekPart.replace('W', ''), 10)
    const yearNum = parseInt(year, 10)
    const jan4 = new Date(Date.UTC(yearNum, 0, 4))
    const day = jan4.getUTCDay() || 7
    const monday = new Date(Date.UTC(yearNum, 0, 4 - day + 1 + (week - 1) * 7))
    const month = monday.getUTCMonth() + 1
    const dayOfMonth = monday.getUTCDate()
    return `${monday.getUTCFullYear()}-${month >= 10 ? month : '0' + month}-${dayOfMonth >= 10 ? dayOfMonth : '0' + dayOfMonth}`
  }
})
