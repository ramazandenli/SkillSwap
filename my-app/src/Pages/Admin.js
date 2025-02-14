import { useState, useEffect } from "react";
import axios from "axios";
import "../Style/Admin.css"

function Admin() {

  const [skills, setSkills] = useState([]);
  const [users, setUsers] = useState([]);
  const [isAdding, setAdding] = useState(false);
  const [isRemoving, setRemoving] = useState(false);
  const [isRemovingUser, setRemovingUser] = useState(false);
  const [newSkill, setNew] = useState("");
  const [skillToRemove, setRemove] = useState(0);
  const [userToRemove, setUser] = useState("");
  const [stats, setStats] = useState({});

  async function getSkills() {
    const result = await axios.get("http://localhost:4000/skills");
    setSkills(result.data);
  }

  async function getUsers() {
    const result = await axios.get("http://localhost:4000/users");
    setUsers(result.data);
  }

  async function getStats() {
    const result = await axios.get("http://localhost:4000/stats");
    setStats(result.data);
  }

  async function addSkill() {
    await axios.post("http://localhost:4000/insert/skill", { name: newSkill });
    getSkills();
    setNew("");
    setAdding(false);
  }

  async function removeSkill() {
    await axios.delete("http://localhost:4000/remove/skills/filter?id=" + skillToRemove);
    getSkills();
    setRemove(0);
    setRemoving(false);
  }

  async function removeUser() {
    await axios.delete("http://localhost:4000/remove/user/filter?id=" + userToRemove);
    getUsers();
    setUser("");
    setRemovingUser(false);
  }

  useEffect(() => {
    getSkills();
    getUsers();
    getStats();
  }, [])

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1>Skills:</h1>
        <div className="skills">
          {skills.map((skill) => <p key={skill.skill_id}>{skill.skill_name}</p>)}
        </div>
        {(!isAdding && !isRemoving) && <button onClick={() => setAdding(true)}>Add Skill</button>}
        {(!isAdding && !isRemoving) && <button onClick={() => setRemoving(true)}>Remove Skill</button>}
        {isAdding &&
          <form onSubmit={(event) => {
            event.preventDefault();
            addSkill()
          }}>
            <input type="text" value={newSkill} placeholder="new skill" onChange={(e) => setNew(e.target.value)} required />
            <div className="button-group">
              <button type="submit">Add</button>
              <button type="button" onClick={() => setAdding(false)}>Cancel</button>
            </div>
          </form>
        }
        {isRemoving &&
          <form>
            <select onChange={event => setRemove(event.target.value)} required>
              <option value="" disabled selected hidden>-- Select a skill --</option>
              {skills.map((skill) => <option key={skill.skill_id} value={skill.skill_id}>{skill.skill_name}</option>)}
            </select>
            <div className="button-group">
              <button type="button" onClick={() => { removeSkill() }}>Remove</button>
              <button type="button" onClick={() => setRemoving(false)}>Cancel</button>
            </div>
          </form>
        }

        <h1>Users:</h1>
        <div className="users">
          {users.map(user => <p key={user.user_id}>{user.user_id}</p>)}
        </div>
        {!isRemovingUser && <button onClick={() => setRemovingUser(true)}>Ban a user</button>}
        {isRemovingUser &&
          <form>
            <select onChange={event => setUser(event.target.value)} required>
              <option value="" disabled selected hidden>-- Select a user --</option>
              {users.map((user) => <option key={user.user_id} value={user.user_id}>{user.user_id}</option>)}
            </select>
            <div className="button-group">
              <button type="button" onClick={() => { removeUser() }}>Remove</button>
              <button type="button" onClick={() => setRemovingUser(false)}>Cancel</button>
            </div>
          </form>
        }

        <div className="stats">
          <h1>Stats</h1>
          <div className="stats-container">
            <div className="stat-item">
              <h3>User Count:</h3>
              <p>{stats.user_count}</p>
            </div>
            <div className="stat-item">
              <h3>Skill Count:</h3>
              <p>{stats.skill_count}</p>
            </div>
            <div className="stat-item">
              <h3>User with Most Points:</h3>
              <p>{stats.user_has_most_point}</p>
            </div>
            <div className="stat-item">
              <h3>Most Followed User:</h3>
              <p>{stats.most_followed_user}</p>
            </div>
            <div className="stat-item">
              <h3>Most Owned Skill:</h3>
              <p>{stats.most_owned_skill}</p>
            </div>
            <div className="stat-item">
              <h3>Most Needed Skill:</h3>
              <p>{stats.most_needed_skill}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
