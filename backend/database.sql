CREATE TYPE status AS ENUM ('waiting', 'accepted');
CREATE TYPE type AS ENUM ('exchanges', 'teaches');

create table Users(

   User_Id varchar(30) not null unique primary key,
   Name varchar(30) not null,
   Surname varchar(30) not null,
   Gender char not null,
   Birthdate date not null,
   Points int,
   Password varchar(64) not null,
   type varchar(5) not null default 'user'

);

create table Skills(

  Skill_ID serial not null unique primary key,
  Skill_Name varchar(120) not null

	
);

create table Follows(

  Follower_ID varchar(30) not null, 
  Followed_ID varchar(30) not null,
  primary key (follower_id,followed_id),
  Foreign Key(Follower_ID) references Users(User_Id) on delete cascade on update cascade,
  Foreign Key(Followed_ID) references Users(User_Id) on delete cascade on update cascade

	
);

create table Has(

  User_ID varchar(30) not null, 
  Skill_ID int not null,
  primary key(User_ID,Skill_ID),
  Foreign Key(User_ID) references Users(User_Id) on delete cascade on update cascade,
  Foreign Key(Skill_ID) references Skills(Skill_ID) on delete cascade on update cascade

	
);

create table Needs(

  User_ID varchar(30) not null, 
  Skill_ID int not null,
  primary key(User_ID,Skill_ID),
  Foreign Key(User_ID) references Users(User_Id) on delete cascade on update cascade,
  Foreign Key(Skill_ID) references Skills(Skill_ID) on delete cascade on update cascade

	
);

create table Texts(

  Text_ID serial not null primary key,
  From_ID varchar(30) not null,
  To_ID varchar(30) not null,
  Date timestamp without time zone not null default now(),
  Message text not null,
  Foreign Key(From_ID) references Users(User_Id) on delete cascade on update cascade,
  Foreign Key(To_ID) references Users(User_Id) on delete cascade on update cascade

);

/* Sohbet gecmisi hep "iki kisi arasindaki mesajlar, tarihe gore" seklinde
   okunuyor. Bu index olmadan Postgres her sorguda tum tabloyu tariyor. */
create index texts_conversation_idx on Texts(From_ID, To_ID, Date);


create table Collaborates_with(

	event_id serial not null primary key,
	User1_Id varchar(30) not null,
	Skill1_Id int not null,
	User2_Id varchar(30) not null,
	Skill2_Id int not null,
	Start_Date date not null,
	End_Date date not null,
	status status not null,
	type type not null,
	Foreign Key(User1_Id) references Users(User_Id) on delete cascade on update cascade,
    Foreign Key(Skill1_Id) references Skills(Skill_ID) on delete cascade on update cascade,
	Foreign Key(User2_Id) references Users(User_Id) on delete cascade on update cascade,
    Foreign Key(Skill2_Id) references Skills(Skill_ID) on delete cascade on update cascade

);


/* Bir etkinlik bittikten sonra taraflar birbirini degerlendirir.
   unique(Event_ID, Reviewer_ID) ayni etkinlige ikinci yorumu engelliyor,
   yani "tek yorum" kurali uygulamada degil veritabaninda tutuluyor. */
create table Reviews(

	Review_ID serial not null primary key,
	Event_ID int not null,
	Reviewer_ID varchar(30) not null,
	Reviewed_ID varchar(30) not null,
	Rating int not null check (Rating between 1 and 5),
	Comment text,
	Created_At timestamp without time zone not null default now(),
	unique(Event_ID, Reviewer_ID),
	check (Reviewer_ID <> Reviewed_ID),
	Foreign Key(Event_ID) references Collaborates_with(event_id) on delete cascade on update cascade,
	Foreign Key(Reviewer_ID) references Users(User_Id) on delete cascade on update cascade,
	Foreign Key(Reviewed_ID) references Users(User_Id) on delete cascade on update cascade

);


CREATE OR REPLACE PROCEDURE insert_user(
    user_id VARCHAR,
    name VARCHAR,
    surname VARCHAR,
    gender char,
    birthdate date,
	  points int,
	  password varchar,
	  type varchar
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO users
    VALUES (user_id,name,surname,gender,birthdate,points,password,type);
    

END;
$$;

create or replace function get_user_skills (
  id varchar
)
returns table (
  Skill_ID int,
	Skill_Name varchar(120)
)
language plpgsql
as $$
begin
	return query
	   SELECT s.Skill_ID , s.Skill_Name
    FROM Has h
    JOIN Skills s ON h.Skill_ID = s.Skill_ID
    WHERE h.User_ID = id;
end;
$$;


create or replace function get_user_skills_needs (
  id varchar
)
returns table (
  Skill_ID int,
	Skill_Name varchar(120)
)
language plpgsql
as $$
begin
	return query
	   SELECT s.Skill_ID , s.Skill_Name
    FROM Needs n
    JOIN Skills s ON n.Skill_ID = s.Skill_ID
    WHERE n.User_ID = id;
end;
$$;

create or replace function get_followers (
  id varchar
)
returns table (
	User_ID varchar(30)
)
language plpgsql
as $$
begin
	return query
	   SELECT f.Follower_ID
    FROM Follows f
    WHERE f.Followed_ID= id;
end;
$$;

create or replace function get_followings (
  id varchar
)
returns table (
	User_ID varchar(30)
)
language plpgsql
as $$
begin
	return query
	   SELECT f.Followed_ID
    FROM Follows f
    WHERE f.Follower_ID= id;
end;
$$;


create or replace function getSearchResultsByCount (
  id varchar,
  skill_id_ int 
)
returns table (
	User_ID varchar(30)
)
language plpgsql
as $$
begin
	return query
    select n.user_id
    from needs n
    where n.user_id in(select h.user_id
    from has h
    where h.skill_id=skill_id_) and n.skill_id in (select h.skill_id 
	                               from has h
	                               where h.user_id=id) and n.user_id!=id
    group by n.user_id
    order by count(n.user_id) desc;
end;
$$;


create or replace function getSearchResultsByPoints (
  id varchar,
  skill_id_ int 
)
returns table (
	User_ID varchar(30)
)
language plpgsql
as $$
begin
	return query
	select u.user_id from users u where u.user_id in(
	  select n.user_id
      from needs n
      where n.user_id in(select h.user_id
         from has h
         where h.skill_id=skill_id_) and n.skill_id in (select h.skill_id 
	                               from has h
	                               where h.user_id=id) and n.user_id!=id
	
    )
    order by u.points desc;
end;
$$;


create or replace function get_contacted_users (
  id varchar
)
returns table (
	User_ID varchar(30)
)
language plpgsql
as $$
begin
	return query
	  (SELECT t.from_id
    FROM texts t
    WHERE t.to_id= id)
     union 
	(SELECT t.to_id
    FROM texts t
    WHERE t.from_id= id);
	  
end;
$$;

create or replace function get_events (
  id varchar
)
returns table (
	event_id int,
	User1_Id varchar(30),
	Skill1_Id int ,
	User2_Id varchar(30),
	Skill2_Id int,
	Start_Date date,
	End_Date date,
	status status,
	type type
	
)
language plpgsql
as $$
begin
	return query
	   SELECT *
    FROM collaborates_with c
    WHERE c.user1_id=id or c.user2_id=id;
end;
$$;


/* Bir kullaniciya yazilmis tum yorumlar, yenisi ustte. */
create or replace function get_user_reviews (
  id varchar
)
returns table (
	review_id int,
	reviewer_id varchar(30),
	rating int,
	comment text,
	created_at timestamp
)
language plpgsql
as $$
begin
	return query
	   SELECT r.review_id, r.reviewer_id, r.rating, r.comment, r.created_at
    FROM Reviews r
    WHERE r.reviewed_id = id
    ORDER BY r.created_at DESC;
end;
$$;


/* Kullanicinin yorum yazabilecegi etkinlikler.
   Uc kosul birden saglanmali:
     1. etkinlik kabul edilmis olacak  (status = 'accepted')
     2. bitis tarihi gecmis olacak     (end_date < current_date)
     3. bu kullanici o etkinlige daha once yorum yazmamis olacak
   Karsi tarafin kim oldugu CASE ile bulunuyor, cunku kullanici
   etkinlikte user1 de olabilir user2 de. */
create or replace function get_pending_reviews (
  id varchar
)
returns table (
	event_id int,
	counterpart_id varchar(30),
	end_date date,
	type type
)
language plpgsql
as $$
begin
	return query
	   SELECT c.event_id,
	          CASE WHEN c.user1_id = id THEN c.user2_id ELSE c.user1_id END,
	          c.end_date,
	          c.type
    FROM Collaborates_with c
    WHERE (c.user1_id = id OR c.user2_id = id)
      AND c.status = 'accepted'
      AND c.end_date < current_date
      AND NOT EXISTS (
            SELECT 1 FROM Reviews r
            WHERE r.event_id = c.event_id AND r.reviewer_id = id
          )
    ORDER BY c.end_date DESC;
end;
$$;


/* Profilde gosterilen ortalama puan. round(...,2) ile
   4.6666 yerine 4.67 donuyor. */
create view user_rating as
select reviewed_id,
       round(avg(rating)::numeric, 2) as average_rating,
       count(*) as review_count
from Reviews
group by reviewed_id;


CREATE OR REPLACE FUNCTION update_points_on_accept()
RETURNS TRIGGER AS $$
BEGIN
    
    IF NEW.Status = 'accepted' AND OLD.Status IS DISTINCT FROM 'accepted' THEN
     
        UPDATE Users
        SET points = points + 10
        WHERE User_Id = NEW.User1_Id;

        
        UPDATE Users
        SET points = points + 10
        WHERE User_Id = NEW.User2_Id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_update_points_on_accept
AFTER UPDATE ON Collaborates_with
FOR EACH ROW
EXECUTE FUNCTION update_points_on_accept();



create view follower_count as
select followed_id,count(followed_id)
from follows
group by followed_id;



create view following_count as
select follower_id,count(follower_id)
from follows
group by follower_id;


CREATE VIEW stats AS
SELECT
    (SELECT COUNT(*)-1 FROM users) AS user_count,
    (SELECT COUNT(*) FROM skills) AS skill_count,
    (SELECT user_id FROM users WHERE user_id = (SELECT user_id FROM users group by user_id order by points desc limit 1)) AS user_has_most_point,
    (SELECT followed_id FROM follows GROUP BY followed_id ORDER BY COUNT(followed_id) DESC LIMIT 1) AS most_followed_user,
    (SELECT skill_name FROM skills WHERE skill_id = (SELECT skill_id FROM has GROUP BY skill_id ORDER BY COUNT(skill_id) DESC LIMIT 1)) AS most_owned_skill,
    (SELECT skill_name FROM skills WHERE skill_id = (SELECT skill_id FROM needs GROUP BY skill_id ORDER BY COUNT(skill_id) DESC LIMIT 1)) AS most_needed_skill,
    (SELECT COUNT(*) FROM reviews) AS review_count,
    (SELECT reviewed_id FROM user_rating ORDER BY average_rating DESC, review_count DESC LIMIT 1) AS best_rated_user;


insert into skills(skill_name) values
('Graphic Design'),
('Illustration'),
('Video editing'),
('Photography'),
('Writing'),
('Animation'),
('Music Production'),
('Voice Acting'),
('Playing Guitar'),
('Playing Piano'),
('Playing Violin'),
('Singing'),
('Songwriting'),
('Beat Making'),
('Speaking English'),
('Speaking Turkish'),
('Speaking Spanish'),
('Speaking German'),
('Speaking Chinese'),
('Speaking Russian'),
('Game Development'),
('UI/UX Design'),
('Web Development'),
('Data Analysis'),
('IT Troubleshooting'),
('Fishing'),
('Camping'),
('Car Maintenance'),
('Playing Football'),
('Playing Basketball');

/* inserting user who is admin */
/* password=admin123 -- Yonetici sifresi de normal kullanicilar gibi bcrypt ile
   hash'lenmis durumda. Uygulama giriste tek bir dogrulama yolu kullaniyor;
   duz metin karsilastirmasi diye ikinci bir yol yok. */
call insert_user('admin','admin','admin','M','2004-11-03',0,'$2b$10$mAYHF9wZ.XHZ7CV0u8I7Mu5ACag/Oz/awr6ux2uF21mOjPGdTdr16','admin');

/* inserting some users*/

/* password=123456789 */ call insert_user('ramazandenli','Ramazan','Denli','M','2004-11-03',0,'$2b$10$053IlpAzflXMJEiogoPNB.TdJ085KugeUWSEaclciHFzOU0VJpHsO','user'); 
/* password=12345678  */ call insert_user('alperendonmez','Alperen','Donmez','M','2001-11-08',0,'$2b$10$hmKyeqlF60W7ETtGNSDoK.BOzFhoTk3CbqyAuoChxNuaI5/BC08he','user');
/* password=42424242  */   call insert_user('bedirhanyenilmez','Bedirhan','Yenilmez','M','2004-09-27',0,'$2b$10$AUaDesYyjcTP77IenrAtJeCBE5Luc1RGTKtUF3A0IGy1/UkdBHCcm','user');
/* password=46464646  */ call insert_user('boranbereketli','Boran','Bereketli','M','2004-05-12',0,'$2b$10$9tX7Sb/zN3BranRacDsbSeIN4ym2ls8.KwPk/XoGniMqywcg5dDFi','user');


