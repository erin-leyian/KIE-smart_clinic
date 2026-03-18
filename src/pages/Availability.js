import Sidebar from "../components/Sidebar"

function Availability(){

return(

<div className="dashboard">

<Sidebar/>

<div className="main">

<h2>My Availability</h2>

<input type="date"/>

<select>
<option>Online</option>
<option>Clinic 1</option>
<option>Clinic 2</option>
<option>Holiday</option>
</select>

<input type="time"/>

<button>Save Slot</button>

</div>

</div>

)

}

export default Availability