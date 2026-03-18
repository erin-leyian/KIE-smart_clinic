import { useState } from "react"
import Sidebar from "../components/Sidebar"

function Booking(){

const [date,setDate] = useState("")
const [time,setTime] = useState("")

const times = [
"10:30 AM",
"11:30 AM",
"2:30 PM",
"3:00 PM"
]

return(

<div className="dashboard">

<Sidebar/>

<div className="main">

<h2>Select Appointment</h2>

<input
type="date"
onChange={(e)=>setDate(e.target.value)}
/>

<h3>Available Time</h3>

<div className="times">

{times.map((t)=>(
<button
key={t}
onClick={()=>setTime(t)}
>
{t}
</button>
))}

</div>

{/* SHOW SELECTED BOOKING */}
{date && time && (
<div className="booking-summary">
<p><strong>Date:</strong> {date}</p>
<p><strong>Time:</strong> {time}</p>
</div>
)}

<a href="/booking-details">
<button>Next</button>
</a>

</div>

</div>

)

}

export default Booking