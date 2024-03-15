export default () => ({
  kebabCaseFormatting(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase()
  },
  camelCaseFormatting(str) {
    return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase() })
  },
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  },
  capitalizeAll(str) {
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase() })
  },
  dateTimeFormatFromBDD(date) {
    let d = new Date(date)
    return `${d.getFullYear()}/${(d.getMonth() + 1) >= 10 ? (d.getMonth() + 1) : '0' + (d.getMonth() + 1)}/${d.getDate() >= 10 ? d.getDate() : '0' + d.getDate()} ${d.getHours() >= 10 ? d.getHours() : '0' + d.getHours()}:${d.getMinutes() >= 10 ? d.getMinutes() : '0' + d.getMinutes()}`
  },
  dateFormatFromBDD(date) {
    let d = new Date(date)
    return `${d.getFullYear()}/${(d.getMonth() + 1) >= 10 ? (d.getMonth() + 1) : '0' + (d.getMonth() + 1)}/${d.getDate() >= 10 ? d.getDate() : '0' + d.getDate()}`
  },
  dateTimeToDisplay(date) {
    let d = new Date(date)
    return `${d.getDate() >= 10 ? d.getDate() : '0' + d.getDate()}/${(d.getMonth() + 1) >= 10 ? (d.getMonth() + 1) : '0' + (d.getMonth() + 1)}/${d.getFullYear()} à ${d.getHours() >= 10 ? d.getHours() : '0' + d.getHours()}h${d.getMinutes() >= 10 ? d.getMinutes() : '0' + d.getMinutes()}`
  },
  dateToDisplay(date) {
    let d = new Date(date)
    return `${d.getDate() >= 10 ? d.getDate() : '0' + d.getDate()}/${(d.getMonth() + 1) >= 10 ? (d.getMonth() + 1) : '0' + (d.getMonth() + 1)}/${d.getFullYear()}`
  },
  dateToInput(date) {
    let d = new Date(date)
    return `${d.getFullYear()}-${(d.getMonth() + 1) >= 10 ? (d.getMonth() + 1) : '0' + (d.getMonth() + 1)}-${d.getDate() >= 10 ? d.getDate() : '0' + d.getDate()}`
  },
  dateTimeFormatToBDD(date) {
    return new Date(date)
  },
  maxStringLenght(str, max) {
    return str.length > max ? str.substring(0, max) + '...' : str
  }
})
