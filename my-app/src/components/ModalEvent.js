import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import axios from "axios";

function ModalEvent(props) {
  const [show, setShow] = useState(false);
  const [eventSkills,setSkills]=useState([]);
  const handleClose = () => setShow(false);
  const handleShow = () => {
     
    setShow(true);
    getSkills();
  } 
    
  const [selectedSkills,setSelected]=useState(0);
  const [startDate,setStart]=useState("");
  const [endDate,setEnd]=useState("");

  async function getSkills(){
     
    console.log(props.loggedUser);
    const result= await axios.get("http://localhost:4000/user/has/"+props.loggedUser);
    const has=result.data;
    const events=[];
    const need=props.need;

    for(var i=0;i<has.length;i++){
      
      if(need.find((skill)=>skill.skill_id===has[i].skill_id)){


        events.push(has[i]);
      }
      else{

      }
    }
    
    setSkills(events);

  }

  async function makeRequest(){
    
    const result = await axios.post("http://localhost:4000/request",{

      user1_id:props.loggedUser,
      skill1_id:selectedSkills,
      user2_id:props.eventUser,
      skill2_id:props.skillToSearch,
      start_date:startDate,
      end_date:endDate,
      status:'waiting',
      type:props.type
    })
   
 

    setShow(false);
  }

  return (
    <>

      {props.type==='exchanges' ? <Button variant="primary" onClick={handleShow}>
        Exchange
      </Button> :       <Button variant="primary" onClick={handleShow}>
        Teach
      </Button>}

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          {props.type==='exchanges' ? <Modal.Title>Exchange skill</Modal.Title> : <Modal.Title>Teach skill</Modal.Title> }    
        </Modal.Header>
        <Modal.Body>
          <Form>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
          {props.type==='exchanges' ? <Form.Label>Skill to exchange</Form.Label> : <Form.Label>Skill to teach</Form.Label> }    

          
          <Form.Select onChange={(e) => {

          setSelected(e.target.value);
         } } required aria-label="Default select example">
          <option value="" disabled selected hidden>-- Select a skill --</option>
          {eventSkills.map((skill)=><option key={skill.skill_id} value={skill.skill_id}>{skill.skill_name}</option>)}
    </Form.Select>
          </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Start Date</Form.Label>
              <input  type="date" value={startDate} onChange={e=>setStart(e.target.value)} required></input>
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>End Date</Form.Label>
              <input type="date" value={endDate} onChange={e=>setEnd(e.target.value)} required></input>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={makeRequest}>
            Send Request
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalEvent;