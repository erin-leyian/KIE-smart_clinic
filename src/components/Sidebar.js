import { Link, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";

function Sidebar(){

const navigate = useNavigate();

const logout = () => {
navigate("/");
};

return(

<div className="sidebar">

<h2 className="logo">QueueCare</h2>

<ul>

<li><Link to="/dashboard">Dashboard</Link></li>

<li><Link to="/queue">Queue Dashboard</Link></li>

<li><Link to="/calendar">Calendar</Link></li>

<li><Link to="/profile">Profile</Link></li>

<li><Link to="/help">Help</Link></li>

<li><Link to="/appointments">Appointments</Link></li>

<li onClick={logout}>Logout</li>

</ul>

</div>

);
}

export default Sidebar;