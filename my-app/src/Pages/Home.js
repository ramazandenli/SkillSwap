import { useEffect,useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../Style/home.css";
import UserResultSearch from "../components/UserResultSearch";
import Accordion from 'react-bootstrap/Accordion';
import { useAuth } from '../components/AuthContext';
import Button from 'react-bootstrap/Button';


function Home(){
  
  const {logout} =useAuth();
  const navigate=useNavigate();
  const params=useParams();
  var username=params.username;
  const [skills,setSkills]=useState([]);
  const [user, setUser] = useState({ user_id: "", name: "", surname: "", gender: "", birthdate: "", points: 0});
  const [followers,setFollowers]=useState([]);
  const [followings,setFollowings]=useState([]);
  const [hasSkills,setHas]=useState([]);
  const [needSkills,setNeeds]=useState([]);
  const [isAddingActive1,setAdding1]=useState(false);
  const [button1,setButton1]=useState(true);
  const [isAddingActive2,setAdding2]=useState(false);
  const [button2,setButton2]=useState(true);
  const [newSkill,setNewSkill]=useState(0);
  const [isCancelDisabled1,setCancel1]=useState(true);
  const [isCancelDisabled2,setCancel2]=useState(true);
  const [skillToSearch,setSearch]=useState(0);
  const [filter,setFilter]=useState("Points");
  const [isSearching,setSearching]=useState(false);
  const [searchResults,setResults]=useState([]);
  const [exchanges,setExchanges]=useState([]);
  const [teaches,setTeaches]=useState([]);
  const [counts,setCounts]=useState({});

  async function getUser(){
       
    try {
  
      await getHas();
      await getNeeds();
      const result2 = await axios.get("http://localhost:4000/skills");
     
      const skills=result2.data;
  
      setSkills(skills);
  
    } catch (error) {
      console.error("Error fetching user data:", error);
    }

  }

  async function getProfile(){

    const result= await axios.get("http://localhost:4000/user/profile/"+username);
    
    setUser(result.data);

    const counts=await axios.get("http://localhost:4000/count/"+username);
    
    setCounts(counts.data);



  }
 
  async function getHas(){

    const result= await axios.get("http://localhost:4000/user/has/"+username);
    setHas(result.data);
  }

  async function getNeeds(){

    const result= await axios.get("http://localhost:4000/user/needs/"+username);
    setNeeds(result.data);
  }
  async function getFollowings(){
    
    
    const result= await axios.get("http://localhost:4000/user/followings/"+username);
    setFollowings(result.data);

  }

  async function getFollowers(){
     
    const result= await axios.get("http://localhost:4000/user/followers/"+username);
    setFollowers(result.data);

  }

  async function getEvents(){

    const result= await axios.get("http://localhost:4000/events/"+username);
    
    setTeaches(result.data.teaches);
    setExchanges(result.data.exchanges);

  }
  async function removeFollower(usernameToRemove,type){
     
    await axios.delete("http://localhost:4000/remove/follow/filter?user="+username+"&userToRemove="+usernameToRemove+"&removeFrom="+type);

     if(type==='following'){

      getFollowings();
     }
     else{
       
      getFollowers();

     }
 

  }
  async function removeSkill(skill,type){
     
    await axios.delete("http://localhost:4000/remove/skill/filter?user="+username+"&skillToRemove="+skill+"&removeFrom="+type);

     if(type==="has"){

      getHas();
     }
     else{
       
      getNeeds();

     }
 

  }

  async function addSkill(type){
    
    
    
    console.log(newSkill);
        
     await axios.post("http://localhost:4000/add/skill",{

        username:username,
        skill_id:newSkill,
        type:type

      })

      if(type==="has"){
        
        const result= await axios.get("http://localhost:4000/user/has/"+username);
        setHas(result.data);

      }
      else{
         
        const result= await axios.get("http://localhost:4000/user/needs/"+username);
        setNeeds(result.data);

      }

      setNewSkill(0);
    
  }

  
  async function searchSkill(skillToSearch,filterToSearch) {

    const body={

       user_id:username,
       skill:skillToSearch,
       filter:filterToSearch
      
    }

  

    const result = await axios.get(
      `http://localhost:4000/search/filter?user_id=${encodeURIComponent(username)}&skill=${encodeURIComponent(skillToSearch)}&filter=${encodeURIComponent(filterToSearch)}`
    );    
   
   
    setResults(result.data);
   
    
  }

  useEffect(()=>{


    getUser();

  },[]);

  return (

    <>
     <div className="grid">
     
      <div className="profile grid-elements">
      <Accordion >
      <Accordion.Item eventKey="0" onClick={()=>{

        getProfile();
      }}>
        <Accordion.Header>Profile</Accordion.Header>
        <Accordion.Body>
        <div className="user-info">
              <p>Username: {user.user_id}</p>
              <p>Name: {user.name}</p>
              <p>Surname: {user.surname}</p>
              <p>Gender: {user.gender}</p>
              <p>BirthDate: {user.birthdate}</p>
              <p>Points: {user.points}</p>
              <div className="count"><p className="number">{counts.followers_count}</p><p>Followers</p></div>
              <div className="count"><p className="number">{counts.followings_count}</p><p>Followings</p></div>

    </div>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
    

    <div className="skills">
    <Accordion >
      <Accordion.Item eventKey="0">
        <Accordion.Header>Has</Accordion.Header>
        <Accordion.Body>
        <div className="has">

{hasSkills.map((skill)=>{

return  <div key={skill.skill_id} className="skill"><><p>{skill.skill_name}</p><button onClick={()=>{

  removeSkill(skill.skill_id,"has");
}}>remove</button></></div>;
})}

{button1 && <button onClick={()=>{

 setAdding1(true);
 setButton1(false);
 setCancel1(false);
}}>New</button> }  
{isAddingActive1 && 

<>
<form>
<select onChange={event=>setNewSkill(event.target.value)} required>
<option value="" disabled selected hidden>-- Select a skill --</option>
  {skills.map((skill)=>{

      
     if(hasSkills.find(hasSkill=>hasSkill.skill_name===skill.skill_name) || needSkills.find(needSkill=>needSkill.skill_name===skill.skill_name)){
      
      return null;
     }
     else{

      return <option key={skill.skill_id} value={skill.skill_id}>{skill.skill_name}</option>;
     }
  })}
</select>
<button type="button" onClick={()=>{

  addSkill("has");
  setAdding1(false);
  setButton1(true);
  
}}>Add</button>
{!isCancelDisabled1 && <button onClick={()=>{

  setAdding1(false);
  setButton1(true);
  setCancel1(true);
}}>Cancel</button>}
</form></>

}

</div>
        </Accordion.Body>
      </Accordion.Item>
      </Accordion>
      <Accordion >
      <Accordion.Item eventKey="0">
        <Accordion.Header>Needs</Accordion.Header>
        <Accordion.Body>
        <div className="need">


{needSkills.map((skill)=>{

return  <div key={skill.skill_id} className="skill"><><p>{skill.skill_name}</p><button onClick={() => {

  removeSkill(skill.skill_id, "needs");
} }>remove</button></></div>;
})}

{button2 && <button onClick={()=>{

setAdding2(true);
setButton2(false);
setCancel2(false);
}}>New</button> }  
{isAddingActive2 && 

  <>
  <form>
  <select onChange={event=>setNewSkill(event.target.value)}  required>
  <option value="" disabled selected hidden>-- Select a skill --</option>
  {skills.map((skill)=>{

      
     if(needSkills.find(needSkill=>needSkill.skill_name===skill.skill_name) || hasSkills.find(hasSkill=>hasSkill.skill_name===skill.skill_name)){
      
      return null;
     }
     else{

      return <option key={skill.skill_id} value={skill.skill_id}>{skill.skill_name}</option>;
     }
  })}
</select>
<button type="button" onClick={()=>{

addSkill("needs");
setAdding2(false);
setButton2(true);


}}>Add</button>
{!isCancelDisabled2 && <button onClick={()=>{

    setAdding2(false);
    setButton2(true);
    setCancel2(true);
}}>Cancel</button>}

</form></>

}

</div>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
      </div>

      <div className="follow">

      <Accordion >
      <Accordion.Item eventKey="0" onClick={()=>{

        getFollowings();
      }}>
        <Accordion.Header>Followings</Accordion.Header>
        <Accordion.Body>
        <div className="followings">
        {followings.map((userf)=>

         <div key={userf.user_id} className="follow-user"><><p>{userf.user_id}</p><button onClick={()=>{

          removeFollower(userf.user_id,"following");
         }}>remove</button></></div>

       )}

      </div>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1" onClick={()=>{

        getFollowers();
       }}  >
        <Accordion.Header>Followers</Accordion.Header>
        <Accordion.Body>
        <div className="followers">
        {followers.map(userf=>
        
        <div key={userf.user_id} className="follow-user"><><p>{userf.user_id}</p><button onClick={()=>{

          removeFollower(userf.user_id,"follower");
         }}>remove</button></></div>


        )}

      </div>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
     
      </div>
      <Accordion>
      <Accordion.Item eventKey="0" onClick={()=>{
         
         getEvents();
           
      }}>
        <Accordion.Header>Events</Accordion.Header>
        <Accordion.Body>
        <div className="events">
    <p className="section-header">Exchanges:</p>

    <hr className="section-divider"></hr>
    {exchanges && exchanges.map(exchange => {
        const skill1 = skills.find(skill => skill.skill_id === exchange.skill1_id);
        const skill2 = skills.find(skill => skill.skill_id === exchange.skill2_id);

        return (
            <div key={exchange.event_id} className="event-item">
                {exchange.user1_id === username ? (
                    <>
                        <p className="event-header">Exchange with: {exchange.user2_id}</p>
                        <p className="skill-info">Skill you will get: {skill2 ? skill2.skill_name : "Unknown Skill"}</p>
                        <p className="skill-info">Skill you will give: {skill1 ? skill1.skill_name : "Unknown Skill"}</p>
                        <p className="date-info">Start Date: {exchange.start_date}</p>
                        <p className="date-info">End Date: {exchange.end_date}</p>
                        <p className="status-info">Status: {exchange.status === 'waiting' ? "Waiting" : "Active Event"}</p>
                    </>
                ) : (
                    <>
                        <p className="event-header">Exchange with: {exchange.user1_id}</p>
                        <p className="skill-info">Skill you will get: {skill1 ? skill1.skill_name : "Unknown Skill"}</p>
                        <p className="skill-info">Skill you will give: {skill2 ? skill2.skill_name : "Unknown Skill"}</p>
                        <p className="date-info">Start Date: {exchange.start_date}</p>
                        <p className="date-info">End Date: {exchange.end_date}</p>
                        <p className="status-info">Status: {exchange.status === 'waiting' ? "Waiting" : "Active Event"}</p>
                    </>
                )}

                {exchange.status === 'waiting' && exchange.user2_id === username && (
                    <>
                        <button className="accept-button" onClick={async () => {
                            await axios.post("http://localhost:4000/events/accept/" + exchange.event_id);
                            getEvents();
                        }}>Accept</button>
                        <button className="reject-button" onClick={async () => {
                            await axios.delete("http://localhost:4000/events/reject/" + exchange.event_id);
                            getEvents();
                        }}>Reject</button>
                    </>
                )}
            </div>
        );
    })}

    <p className="section-header">Teaches:</p>

    <hr className="section-divider"></hr>

    {teaches && teaches.map(teach => {
        const skill1 = skills.find(skill => skill.skill_id === teach.skill1_id);
        const skill2 = skills.find(skill => skill.skill_id === teach.skill2_id);

        return (
            <div key={teach.event_id} className="event-item">
                {teach.user1_id === username ? (
                    <>
                        <p className="event-header">Teach to: {teach.user2_id}</p>
                        <p className="skill-info">Skill you will get: {skill2 ? skill2.skill_name : "Unknown Skill"}</p>
                        <p className="skill-info">Skill you will give: {skill1 ? skill1.skill_name : "Unknown Skill"}</p>
                        <p className="date-info">Start Date: {teach.start_date}</p>
                        <p className="date-info">End Date: {teach.end_date}</p>
                        <p className="status-info">Status: {teach.status === 'waiting' ? "Waiting" : "Active Event"}</p>
                    </>
                ) : (
                    <>
                        <p className="event-header">Teach to: {teach.user1_id}</p>
                        <p className="skill-info">Skill you will get: {skill1 ? skill1.skill_name : "Unknown Skill"}</p>
                        <p className="skill-info">Skill you will give: {skill2 ? skill2.skill_name : "Unknown Skill"}</p>
                        <p className="date-info">Start Date: {teach.start_date}</p>
                        <p className="date-info">End Date: {teach.end_date}</p>
                        <p className="status-info">Status: {teach.status === 'waiting' ? "Waiting" : "Active Event"}</p>
                    </>
                )}

                {teach.status === 'waiting' && teach.user2_id === username && (
                    <>
                        <button className="accept-button" onClick={async () => {
                            await axios.post("http://localhost:4000/events/accept/" + teach.event_id);
                            getEvents();
                        }}>Accept</button>
                        <button className="reject-button" onClick={async () => {
                            await axios.delete("http://localhost:4000/events/reject/" + teach.event_id);
                            getEvents();
                        }}>Reject</button>
                    </>
                )}
            </div>
        );
    })}
</div>

        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
    <Accordion>
      <Accordion.Item eventKey="0" onClick={()=>{

        navigate("/messages/"+username);
      }}>
        <Accordion.Header>Messages</Accordion.Header>
      </Accordion.Item>
    </Accordion>
    
    <Button onClick={()=>{

      logout();
    }} variant="danger" className="logout">Logout</Button>

    
      </div>
      <div className="search grid-elements">

      
       {!isSearching && <input type="text" placeholder="search" onClick={()=>setSearching(true)}></input>} 
        
        {isSearching && <><form><label>

            Search by:

            <select value={filter} onChange={(e) => setFilter(e.target.value)} required>

              <option>Points</option>
              <option>Count</option>

            </select>

          </label><label>

              Skill:

              <select onChange={(e) => {

                setSearch(e.target.value);
              } } required>
                <option value="" disabled selected hidden>-- Select a skill --</option>

                {skills.map(skill => <option value={skill.skill_id} key={skill.skill_id}>{skill.skill_name}</option>

                )}

              </select>

            </label>
            <button type="button" onClick={() => {

              console.log(skillToSearch+" "+filter)
              searchSkill(skillToSearch, filter);
              setSearching(false);
 
            } }>Search</button>
          </form></> 
        }
          <div className="search_results"> 
                           
              {searchResults.map((result,index)=>
                
                <UserResultSearch skillToSearch={skillToSearch} loggedUser={username}  key={result.user_id || index} username={result.user_id} />

              )}

          </div>    

      </div>
      
      </div>
    </>

  );

}

export default Home;

