import { useEffect,useState } from "react";
import { useParams,useNavigate} from "react-router-dom";
import axios from "axios";
import "../Style/message.css"


function Messages(){

  const navigate=useNavigate();
  const params=useParams();
  const username=params.username;
  const user=params.user;
  const [contacts,setContacts]=useState([]);
  const [messages,setMessages]=useState([]);
  const [newMessage,setNew]=useState("");
  const [toUser,setTo]=useState("");


  async function getContacts() {
    const result = await axios.get("http://localhost:4000/user/contacts/" + username);

    setContacts(result.data);
  
    setContacts((prevContacts) => {

      
      if (user) {
        const newContact = { user_id: user };
        if (!prevContacts.find((contact) => contact.user_id === user)) {
          return [newContact, ...prevContacts];
        }
      }
      return [...prevContacts];
    });

    if(user){

      setTo(user);
      await getMessages(username,user);
    }
  }
  async function getMessages(user1,user2){


    const result=await axios.get("http://localhost:4000/messages/filter?user1="+user1+"&user2="+user2);

    setMessages(result.data);
  }

  async function sendMessage(from,to,message){

   const result= await axios.post("http://localhost:4000/messages",{

    from:from,to:to,message:message
   })

   setMessages((prevValue)=>{

    return [...prevValue,result.data[0]];
   })

  }
   useEffect(()=>{
    
    getContacts()
    

  },[]);
  return (<>

    <div className="message-grid">

    <div className="contacts">
     
     {contacts.map(contact=><p key={contact.user_id} onClick={()=>{
        
         getMessages(username,contact.user_id)
         setTo(contact.user_id)
     }} className={toUser === contact.user_id ? "selected-contact" : ""}>{contact.user_id}</p>)}
    </div>

    <div className="message-area">
  
  <div className="messages">

  {messages.map((message,index)=> <div key={index} className={message.from_id===username ? "sent" : "received"}><p>{message.message}</p></div>)}

  </div>

  <div className="input-message">
  <input value={newMessage} type="text" onChange={(e)=>setNew(e.target.value)} required></input>
  <button onClick={()=>{

    sendMessage(username,toUser,newMessage)
    setNew("");
  }}>Send</button>

  </div>
      </div>

    </div>

  </>);

}

export default Messages;

