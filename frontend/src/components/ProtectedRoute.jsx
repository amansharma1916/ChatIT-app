import React from 'react'
import { Navigate } from 'react-router-dom'


const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAuthenticated  && !isAdmin) {
      return <Navigate to="/register" replace />;
    }
    
  
    return children;
  }

export default ProtectedRoute
