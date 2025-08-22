import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MainPage.css";

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
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    fetch(`${serverUrl}/friendsFile`)
      .then((response) => response.json())
      .then((friendList) => {
        const userFriends = friendList.filter(
          (friend) => friend.user === loggedInUser.username
        );
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
    if (searchTerm === "") {
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
      uid: user.uid,
      username: user.username,
      email: user.email,
      user: loggedInUser.username,
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
        setFriends((prevFriends) => [...prevFriends, newFriend]);
      } else {
        console.error("Error adding user:", data.error);
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

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
        setFriends((prevFriends) =>
          prevFriends.filter((friend) => friend.uid !== uid)
        );
      } else {
        console.error("Error removing friend:", data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const chatPage = (friendUID, friendUsername) => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    const chatId = [loggedInUser.uid, friendUID].sort().join("_");
    navigate(`/chat/${chatId}`, {
      state: {
        friendName: friendUsername,
        chatId: chatId,
      },
    });
  };

  return (
    <div className="page">
      {/* Navbar */}
      <div className="header">
        <div className="header-left">
          <div className="user-name">
            @{JSON.parse(localStorage.getItem("user")).username}
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">
            Search
          </button>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      {/* Main Layout */}
      <div className="main-container">
        {/* Friends Sidebar */}
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

        {/* Search Results Section */}
        <div className="right-section">
          <div className="contacts-list">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.uid} className="contact-item">
                  <div className="contact-info">
                    <div className="contact-name">{user.username}</div>
                    <span>{user.email}</span>
                    <div>
                      <button
                        onClick={() => handleAdd(user)}
                        className="addbtn"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No users found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
