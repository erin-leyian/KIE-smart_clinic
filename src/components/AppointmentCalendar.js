import { useState } from "react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"

function AppointmentCalendar({onSelect}){

const [date,setDate] = useState(new Date())

function handleDate(d){
setDate(d)
onSelect(d)
}

return(

<div className="calendar-container">

<Calendar
onChange={handleDate}
value={date}
/>

</div>

)

}

export default AppointmentCalendar