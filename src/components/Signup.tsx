import React, { useState } from "react";
import { auth, db, storage } from "../firebase/config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup started");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created:", userCredential.user.uid);
      let avatarUrl = "";
      if (avatar) {
        console.log("Uploading avatar...");
        const avatarRef = ref(storage, `avatars/${userCredential.user.uid}`);
        try {
          await uploadBytes(avatarRef, avatar);
          console.log("Avatar uploaded to storage");
          avatarUrl = await getDownloadURL(avatarRef);
          console.log("Avatar URL:", avatarUrl);
          await updateProfile(userCredential.user, { photoURL: avatarUrl });
          console.log("Profile updated with avatar");
        } catch (err: any) {
          console.error("Avatar upload failed:", err);
          alert("Avatar upload failed: " + err.message);
        }
      }
      await addDoc(collection(db, "users"), {
        uid: userCredential.user.uid,
        name,
        email,
        avatar: avatarUrl,
      });
      console.log("User added to Firestore");
      window.location.href = "/login";
      console.log("Redirected to login");
    } catch (error: any) {
      console.error("Signup error:", error);
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <h2>Sign Up</h2>
      <input
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={e => setAvatar(e.target.files?.[0] || null)}
      />
      <button type="submit">Sign Up</button>
      <button
        type="button"
        style={{ marginTop: "1em" }}
        onClick={() => window.location.href = "/login"}
      >
        Test Redirect
      </button>
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </form>
  );
};

export default Signup;