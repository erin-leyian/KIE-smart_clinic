import { useNavigate } from "react-router-dom"
import "../styles/login.css"

function Register(){

const navigate = useNavigate()

const handleRegister = (e)=>{
e.preventDefault()
alert("Account created")
navigate("/")
}

return(

<div className="login-container">

<div className="login-left">

<h1>QueueCare</h1>

<p>Create your medical account</p>

</div>

<div className="login-right">

<h2>Create Account</h2>

<form onSubmit={handleRegister}>

<input type="text" placeholder="Full Name" required/>

<input type="email" placeholder="Email Address" required/>

<input type="password" placeholder="Password" required/>

<button>Create Account</button>

</form>

<p>
Already have an account? <a href="/">Login</a>
</p>

</div>

</div>

)

}

export default Register