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
    <div style={{ flex: 1, overflowY: "auto", padding: "1em" }}>
      <div>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.from === auth.currentUser?.uid ? "right" : "left",
              margin: "0.5em 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                background: msg.from === auth.currentUser?.uid ? "#4078c0" : "#eee",
                color: msg.from === auth.currentUser?.uid ? "#fff" : "#222",
                borderRadius: "16px",
                padding: "0.5em 1em",
                maxWidth: "60%",
                wordBreak: "break-word",
              }}
            >
              {msg.text}
            </span>
            <div style={{ fontSize: "0.8em", color: "#888" }}>
              {msg.timestamp?.toDate
                ? msg.timestamp.toDate().toLocaleTimeString()
                : ""}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-footer">
        <input
          className="message-input"
          placeholder="Type a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="send-btn" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;