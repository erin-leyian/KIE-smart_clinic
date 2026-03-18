import Sidebar from "../components/Sidebar"

function ConsultationHistory(){

return(

<div className="dashboard">

<Sidebar/>

<div className="main">

<h2>Consultation History</h2>

<table>

<thead>

<tr>
<th>Date</th>
<th>Doctor</th>
<th>Specialty</th>
<th>Status</th>
</tr>

</thead>

<tbody>

<tr>
<td>12 June</td>
<td>Rugango Kevin</td>
<td>Heart Specialist</td>
<td>Completed</td>
</tr>

<tr>
<td>14 June</td>
<td>Nicolas Ishimwe</td>
<td>Gastrologist</td>
<td>Completed</td>
</tr>

</tbody>

</table>

</div>

</div>

)

}

export default ConsultationHistory