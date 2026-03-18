import { useState } from "react"
import Sidebar from "../components/Sidebar"

function BookingDetails(){

const [name,setName] = useState("")
const [phone,setPhone] = useState("")
const [problem,setProblem] = useState("")

const submit = () => {

const appointment = {
name,
phone,
problem,
date: new Date().toLocaleDateString(),
status:"Booked"
}

const old = JSON.parse(localStorage.getItem("appointments")) || []

old.push(appointment)

localStorage.setItem("appointments", JSON.stringify(old))

alert("Appointment booked!")

}

return(

<div className="dashboard">

<Sidebar/>

<div className="main">

<h2>Confirm Appointment</h2>

<div className="confirm-card">

<p><b>Doctor:</b> Rugango Kevin</p>

<p><b>Date:</b> Selected Date</p>

<p><b>Time:</b> Selected Time</p>

</div>

<h3>Patient Details</h3>

<input
placeholder="Patient Name"
onChange={(e)=>setName(e.target.value)}
/>

<input
placeholder="Phone"
onChange={(e)=>setPhone(e.target.value)}
/>

<textarea
placeholder="Describe problem"
onChange={(e)=>setProblem(e.target.value)}
/>

<button onClick={submit}>
Confirm Appointment
</button>

</div>

</div>

)

}

export default BookingDetails