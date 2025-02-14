import {  useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../components/AuthContext';

function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
 

  const [user, setUser] = useState({
    username: "",
    password: "",
    name: "",
    surname: "",
    gender: "F",
    date: ""
  });

  const [isUserTaken, setTaken] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setUser((prevValue) => ({
      ...prevValue,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault(); 
    const result = await axios.post('http://localhost:4000/signup', user);

    if (result.data.message === 'User registered successfully') {
      login(user.username);
      navigate("/home/" + user.username);
    } else {
      setTaken(true);
    }
  }


  return (
    <div className="signup">
      <form className="signup_form" onSubmit={handleSubmit}>
        <input
          onChange={handleChange}
          name="username"
          value={user.username}
          type="text"
          placeholder="Username"
          minLength={6}
          maxLength={30}
          required
        />
        <input
          onChange={handleChange}
          name="password"
          value={user.password}
          type="password"
          placeholder="Password"
          minLength={8}
          maxLength={30}
          required
        />
        <input
          onChange={handleChange}
          name="name"
          value={user.name}
          type="text"
          placeholder="Name"
          required
        />
        <input
          onChange={handleChange}
          name="surname"
          value={user.surname}
          type="text"
          placeholder="Surname"
          required
        />
        <select onChange={handleChange} name="gender" value={user.gender} required>
          <option>F</option>
          <option>M</option>
        </select>
        <label htmlFor="date">BirthDate</label>
        <input
          onChange={handleChange}
          name="date"
          value={user.date}
          type="date"
          id="date"
          required
        />
        <button type="submit">Sign up</button>
        {isUserTaken && <p>This username is already taken.</p>}
      </form>
    </div>
  );
}

export default Signup;


