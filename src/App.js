import React from "react";

import "./App.css";

// Firebase SDK

// Firebase hooks
import { useAuthState } from "react-firebase-hooks/auth";

import { auth } from "./firebase";

import SignIn from "./components/Auth/SignIn";
import ChatRoom from "./components/ChatRoom/ChatRoom";

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

export default App;
