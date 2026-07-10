
import {Link} from "react-router-dom";
import Button from "react-bootstrap/Button";
import "../Style/Auth.css";


function Auth(){


  return   (
    <>
    
    <div className="auth"> 
     
     <img src="/logo.png" alt="logo"></img>
     <div className="buttons">
     <Link to="/signup"><Button  variant="secondary">Sign up</Button></Link>
  
    <Link to="/login"><Button  variant="primary">Log in</Button></Link></div>
    
    </div>

   
    
    </>
    
  
  );

}

export default Auth;