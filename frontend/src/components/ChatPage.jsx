import React, { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { User, Send } from 'react-feather'
import './ChatPage.css'

const serverUrl = import.meta.env.VITE_BASE_URL;

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { chatId } = useParams();
  const location = useLocation();
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const { friendName } = location.state || {};
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const inputRef = useRef(null);

  if (!localStorage.getItem("isAuthenticated")) {
    window.location.href = "/login";
  }

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
    // Keep focus on input
    const handleClick = (event) => {
      const backButton = document.querySelector('.back-button');
      if (event.target !== backButton && !backButton.contains(event.target)) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('touchstart', handleClick, { passive: false });

    // Initial focus
    inputRef.current?.focus();

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, []);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);
    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollTop, clientHeight, scrollHeight } = container;
    if (scrollHeight - scrollTop > clientHeight + 50) {
      setAutoScroll(false);
    } else {
      setAutoScroll(true);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
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
        await fetchMessages(); // Immediately fetch new messages
      }
    } catch (error) {
      console.error("Error adding message:", error);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus(); // Refocus after sending
    }
  };

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
    } finally {
      inputRef.current?.focus(); // Refocus after deletion
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
        <button 
          onClick={handleSendMessage} 
          className="send-button"
          disabled={isLoading}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
