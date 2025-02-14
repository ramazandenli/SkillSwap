import React from "react";

function Follow(props){



 return (

   <><p></p><button onClick={()=>{

      props.onClick(props.id,props.type);
   }} >remove</button></>
   );
 
};

export default Follow();

