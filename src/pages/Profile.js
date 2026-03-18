import Sidebar from "../components/Sidebar"

function Profile(){

return(

<div className="dashboard">

<Sidebar/>

<div className="main">

<h2>Profile</h2>

<input placeholder="Full Name"/>
<input placeholder="Email"/>
<input placeholder="Phone"/>

<button>Save</button>

</div>

</div>

)

}

export default Profile