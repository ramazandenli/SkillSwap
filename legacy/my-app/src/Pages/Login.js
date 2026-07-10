import { useState} from "react";
import axios from "axios";
import Alert from 'react-bootstrap/Alert';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../components/AuthContext';


function Login(){
   
 
  const { login } = useAuth();
  const navigate=useNavigate();
  const [user,setUser]=useState({

   username:"",
   password:""

  });

  const [alertVariant,setVariant]=useState("success");
  const [alert,setAlert]=useState("Succesful login");
  const [isDisabled,setDisabled]=useState(true);

  function handleChange(event){

    const {name,value}=event.target;

    setUser((prevValue)=>{

        return {

            ...prevValue,
            [name]:value
        }
    })
  }

  async function handleSubmit(event){
   
    event.preventDefault();
   
   const result = await axios.post('http://localhost:4000/login',user);
   
   const alert=result.data.message;
   const type=result.data.type
   const auth=result.data.auth;
   setDisabled(false);
   setAlert(alert);
   if(auth){
     
    setVariant("success");
    login()
    if(type==='user'){
        
      setTimeout(()=>{

        navigate("/home/"+user.username);
      },750)

    }
    else{
       
      setTimeout(()=>{

        navigate("/admin/");
      },750)

    }


   }
   else{

    setVariant("danger");
   }

  }

  return (

    <>
    
    <div className="login_container">
    <div className="login">
     <form className="login_elements">
     
    <input onChange={handleChange} type="text" placeholder="Username" name="username" value={user.username}  required/>
    <input onChange={handleChange} type="password" placeholder="Password" name="password" value={user.password} required/>
    <button type="submit" onClick={handleSubmit}>Log in</button>
   
    {!isDisabled &&   <Alert  className={
                alertVariant === "success" ? "alert-success" : "alert-danger"
              } variant={alertVariant}>
                   {alert}
                  </Alert>
    }   
    </form>
    </div>
    </div>
    </>



  );

};

export default Login;


