import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { User, Send } from 'react-feather';
import './ChatPage.css';

const serverUrl = import.meta.env.VITE_BASE_URL;

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const { chatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  const { friendName } = location.state || {};
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  if (!localStorage.getItem("isAuthenticated")) {
    window.location.href = "/login";
  }

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await fetch(`${serverUrl}/getMessages?chatId=${chatId}`);
      const data = await response.json();
      setMessages(data.reverse()); // show latest at bottom
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const [friends, setFriends] = useState([]);

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

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);
    return () => clearInterval(interval);
  }, [chatId]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      text: newMessage,
      uid: loggedInUser.uid,
      chatId: chatId,
      sender: loggedInUser.username,
    };

    try {
      const response = await fetch(`${serverUrl}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsg),
      });

      if (response.ok) {
        setNewMessage("");
        await fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(`${serverUrl}/deleteMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, messageId }),
      });

      if (response.ok) {
        await fetchMessages();
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const cp = (friendUID, friendUsername) => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    const chatId = [loggedInUser.uid, friendUID].sort().join("_");
    navigate(`/chat/${chatId}`, {
      state: { friendName: friendUsername, chatId: chatId },
    });
  };

  return (
    <div className="chat-page-container">
      {/* Header */}
      <div className="chat-header">
        <User className="user-icon" />
        Chatting With {friendName || "Friend"}
      </div>

      {/* Friend bar */}
      <div className="friend-bar-main">
        {friends.map((friend) => (
          <div key={friend.uid} className="friends-bar">
            <div
              onClick={() => cp(friend.uid, friend.username)}
              className="friend-tab active"
            >
              {friend.username}
            </div>
          </div>
        ))}
      </div>

      {/* Chat messages */}
      <div className="chat-content" ref={messagesContainerRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-bubble ${
              msg.uid === loggedInUser.uid ? "right" : "left"
            }`}
          >
            <div className="message-text">{msg.text}</div>
            <div className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
            {msg.uid === loggedInUser.uid && (
              <div className="deleteMessage">
                <button
                  onClick={() => handleDeleteMessage(msg.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="chat-footer">
        <input
          type="text"
          className="message-input"
          placeholder="Your Message Here"
          value={newMessage}
          ref={inputRef}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button onClick={handleSendMessage} className="send-button">
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
