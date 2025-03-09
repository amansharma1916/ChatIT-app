import React, { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { User, Send } from 'react-feather'
import './ChatPage.css'

const serverUrl = import.meta.env.VITE_BASE_URL;

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [LastMessage, setLastMessage] = useState("");
  const { chatId } = useParams();
  const location = useLocation();
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const { friendName } = location.state || {};
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const inputRef = useRef(null);
  // Authentication check
  if (!localStorage.getItem("isAuthenticated")) {
    window.location.href = "/login";
  }

  // Fetch messages for current chat
  const fetchMessages = async () => {
    try {
      const response = await fetch(`${serverUrl}/getMessages?chatId=${chatId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);
    return () => clearInterval(interval);
  }, [chatId]);

  // Scroll to bottom only if autoScroll is enabled
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages]);

  // Detect user scrolling
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, clientHeight, scrollHeight } = container;

    // If user scrolls up, disable auto-scroll
    if (scrollHeight - scrollTop > clientHeight + 50) {
      setAutoScroll(false);
    } else {
      setAutoScroll(true);
    }
  };

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
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }
    } catch (error) {
      console.error("Error adding message:", error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(`${serverUrl}/deleteMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, messageId }), // Pass the messageId here
      });
  
      if (response.ok) {
        // Fetch updated messages after deletion
        await fetchMessages();
      } else {
        console.error("Failed to delete message:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="header">
        <div className="back-button" onClick={() => window.history.back()}>
          {"<"} Back
        </div>
        <User className="mr-2" /> Chat with {friendName || "Friend"}
      </div>

      <div
        className="messages"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.uid === loggedInUser.uid ? "me" : "other"}`}
          >
            <div className="message-text">{msg.text}</div>
            <div className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
            <div className="deleteMessage">
              {msg.uid === loggedInUser.uid && (
                <button
                  onClick={() => handleDeleteMessage(msg.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-box">
        <input
          type="text"
          className="input"
          placeholder="Type a message..."
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
