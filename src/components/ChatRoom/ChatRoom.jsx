import React, { useRef, useState, useEffect } from "react";

import firebase from "firebase/app";

import SignOut from "../Auth/SignOut";
import { useCollectionData } from "react-firebase-hooks/firestore";
import db, { auth } from "../../firebase";
import ChatMessage from "./ChatMessage";
import axios from "axios";

const ChatRoom = ({ handleToggle }) => {
  const dummy = useRef();

  const agentsRef = db.collection("agents");
  const userRef = db.doc(`users/${auth.currentUser.uid}`);

  // const messagesRef = db.collection("messages");
  // const messagesRef = db
  //   .collection("users")
  //   .doc(auth.currentUser.uid)
  //   .collection("messages");

  //Data

  const messagesRef = db.collection(`users/${auth.currentUser.uid}/messages`);

  const query = messagesRef.orderBy("createdAt", "desc").limit(50);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  // console.log({ auth });

  const [activeAgent, setActiveAgent] = useState(null);
  const [activeAgentId, setActiveAgentId] = useState(null);
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const data = await db.collection("agents").get();
  //     setAgents(data.docs.map((agent) => agent.data()));

  //     console.log("agents", agents);
  //   };

  //   fetchData();
  // }, []);

  useEffect(() => {
    messagesRef.onSnapshot((snap) => dummy.current.scrollIntoView());

    userRef.set({
      agent: "",
      isClient: true,
      online: true,
    });

    userRef.onSnapshot((snap) =>
      console.log("userStatus", snap.data()?.status)
    );

    // db.collection("agents").onSnapshot((snap) =>
    //   snap.docs.map((doc) => {
    //     console.log(doc.data());
    //   })
    // );
  }, []);

  useEffect(() => {
    window.addEventListener("beforeunload", alertUser);
    return () => {
      userRef.update({
        agent: "",
        isClient: true,
        online: false,
      });
      window.removeEventListener("beforeunload", alertUser);
    };
  }, []);

  const alertUser = (e) => {
    e.preventDefault();
    e.returnValue = "";
    userRef.update({
      online: false,
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      name: "Akshit",
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
    });

    calcResponse(formValue);

    setFormValue("");

    dummy.current.scrollIntoView({ behaviour: "smooth" });
  };

  const calcResponse = async (msg) => {
    const options = {
      method: "POST",
      url: "/",
      headers: { "Content-Type": "application/json" },
      data: [msg],
    };
    const { data } = await axios.request(options);
    console.log(data);
    await messagesRef.add({
      name: "Akshit",
      text: data.reply,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid: "bot",
      photoURL: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
    });
  };

  // calcResponse();

  const assignAgent = async () => {
    agentsRef
      .where("online", "==", true)
      .limit(1)
      .onSnapshot((snap) => {
        let agents = [];
        let agentId = "";

        snap.forEach((agent) => {
          agents.push(agent.data().name);
          agentId = agent.data().agentId;
        });

        // console.log({ agents });
        setActiveAgent(agents[0]);
        setActiveAgentId(agentId);

        console.log({ activeAgentId });

        // console.log("agentName", agent.data().name)
      });
    console.log({ activeAgent });
  };

  assignAgent();

  return (
    <div className="chatroom">
      <h1>ChatRoom</h1>
      <div>Active Agent : {activeAgent}</div>

      <div className="chatroom__drop" onClick={handleToggle}>
        <i className="fa fa-chevron-down"></i>
      </div>
      <div>
        {/* <SignOut /> */}

        <main className="chatroom__main">
          {messages &&
            messages
              .reverse()
              .map((msg) => <ChatMessage key={msg.id} message={msg} />)}
          <div ref={dummy}></div>
        </main>

        <form onSubmit={sendMessage} className="chatroom__form">
          <input
            type="text"
            className="chatroom__input"
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
          />
          <button type="submit" className="chatroom__button">
            Enter
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
