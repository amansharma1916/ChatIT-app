import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './MainPage.css'
const serverUrl = import.meta.env.VITE_BASE_URL;

const MainPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [friends, setFriends] = useState([]);

  const navigate = useNavigate();


  useEffect(() => {
    fetch(`${serverUrl}/dataFile`)
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user")); // Get logged-in user data
    fetch(`${serverUrl}/friendsFile`)
      .then((response) => response.json())
      .then((friendList) => {
        // Filter friends to show only those added by the logged-in user
        const userFriends = friendList.filter(friend => friend.user === loggedInUser.username);
        setFriends(userFriends);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);


  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchTerm == "") {
      setFilteredUsers([]);
      return;

    }
    const filtered = users.filter((user) =>
      user.username.toLowerCase().startsWith(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };


  const handleAdd = async (user) => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    const newFriend = {
      "uid": user.uid,
      "username": user.username,
      "email": user.email,
      "user": loggedInUser.username,
    };



    try {
      const response = await fetch(`${serverUrl}/addFriend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFriend),
      });

      const data = await response.json();
      if (response.ok) {
        // Update friends state to add the new friend in real-time
        setFriends((prevFriends) => [...prevFriends, newFriend]);
      } else {
        console.error("Error adding user:", data.error);
      }
      console.log(data);
    } catch (error) {
      console.error("Error adding user:", error);
    }
  }
  //   const handleRemove = async (friend) => {
  //     const friendToRemove = {
  //       "uid": friend.uid,
  //       "username": friend.username,
  //       "email": friend.email,
  //     };
  //     try {
  //       const response = await fetch("http://localhost:5000/removeFriend", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(friendToRemove),
  //       });

  //       const data = await response.json();
  //       console.log(data);
  //     } catch (error) {
  //       console.error("Error removing user:", error);
  //   }
  // };

  const handleRemove = async (uid) => {
    try {
      const response = await fetch(`${serverUrl}/removeFriend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update friends state to remove the friend in real-time
        setFriends((prevFriends) => prevFriends.filter((friend) => friend.uid !== uid));
      } else {
        console.error("Error removing friend:", data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };


  const chatPage = (friendUID, friendUsername) => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    const chatId = [loggedInUser.uid, friendUID].sort().join('_');
    navigate(`/chat/${chatId}`, {
      state: {
        friendName: friendUsername,
        chatId: chatId
      }
    });
  }





  return (
    <div className="main-container">
      <div className="header">
        <div className="user-name">
          <div className="main_user">
            <div className="user_name"> @{JSON.parse(localStorage.getItem("user")).username}</div>
          </div>

        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="search-container">
        <div className="back-button" onClick={() => window.history.back()}>{"<"} Back</div>

        <input
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>

      <div className="contacts-list">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user.uid} className="contact-item">
              <div className="contact-info">
                <div className="contact-name">{user.username}</div>
                {user.email}
                <div><button onClick={() => handleAdd(user)} className="addbtn">Add</button></div>
              </div>
            </div>
          ))
        ) : (
          <p>No users found.</p>
        )}
      </div>
      <div className="addedFriends">
        <div className="title">Your Friends</div>
        {friends.map((friend) => (
          <div key={friend.uid} className="friends">
            <div
              onClick={() => chatPage(friend.uid, friend.username)}
              className="friend"
            >
              <div className="friend-name">{friend.username}</div>
              <div className="friend-email">
                {friend.email}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(friend.uid);
                  }}
                  className="removebtn"
                >
                  remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default MainPage
