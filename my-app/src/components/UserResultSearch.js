import axios from "axios";
import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import ModalEvent from "./ModalEvent";
import "../Style/UserResultSearch.css"

function UserResultSearch(props){
   
  const navigate=useNavigate();
  const user_id=props.username;
  
  const [userInfo,setInfo]=useState({});
  const [hasSkills,setHas]=useState([]);
  const [needSkills,setNeed]=useState([]);


  async function getUserData(){
      
    const result = await axios.get("http://localhost:4000/user/"+user_id);
    const data=result.data;

    setInfo(data.profile);
    setHas(data.hasSkills);
    setNeed(data.needSkills);

  }

  useEffect(()=>{

    getUserData();
  },[user_id])
  
  async function follow(follower,followed){

    await axios.post("http://localhost:4000/follow/filter?follower="+follower+"&followed="+followed);

  }
  return <div className="result">
    
    <div className="result_top">
    
    <p className="result_username">{userInfo.user_id}</p>
    <button className="result_follow_button" onClick={()=>{

      follow(props.loggedUser,user_id);
    }}>Follow</button>
    <button onClick={()=>{
     
     navigate("/messages/"+props.loggedUser+"/"+user_id);

    }}>Message</button>
    
    </div>
    

    <div className="has">

    <p>Has:</p>
    {hasSkills.map((skill)=>{

       return  <p key={skill.skill_id}>{skill.skill_name}</p>;
     })}

    </div>
    <div className="needs">

    <p>Needs:</p>
     {needSkills.map((skill)=>{

       return  <p key={skill.skill_id}>{skill.skill_name}</p>;
     })}
    </div>
    <p className="points">Points : {userInfo.points}</p>
    <ModalEvent type="exchanges"  skillToSearch={props.skillToSearch} eventUser={user_id} need={needSkills} loggedUser={props.loggedUser}/>
    <ModalEvent type="teaches"  skillToSearch={props.skillToSearch} eventUser={user_id} need={needSkills} loggedUser={props.loggedUser}/>

  </div>;


};

export default UserResultSearch;