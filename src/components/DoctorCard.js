import { useNavigate } from "react-router-dom"

function DoctorCard({name,specialty,experience,price,image}){

const navigate = useNavigate()

return(

<div className="doctor-card">

<img
src={image}
alt="doctor"
className="doctor-img"
/>

<h3>{name}</h3>

<p>{specialty}</p>

<p>{experience} experience</p>

<div className="rating">
⭐ ⭐ ⭐ ⭐
</div>

<p className="price">${price}</p>

<button
onClick={()=>navigate("/booking")}
>
Book Appointment
</button>

</div>

)

}

export default DoctorCard