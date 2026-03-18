import "../styles/login.css";
import { useNavigate } from "react-router-dom";

function Login(){

const navigate = useNavigate();

const handleLogin = (e)=>{
e.preventDefault();
navigate("/dashboard");
};

return(

<div className="login-container">

<div className="login-left">

<h1>QueueCare</h1>

<div className="feature">
<h3>Well qualified doctors</h3>
<p>Treat with utmost care</p>
</div>

<div className="feature bottom">
<h3>Book an appointment</h3>
<p>Call / text / video</p>
</div>

</div>

<div className="login-right">

<h2>Welcome back</h2>

<form onSubmit={handleLogin}>

<input type="email" placeholder="Email address" required/>

<input type="password" placeholder="Password" required/>

<button>Log in</button>

</form>

</div>

</div>

);
}

export default Login;