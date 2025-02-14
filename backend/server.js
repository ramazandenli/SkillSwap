import express from "express";
import pg from  "pg";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import env from "dotenv";

const app=express();
const port=4000;
const saltingRound=10;

env.config();

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());

const db=new pg.Client({

    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    database:process.env.DB_DATABASE,
    password:process.env.DB_PASSWORD,
    port:process.env.DB_PORT
 
 });
 
 db.connect();

app.get("/search/filter",async (req,res)=>{

  const {user_id,skill,filter}=req.query;


  if(filter==='Points'){

    const result=await db.query("select * from getSearchResultsByPoints($1,$2)",[user_id,skill]);
  
    res.json(result.rows);

  }
  else{

    const result=await db.query("select * from getSearchResultsByCount($1,$2)",[user_id,skill]);
   
    res.json(result.rows);
  }

  
});

app.get("/stats",async (req,res)=>{

  const result=await db.query("select * from stats");
  res.json(result.rows[0]);
})
app.get("/users",async (req,res)=>{
  
  const result=await db.query("select user_id from users where type!=$1",['admin']);
  res.json(result.rows)
})

app.get("/user/profile/:id",async(req,res)=>{
  
  const id=req.params.id;
  const result =  await db.query("select * from Users where user_id=$1",[id]);
  
  const storedDate = result.rows[0].birthdate;
  const localDate = new Date(storedDate);
  const date = new Date(localDate);
  const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  result.rows[0].birthdate=formattedDate;

  res.json(result.rows[0]);
  


});

app.get("/events/:id",async (req,res)=>{

  const result=await db.query("select * from get_events($1)",[req.params.id]);

  const events=result.rows;

  events.forEach(event => {
     
    var storedDate = event.start_date;
    var localDate = new Date(storedDate);
    var date = new Date(localDate);
    var formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    event.start_date=formattedDate;
    
    storedDate = event.end_date;
    localDate = new Date(storedDate);
    date = new Date(localDate);
    formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    event.end_date=formattedDate;

   
  });

  const exchanges=[];
  const teaches=[];

  for(var i=0;i<events.length;i++){

    if(events[i].type==='exchanges'){

      exchanges.push(events[i]);
    }
    else{

      teaches.push(events[i]);
    }
  }

  res.json({exchanges:exchanges,teaches:teaches});
});

app.post("/insert/skill",async (req,res)=>{

  const name=req.body.name;

  const result = await db.query("insert into skills(skill_name) values($1)",[name]);

  res.json(result);
})
app.post("/request",async (req,res)=>{

   const {user1_id,skill1_id,user2_id,skill2_id,start_date,end_date,status,type}=req.body;
    
   try {
    const result = await db.query("insert into collaborates_with(user1_id,skill1_id,user2_id,skill2_id,start_date,end_date,status,type) values($1,$2,$3,$4,$5,$6,$7,$8);",[user1_id,skill1_id,user2_id,skill2_id,start_date,end_date,status,type]);
     res.json(result);
   } catch (error) {

    res.json(error);
    
    
   }

})

app.post("/follow/filter",async (req,res)=>{

   const{follower,followed}=req.query;

   try {
    
    const result=await db.query("insert into follows values($1,$2);",[follower,followed]);

    res.json(result.data);
   } catch (error) {
    
    res.json("already followed");
   }


});
app.post("/messages",async (req,res)=>{

  const {from,to,message}=req.body
  
  const result= await db.query("insert into texts values($1,$2,$3,$4) returning *",[from,to,new Date(),message])
  
  res.json(result.rows);
})
app.get("/messages/filter",async(req,res)=>{

   const{user1,user2}=req.query;

   const result = await db.query("select * from texts where (from_id=$1 and to_id=$2) or (from_id=$3 and to_id=$4) order by date asc;",[user1,user2,user2,user1]);
   
   res.json(result.rows);

})
app.get("/user/contacts/:id",async (req,res)=>{
    
   const id=req.params.id;

   const result= await db.query("select * from get_contacted_users($1)",[id]);

   res.json(result.rows);


})

app.post("/add/skill/",async (req,res)=>{
     
  const {username,skill_id,type} =req.body;
 
  try {

    if(type==="has"){
      
      await db.query("insert into has values($1,$2)",[username,skill_id]);
  
    }
    else{
  
      await db.query("insert into needs values($1,$2)",[username,skill_id]);
    }
    
    res.json("adding skill successful");
    
  } catch (error) {
    
    res.json(error);
  }


});
 
app.get("/skills",async (req,res)=>{
    
 const result =  await db.query("select * from skills");
 
 const data=result.rows;

 res.json(data);


})
app.get("/user/:id",async (req,res)=>{

  const id=req.params.id;

 const result =  await db.query("select * from Users where user_id=$1",[id]);
 const hasSkills=await db.query("select * from get_user_skills($1)",[id]);
 const needSkills=await db.query("select * from get_user_skills_needs($1)",[id]);

 const userInfo={

  profile:result.rows[0],
  hasSkills:hasSkills.rows,
  needSkills:needSkills.rows

 }

 const date= userInfo.profile.birthdate
 const new_date = new Date(date);


   res.json(userInfo);
})

app.get("/user/followers/:id",async (req,res)=>{

  const id=req.params.id;
  const followers=await db.query("select * from get_followers($1)",[id]);

  
  res.json(followers.rows);
  

})

app.get("/user/followings/:id",async (req,res)=>{

  const id=req.params.id;
  const followings = await db.query("select * from get_followings($1)",[id]);

  res.json(followings.rows);

})

app.get("/user/has/:id",async (req,res)=>{

  const id=req.params.id;
  const hasSkills=await db.query("select * from get_user_skills($1)",[id]);

  res.json(hasSkills.rows);

})

app.get("/user/needs/:id",async (req,res)=>{

  const id=req.params.id;
  const needSkills=await db.query("select * from get_user_skills_needs($1)",[id]);
  
  res.json(needSkills.rows);

})

app.get("/count/:id",async (req,res)=>{

   const id=req.params.id;

   const object={

    followers_count:0,followings_count:0
   };
   
   try {
    const followers_count=await db.query("select count from follower_count where followed_id=$1",[id]);

    object.followers_count=followers_count.rows[0].count;
   } catch (error) {
     
    object.followers_count=0

   }
   
   try {

    const followings_count=await db.query("select count from following_count where follower_id=$1",[id]);

    object.followings_count=followings_count.rows[0].count;
   } catch (error) {

    object.followings_count=0;
    
   }


   res.json(object);
})


app.post("/signup",async (req,res)=>{

   const {username,password,name,surname,gender,date}=req.body;
   
    const point=0;

     bcrypt.hash(password,saltingRound,async (err,hash)=>{

      if(err){

   
      }
      else{
         
        
        try {
          const result=  await db.query("call insert_user($1,$2,$3,$4,$5,$6,$7,$8);",[username,name,surname,gender,date,point,hash,'user']);
          res.status(201).json({ message: 'User registered successfully'});
          
        } catch (error) {

          res.json({message:"inserting failed"});
          
        }
      }


    })

}
);

app.post("/login",async (req,res)=>{
   
  const {username,password}=req.body;

  try {

    const result= await db.query("select password,type from Users where user_id=$1",[username]);
   
    if(result.rows.length==0){

    res.json({message:"No such user",auth:false});
   
    }
  else{

    const type=result.rows[0].type;
    

    if(type==='user'){
     
      bcrypt.compare(password,result.rows[0].password,(err,result)=>{

        if(err){
          
          res.json({message:"Error comparing passwords",auth:false} );
     
        }
        else{
  
          if(result){
           
            res.status(200).json( {message:'Login successful',type:'user',auth:true});   
  
          }
          else {
            res.json({message:"Incorrect password",auth:false});
   
          }
        }
      })
      
    }
    else{

      if(password===result.rows[0].password){

        res.status(200).json( {message:'Logging in as admin',type:'admin',auth:true});  
      }
      else{

        res.json({message:"Incorrect password",auth:false});
      }
    }

    
  }
    
  } catch (error) {
    res.json(error);
  }

  


});

app.post("/events/accept/:id",async (req,res)=>{

  const result = await db.query("update collaborates_with set status='accepted' where event_id=$1",[req.params.id]);

  res.json(result);
})


app.delete("/events/reject/:id",async (req,res)=>{

  const result = await db.query("delete from collaborates_with where event_id=$1",[req.params.id]);

  res.json(result);


});


app.delete("/remove/follow/filter",async (req,res)=>{

   const {user,userToRemove,removeFrom}=req.query;

   try {
    
    if(removeFrom==="following"){

      await db.query("delete from follows where Follower_ID=$1 and Followed_ID=$2",[user,userToRemove]);
     }
     else{
        
     const result=  await db.query("delete from follows where Follower_ID=$1 and Followed_ID=$2",[userToRemove,user]);
  
     
     }
     
    
     res.json("removed successful");

   } catch (error) {
    
    res.json(error);
    
   }

  

   

})

app.delete("/remove/skills/filter",async (req,res)=>{

   const id=req.query.id;

   const result=await db.query("delete from skills where skill_id=$1",[id]);

   res.json(result);
})
app.delete("/remove/user/filter",async (req,res)=>{

  const id=req.query.id;

  const result=await db.query("delete from users where user_id=$1",[id]);
  res.json(result);
})
app.delete("/remove/skill/filter",async (req,res)=>{

  const {user,skillToRemove,removeFrom}=req.query;

  try {
   
   if(removeFrom==="has"){

     await db.query("delete from has where user_id=$1 and skill_id=$2",[user,skillToRemove]);
    }
    else{
       
    const result=  await db.query("delete from needs where user_id=$1 and skill_id=$2",[user,skillToRemove]);
 
   
    }
   
    res.json("removed successful");

  } catch (error) {
   
   res.json(error);
   console.log(error);
  }

 

  

})
app.listen(port,()=>{

    console.log("server listening on port "+port);
  
});
