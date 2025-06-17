import { useState } from "react";
const serverUrl = import.meta.env.VITE_BASE_URL;
import { useNavigate } from 'react-router-dom'
import './AdminLogin.css'
import { set } from "mongoose";

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [status, setstatus] = useState("");

  const handleSubmitadmin = async (e) => {
    e.preventDefault();

    try {
      console.log("Attempting admin login with:", username);

      const response = await fetch(
        `${serverUrl}/adminlogin?username=${username}&password=${password}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const admins = await response.json();
      

      if (admins && admins.length > 0) {
        console.log("Admin login successful");
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("admin", JSON.stringify(admins[0]));
        setstatus("✅ Admin successfully Verified");
        setIsVerified(true);
      } else {
        alert("Invalid username or password");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      alert(`Login failed: ${error.message}`);
    }
  };

  const handleJump = () => {
    navigate('/adminPage');
  };

  return (
    <div className="admin-login-container">
    <div className="back-button" onClick={() => window.history.back()}>{"<"} Back</div>
      <form className="login-form" onSubmit={handleSubmitadmin}>
        <h2>Admin Login</h2>
        <div className="input-group">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <p className="status">{status}</p>
        {!isVerified ? (
          <button type="submit" className="verify-button">Verify</button>
        ) : (
          
          <button type="button" className="jump-button" onClick={handleJump}>Go to Main Page</button>
          
        )}
      </form>
    </div>
  );
}

export default AdminLogin;
