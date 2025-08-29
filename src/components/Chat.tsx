import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

interface ChatProps {
  selectedFriend: string | null;
}

const Chat: React.FC<ChatProps> = ({ selectedFriend }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages in real-time
  useEffect(() => {
    if (!selectedFriend) {
      setMessages([]);
      return;
    }
    const q = query(
      collection(db, "messages"),
      where("from", "in", [auth.currentUser?.uid, selectedFriend]),
      where("to", "in", [auth.currentUser?.uid, selectedFriend]),
      orderBy("timestamp")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs
          .map((doc) => doc.data())
          .filter(
            (msg) =>
              (msg.from === auth.currentUser?.uid && msg.to === selectedFriend) ||
              (msg.from === selectedFriend && msg.to === auth.currentUser?.uid)
          )
      );
    });
    return () => unsubscribe();
  }, [selectedFriend]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || !selectedFriend) return;
    await addDoc(collection(db, "messages"), {
      from: auth.currentUser?.uid,
      to: selectedFriend,
      text: input,
      timestamp: serverTimestamp(),
    });
    setInput("");
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "40px auto",
        border: "1px solid #e0e0e0",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        height: 500,
        padding: "1em",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #eee",
          fontWeight: "bold",
          fontSize: "1.1rem",
        }}
      >
        Chat Room
      </div>
      <div
        style={{
          flex: 1,
          padding: "16px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: msg.from === auth.currentUser?.uid ? "flex-end" : "flex-start",
              background: msg.from === auth.currentUser?.uid ? "#4078c0" : "#f1f1f1",
              color: msg.from === auth.currentUser?.uid ? "#fff" : "#222",
              borderRadius: "16px",
              padding: "0.5em 1em",
              maxWidth: "60%",
              wordBreak: "break-word",
              margin: "0.5em 0",
            }}
          >
            <span style={{ fontWeight: "bold", fontSize: "0.95em" }}>
              {msg.from === auth.currentUser?.uid ? "You" : msg.from}:
            </span>{" "}
            {msg.text}
            <div style={{ fontSize: "0.8em", color: "#888" }}>
              {msg.timestamp?.toDate
                ? msg.timestamp.toDate().toLocaleTimeString()
                : ""}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div
        className="chat-footer"
        style={{
          display: "flex",
          borderTop: "1px solid #eee",
          padding: "12px",
        }}
      >
        <input
          className="message-input"
          placeholder="Type a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: 20,
            border: "1px solid #ccc",
            marginRight: 8,
          }}
        />
        <button
          className="send-btn"
          onClick={sendMessage}
          style={{
            padding: "10px 18px",
            borderRadius: 20,
            border: "none",
            background: "#1976d2",
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;