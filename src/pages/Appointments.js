import Sidebar from "../components/Sidebar"

function Appointments(){

const data =
JSON.parse(localStorage.getItem("appointments")) || []

return(

<div className="dashboard">

<Sidebar/>

<div className="main">

<h2>Appointments</h2>

<table>

<thead>
<tr>
<th>Patient</th>
<th>Date</th>
<th>Problem</th>
</tr>
</thead>

<tbody>

{data.map((a,i)=>(
<tr key={i}>
<td>{a.name}</td>
<td>{a.date}</td>
<td>{a.problem}</td>
</tr>
))}

</tbody>

</table>

</div>

</div>

)

}

export default Appointments