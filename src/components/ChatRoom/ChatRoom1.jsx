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

  const [connectedAgent, setConnectedAgent] = useState(null);
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const data = await db.collection("agents").get();
  //     setAgents(data.docs.map((agent) => agent.data()));

  //   fetchData();
  // }, []);

  messagesRef.onSnapshot((snap) => dummy.current?.scrollIntoView());
  useEffect(() => {
    userRef.set({
      agent: "",
      isClient: true,
      online: true,
      email: auth.currentUser.email,
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
      isAgent: false,
    });

    calcResponse(formValue);

    setFormValue("");

    dummy.current.scrollIntoView({ behaviour: "smooth" });
  };

  activeAgentId &&
    db.doc(`agents/${activeAgentId}`).onSnapshot((snap) => {
      if (!snap.data().online) {
        setConnectedAgent(null);
      }
    });

  const didMountRef = useRef(false);

  useEffect(() => {
    if (didMountRef.current) {
      if (!connectedAgent) {
        messagesRef.add({
          name: "Akshit",
          text: "Agent has left the chat.",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          uid: "bot",
          photoURL:
            "https://i.pinimg.com/originals/08/e7/ec/08e7ec0f84233b37ac26e920bc60ec57.gif",
          isAgent: true,
        });
      } else {
        messagesRef.add({
          name: "Akshit",
          text: "Agent has joined the chat.",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          uid: "bot",
          photoURL:
            "https://i.pinimg.com/originals/08/e7/ec/08e7ec0f84233b37ac26e920bc60ec57.gif",
          isAgent: true,
        });
      }
    } else didMountRef.current = true;
  }, [connectedAgent]);

  const calcResponse = async (msg) => {
    const options = {
      method: "POST",
      url: "/",
      headers: { "Content-Type": "application/json" },
      data: [msg],
    };
    const { data } = !connectedAgent && (await axios.request(options));
    console.log(data);

    !connectedAgent &&
      (await messagesRef.add({
        name: "Akshit",
        text: data.reply,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid: "bot",
        photoURL:
          "https://i.pinimg.com/originals/08/e7/ec/08e7ec0f84233b37ac26e920bc60ec57.gif",
        isAgent: true,
      }));

    if (data?.tag === "true") {
      if (activeAgent) {
        const agentRef = db.doc(`agents/${activeAgentId}`);
        userRef.update({
          activeAgentId: activeAgentId,
        });

        agentRef.update({
          activeClientId: auth.currentUser.uid,
        });

        setConnectedAgent(activeAgentId);
      } else {
        await messagesRef.add({
          name: "Akshit",
          text: "No agent available. Please try Later.",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          uid: "bot",
          photoURL:
            "https://i.pinimg.com/originals/08/e7/ec/08e7ec0f84233b37ac26e920bc60ec57.gif",
          isAgent: true,
        });
      }
    } else {
      console.log("NO Agent rEQ");
    }
  };

  // calcResponse();

  useEffect(() => {
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
  }, []);

  // const assignAgent = async () => {
  //   agentsRef
  //     .where("online", "==", true)
  //     .limit(1)
  //     .onSnapshot((snap) => {
  //       let agents = [];
  //       let agentId = "";

  //       snap.forEach((agent) => {
  //         agents.push(agent.data().name);
  //         agentId = agent.data().agentId;
  //       });

  //       // console.log({ agents });
  //       setActiveAgent(agents[0]);
  //       setActiveAgentId(agentId);

  //       console.log({ activeAgentId });

  //       // console.log("agentName", agent.data().name)
  //     });
  //   console.log({ activeAgent });
  // };

  // assignAgent();

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
          <span ref={dummy}></span>
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
