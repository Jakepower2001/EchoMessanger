import React, { useState, useEffect } from "react";
import UserList from "./UserList";
import Chat from "./Chat";
import { auth, db } from "../firebase/config";
import { collection, query, where, getDocs, addDoc, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";

const LoggedInHome: React.FC = () => {
  const user = auth.currentUser;
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [showFriends, setShowFriends] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  const handleLogout = async () => {
    await auth.signOut();
    window.location.href = "/login";
  };

  // Helper to get user info by UID
  const getUserInfo = async (uid: string) => {
    const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", uid)));
    if (!userDoc.empty) {
      return userDoc.docs[0].data();
    }
    return { email: uid };
  };

  // Fetch current user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!auth.currentUser?.uid) return;
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        setUserInfo(userDoc.data());
      }
    };
    fetchUserInfo();
  }, []);

  // Search for users by email or name
  const handleSearch = async () => {
    let q = query(collection(db, "users"), where("email", "==", searchEmail));
    let snapshot = await getDocs(q);

    // If not found by email, try by name
    if (snapshot.empty) {
      q = query(collection(db, "users"), where("name", "==", searchEmail));
      snapshot = await getDocs(q);
    }

    if (!snapshot.empty) {
      setSearchResult({ ...snapshot.docs[0].data(), uid: snapshot.docs[0].id });
    } else {
      setSearchResult(null);
      alert("User not found");
    }
  };

  // Send friend request
  const sendFriendRequest = async (toUid: string) => {
    await addDoc(collection(db, "friendRequests"), {
      from: auth.currentUser?.uid,
      to: toUid,
      status: "pending"
    });
    alert("Friend request sent!");
    setSearchResult(null);
    setSearchEmail("");
  };

  // Fetch incoming friend requests
  useEffect(() => {
    const fetchRequests = async () => {
      if (!auth.currentUser || !auth.currentUser.uid) return; // <-- Guard inside async
      const q = query(
        collection(db, "friendRequests"),
        where("to", "==", auth.currentUser.uid),
        where("status", "==", "pending")
      );
      const snapshot = await getDocs(q);
      const requestsWithInfo = await Promise.all(snapshot.docs.map(async doc => {
        const data = doc.data();
        const senderInfo = await getUserInfo(data.from);
        return { id: doc.id, ...data, senderInfo };
      }));
      setRequests(requestsWithInfo);
    };
    fetchRequests();
  }, []);

  // Accept or decline friend request
  const respondToRequest = async (requestId: string, accept: boolean, fromUid: string) => {
    const requestRef = doc(db, "friendRequests", requestId);
    await setDoc(requestRef, { status: accept ? "accepted" : "declined" }, { merge: true });
    if (accept) {
      await addDoc(collection(db, "friends"), {
        users: [auth.currentUser?.uid, fromUid]
      });
    }
    setRequests(requests.filter(r => r.id !== requestId));
  };

  // Fetch friends
  useEffect(() => {
    const fetchFriends = async () => {
      if (!auth.currentUser || !auth.currentUser.uid) return;
      const q = query(
        collection(db, "friends"),
        where("users", "array-contains", auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const friendUids = snapshot.docs
        .map(doc =>
          doc.data().users.filter((uid: string) => uid !== auth.currentUser?.uid)[0]
        )
        .filter(Boolean);

      // Fetch user info for each friend UID
      const friendsWithInfo = await Promise.all(
        friendUids.map(async (uid: string) => {
          const userSnap = await getDocs(query(collection(db, "users"), where("id", "==", uid)));
          if (!userSnap.empty) {
            const data = userSnap.docs[0].data();
            return { uid, name: data.name || data.email || uid };
          }
          return { uid, name: uid };
        })
      );
      setFriends(friendsWithInfo);
    };
    fetchFriends();
  }, []);

  // Unfriend function
  const unfriend = async (friendUid: string) => {
    const q = query(
      collection(db, "friends"),
      where("users", "array-contains", auth.currentUser?.uid)
    );
    const snapshot = await getDocs(q);
    const docToDelete = snapshot.docs.find(doc => {
      const users = doc.data().users;
      return users.includes(friendUid) && users.includes(auth.currentUser?.uid);
    });
    if (docToDelete) {
      await deleteDoc(docToDelete.ref);
      setFriends(friends.filter(friend => friend.uid !== friendUid));
      alert("Unfriended!");
      if (selectedFriend === friendUid) setSelectedFriend(null);
    }
  };

  return (
    <div className="main-container">
      {/* Friends List */}
      <aside className="sidebar">
        <div className="profile">
          <img src={userInfo?.avatar || "https://i.pravatar.cc/60"} alt="Profile" className="avatar" />
          <h3>{user?.displayName || user?.email}</h3>
        </div>
        <input
          className="search"
          placeholder="Search users by email"
          value={searchEmail}
          onChange={e => setSearchEmail(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
        {searchResult && (
          <div>
            <span>{searchResult.email}</span>
            <button onClick={() => sendFriendRequest(searchResult.uid)}>Add Friend</button>
          </div>
        )}
        <h4>Friend Requests</h4>
        <ul>
          {requests.map(req => (
            <li key={req.id}>
              {req.senderInfo.name || req.senderInfo.email}
              <button onClick={() => respondToRequest(req.id, true, req.from)}>Accept</button>
              <button onClick={() => respondToRequest(req.id, false, req.from)}>Decline</button>
            </li>
          ))}
        </ul>
        <h4>
          Friends
          <button style={{ marginLeft: 10 }} onClick={() => setShowFriends(!showFriends)}>
            {showFriends ? "Hide" : "Show"}
          </button>
        </h4>
        {showFriends && (
          <ul>
            {friends.map(friend => (
              <li key={friend.uid}>
                <button
                  style={{
                    background: selectedFriend === friend.uid ? "#4078c0" : "#222",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.3em 1em",
                    marginRight: "0.5em",
                  }}
                  onClick={() => setSelectedFriend(friend.uid)}
                >
                  {friend.name}
                </button>
                <button onClick={() => unfriend(friend.uid)}>Unfriend</button>
              </li>
            ))}
          </ul>
        )}
        <UserList />
      </aside>

      {/* Chat Section */}
      <section className="chat-section">
        <header className="chat-header">
          <img src="https://i.pravatar.cc/60?u=chat" alt="Chat User" className="avatar" />
          <div>
            <h3>
              {selectedFriend
                ? `Chat with ${selectedFriend}`
                : "Select a friend to chat"}
            </h3>
          </div>
        </header>
        <Chat selectedFriend={selectedFriend} />
      </section>

      {/* Settings/Info Section */}
      <aside className="info-section">
        <div className="info-header">
          <img src="https://i.pravatar.cc/60?u=info" alt="Info User" className="avatar" />
          <h3>Maria Nelson</h3>
          <span>Grateful for every sunrise and sunset 🌅</span>
        </div>
        <div className="settings-list">
          <div>Chat settings</div>
          <div>Privacy & help</div>
          <div>Shared photos</div>
          <div>Shared files</div>
        </div>
        <button className="block-btn">Block User</button>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </aside>
    </div>
  );
};

export default LoggedInHome;