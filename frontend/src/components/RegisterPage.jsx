import React from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import './RegisterPage.css'
const serverUrl = import.meta.env.VITE_BASE_URL;
const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const response = await fetch(`${serverUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        alert('Registration successful!');
      } else {
        // Show the specific error message from the server
        alert(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.message === 'Failed to fetch') {
        alert('Unable to connect to the server. Please make sure the server is running.');
      } else {
        alert('An error occurred during registration. Please try again later.');
      }
    }
  };


  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

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

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Register</button>
        <div className="loginsec">

          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
        <div className="adminsec">
          <p>Admin? <Link to="/adminLogin">here</Link></p>

        </div>
      </form>
    </div>
  )
}

export default RegisterPage
