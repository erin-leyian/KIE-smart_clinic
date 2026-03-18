import Sidebar from "../components/Sidebar";
import Calendar from "react-calendar";
import { useState } from "react";

import "react-calendar/dist/Calendar.css";
import "../styles/calendar.css";

function CalendarPage(){

const [date,setDate] = useState(new Date());
const [name,setName] = useState("");
const [doctor,setDoctor] = useState("");
const [message,setMessage] = useState("");

const bookAppointment = () => {

if(!name || !doctor){
setMessage("Please fill all fields");
return;
}

// Save to local storage
const appointment = {
name,
doctor,
date: date.toDateString()
};

const existing = JSON.parse(localStorage.getItem("appointments")) || [];

existing.push(appointment);

localStorage.setItem("appointments", JSON.stringify(existing));

setMessage("Appointment booked successfully!");

setName("");
setDoctor("");

};

return(

<div className="dashboard">

<Sidebar/>

<div className="main">

<h1>Appointment Calendar</h1>

<Calendar
onChange={setDate}
value={date}
/>

<h3>Selected Date: {date.toDateString()}</h3>

<div className="booking-form">

<input
type="text"
placeholder="Patient Name"
value={name}
onChange={(e)=>setName(e.target.value)}
/>

<select
value={doctor}
onChange={(e)=>setDoctor(e.target.value)}
>
<option value="">Select Doctor</option>
<option>Heart Specialist</option>
<option>Pediatric</option>
<option>Gastrologist</option>
</select>

<button onClick={bookAppointment}>
Book Appointment
</button>

</div>

<p className="success">{message}</p>

</div>

</div>

);
}

export default CalendarPage;