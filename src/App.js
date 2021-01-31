import React, { useState, useEffect } from "react";

import "./App.css";
import LscgLogo from "./assets/LscgLogo.png";

// Firebase SDK

// Firebase hooks
import { useAuthState } from "react-firebase-hooks/auth";

import { auth } from "./firebase";

import SignIn from "./components/Auth/SignIn";
import ChatRoom from "./components/ChatRoom/ChatRoom";

function App() {
  const [user] = useAuthState(auth);

  const [togglerClass, setTogglerClass] = useState("");
  const [isFinOpen, setIsFinOpen] = useState(false);
  const [botClass, setBotClass] = useState("");

  useEffect(() => {
    // auth.signInAnonymously();
  }, []);

  const handleToggle = () => {
    // isFinOpen ? setTogglerClass("") : setTogglerClass("toggle-finnobot-active");
    setIsFinOpen(!isFinOpen);

    if (isFinOpen) {
      setTogglerClass("");
      setBotClass("");
    } else {
      setBotClass("finnobot-active");
      setTogglerClass("toggle-finnobot-active");
    }
  };

  return (
    <>
      <div className={`finnobot ${botClass}`}>
        {user ? (
          <ChatRoom handleToggle={handleToggle} />
        ) : (
          <SignIn handleToggle={handleToggle} />
        )}
      </div>
      <button
        className={`toggle-finnobot ${togglerClass}`}
        onClick={handleToggle}
      >
        <img src={LscgLogo} alt="lscg-logo" />
      </button>
    </>
  );
}

export default App;
