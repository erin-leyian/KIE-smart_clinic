import Sidebar from "../components/Sidebar";

function QueueDashboard(){

return(

<div className="dashboard">

<Sidebar/>

<div className="main">

<h1>Patient Queue</h1>

<table>

<thead>
<tr>
<th>Token</th>
<th>Patient</th>
<th>Status</th>
</tr>
</thead>

<tbody>

<tr>
<td>1</td>
<td>Elin mutoni</td>
<td>Waiting</td>
</tr>

<tr>
<td>2</td>
<td>Sarah uwase</td>
<td>Waiting</td>
</tr>

</tbody>

</table>

</div>

</div>

);

}

export default QueueDashboard;