import Sidebar from "../components/Sidebar"

function PatientRecords(){

return(

<div className="dashboard">

<Sidebar/>

<div className="main">

<h2>Patient Records</h2>

<table>

<thead>
<tr>
<th>Patient</th>
<th>Date</th>
<th>Diagnosis</th>
</tr>
</thead>

<tbody>

<tr>
<td>ELIN Umutoni</td>
<td>10 Mar</td>
<td>Fever</td>
</tr>

</tbody>

</table>

</div>

</div>

)

}

export default PatientRecords