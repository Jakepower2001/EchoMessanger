import React, { useEffect, useState } from "react";
import { User } from "../types/User"; // <-- Import the updated User type
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { auth } from "../firebase/config";

interface Props {
  onSelect?: (user: User) => void;
}

const UserList: React.FC<Props> = ({ onSelect }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const usersList: User[] = [];
        snapshot.forEach(doc => {
          if (doc.id !== auth.currentUser?.uid) {
            usersList.push({ ...(doc.data() as User), id: doc.id });
          }
        });
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div>
      <h2>User List</h2>
      <ul>
        {users.map(user => (
          <li key={user.id} style={{ display: "flex", alignItems: "center", marginBottom: "0.5em" }}>
            <img
              src={user.avatar || "https://i.pravatar.cc/40"}
              alt="avatar"
              style={{ width: 32, height: 32, borderRadius: "50%", marginRight: 8 }}
            />
            <button onClick={() => onSelect && onSelect(user)}>
              {user.username || user.name || user.email}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;