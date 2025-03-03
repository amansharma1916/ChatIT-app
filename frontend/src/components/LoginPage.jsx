import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import './LoginPage.css'
const serverUrl = import.meta.env.VITE_BASE_URL;
const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      console.log('Attempting login with:', formData.email);

      const response = await fetch(`${serverUrl}/users?email=${formData.email}&password=${formData.password}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // credentials: 'include'
      });

      if (!response.ok) {
        console.error('Server response not ok:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const users = await response.json();
      console.log('Server response:', users);

      if (users && users.length > 0) {
        console.log('Login successful, navigating to main');
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(users[0]));
        navigate('/main');
      }
      else if (users && typeof users === "object" && users.message) {
        // If backend returns an object (not an array) with a message
        alert(users.message);
      } else {
        console.log('Invalid credentials');
        alert('Invalid email or password');
      }

    } catch (error) {
      console.error('Detailed login error:', error);
      alert(`Login failed: ${error.message}`);
    }
  }

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Login</button>
        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  )
}

export default LoginPage
