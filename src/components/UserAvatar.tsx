import React, { useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { onAuthStateChanged, User } from "firebase/auth";

const UserAvatar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await currentUser.reload(); // <-- Force reload to get latest photoURL
        setUser(auth.currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!user) return null;

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <img
        src={user.photoURL || "/default-avatar.png"}
        alt="User Avatar"
        style={{ width: 40, height: 40, borderRadius: "50%", marginRight: 8 }}
      />
      <span>{user.displayName || user.email}</span>
    </div>
  );
};

export default UserAvatar;