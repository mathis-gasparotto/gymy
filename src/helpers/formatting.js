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
  dateToDisplay(date) {
    let d = new Date(date)
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
    let d = new Date(date)
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
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + 4 - (d.getDay() || 7))
    const yearStart = new Date(d.getFullYear(), 0, 1)
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  },
  weekString(date) {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + 4 - (d.getDay() || 7))
    const isoYear = d.getFullYear()
    const week = this.weekNumber(date)
    return `${isoYear}-W${week >= 10 ? week : '0' + week}`
  },
  firstDayOfWeek(weekNumber) {
    const [year, weekPart] = weekNumber.split('-')
    const week = parseInt(weekPart.replace('W', ''), 10)
    const yearNum = parseInt(year, 10)
    const jan4 = new Date(yearNum, 0, 4)
    const day = jan4.getDay() || 7
    const mondayOfWeek1 = new Date(yearNum, 0, 4 - day + 1)
    const monday = new Date(mondayOfWeek1)
    monday.setDate(mondayOfWeek1.getDate() + (week - 1) * 7)
    return this.dateToInput(monday)
  }
})
