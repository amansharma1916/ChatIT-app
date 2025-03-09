import React, { useState, useEffect, useRef } from 'react';

const ChatPage = ({ loggedInUser, chatId, serverUrl }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleTouchStart = (event) => {
      const isBackButton = event.target.closest('.back-button');
      if (!isBackButton && inputRef.current && event.target !== inputRef.current) {
        event.preventDefault();
        inputRef.current.focus();
      }
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: false });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
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
        inputRef.current?.focus(); // Refocus after sending
      }
    } catch (error) {
      console.error("Error adding message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chat-page">
      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className="message">
            {message.text}
          </div>
        ))}
      </div>
      
      <div className="input-container">
        <input
          type="text"
          className="input"
          placeholder="Type a message..."
          value={newMessage}
          ref={inputRef}
          autoFocus
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button 
          className="send-button"
          onClick={handleSendMessage}
          disabled={isSending}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
