import React from 'react';
import './AdminPage.css';
import { useState, useEffect } from 'react';
const serverUrl = import.meta.env.VITE_BASE_URL;
import { useNavigate } from 'react-router-dom';
function AdminPage() {
  const [approvedusers, setapprovedusers] = useState([]);
  const [pendingusers, setpendingusers] = useState([]);
  const [allusers, setallusers] = useState([]);
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("admin"));
  function fetchData() {
    fetch(`${serverUrl}/dataFile`)
      .then((response) => response.json())
      .then((userlist) => {
        const approvedusers = userlist.filter((user) => user.userstatus === "approved");
        const pendingusers = userlist.filter((user) => user.userstatus === "pending");
        const allusers = userlist;
        setapprovedusers(approvedusers);
        setpendingusers(pendingusers);
        setallusers(allusers);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 500);
    return () => clearInterval(interval);
  }, []);
  // useEffect(() => {
  //   fetch(`${serverUrl}/dataFile`)
  //     .then((response) => response.json())
  //     .then((userlist) => {
  //       const approvedusers = userlist.filter((user) => user.userstatus === "approved");
  //       const pendingusers = userlist.filter((user) => user.userstatus === "pending");
  //       const allusers = userlist;
  //       setapprovedusers(approvedusers);
  //       setpendingusers(pendingusers);
  //       setallusers(allusers);
  //     })
  //     .catch((error) => console.error("Error fetching data:", error));


  // }, [])

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("admin");
    navigate("/adminlogin");
  };

  const handelremove = async (username , uid) => {
    try {
      const response = await fetch(`${serverUrl}/removeuser`, { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username , uid}),
      });

      const data = await response.json();

      if (response.ok) {
        setpendingusers((prevUsers) => prevUsers.filter((user) => user.username !== username));
        setallusers((prevUsers) => prevUsers.filter((user) => user.username !== username));
        setapprovedusers((prevUsers) => prevUsers.filter((user) => user.username !== username));
      } else {
        console.error("Error removing user:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handelapprove = async (username) => {
    try {
      const response = await fetch(`${serverUrl}/approveuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok) {
        setpendingusers((prevUsers) => prevUsers.filter((user) => user.username !== username));
        setallusers((prevUsers) => [...prevUsers, data]);
        setapprovedusers((prevUsers) => [...prevUsers, data]);
      } else {
        console.error("Error approving user:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
        <div className="admin-info">{admin.username}</div>
        <div className="online-info">Current Online: xx</div>
        <div className="total-info">Total Users: xx</div>
      </header>

      <main className="admin-main">
        <section className="approved-users">
          <h3>Approved Users</h3>
          {approvedusers.map((user) => (
            <div key={user.uid} className="user-item">
              <span>{user.username}</span>
              <button onClick={(e) => {
                e.stopPropagation();
                handelremove(user.username , user.uid)
              }} className="remove-btn">×</button>
            </div>
          ))}

        </section>

        <section className="pending-users">
          <h3>Pending Users</h3>
          {pendingusers.map((user) => (
            <div key={user.uid} className="user-item">
              <span>{user.username}</span>
              <div className="a-r-btn">
                <button onClick={() => { handelapprove(user.username , user.uid) }} className="accept-btn">✔️</button>
                <button onClick={(e) => {
                  e.stopPropagation();
                  handelremove(user.username , user.uid)
                }} className="remove-btn">×</button>
              </div>
            </div>
          ))}
        </section>

        <aside className="all-users">
          <h3>All Users</h3>
          {allusers.map((user) => (
            <div key={user.uid} className="user-item">
              <span>{user.username}</span>
              {/* <span>{user.email}</span> */}
              <span>{user.userstatus == "approved" ? "✅" : "❌"}</span>
              <button onClick={(e) => {
                e.stopPropagation();
                handelremove(user.username , user.uid)
              }} className="remove-btn">×</button>
            </div>
          ))}
        </aside>
      </main>
    </div>
  );
}

export default AdminPage;
