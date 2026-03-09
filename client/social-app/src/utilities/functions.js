export const formattedDate = (fulldate) => {
    const date = new Date(fulldate)
    const day = date.getDate()
    const month = date.getMonth() + 1 //Sumamos 1 porque los meses van del 0 al 11
    const year = date.getFullYear()

    const formattedDay = day < 10 ? `0${day}` : day
    const formattedMonth = month < 10 ? `0${month}` : month

    return `${formattedDay}/${formattedMonth}/${year}`
}