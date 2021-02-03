import React, { useRef, useState, useEffect } from "react";

import firebase from "firebase/app";

import SignOut from "../Auth/SignOut";
import { useCollectionData } from "react-firebase-hooks/firestore";
import db, { auth } from "../../firebase";
import ChatMessage from "./ChatMessage";
import axios from "axios";
import ChatForm from "./ChatForm/ChatForm";
import MultiOption from "./MultiOption/MultiOption";

const ChatRoom = ({ handleToggle }) => {
  const dummy = useRef();

  // const [messages, setMessages] = useState([]);

  // State
  const [availAgent, setAvailAgent] = useState(null);
  const [availAgentId, setAvailAgentId] = useState(null);
  const [availAgentImgs, setAvailAgentImgs] = useState([]);
  const [connectedAgent, setConnectedAgent] = useState(null);
  const [connectedAgentId, setConnectedAgentId] = useState(null);
  const [connectedAgentImg, setConnectedAgentImg] = useState("");

  //multi
  const [isMultiOpen, setIsMultiOpen] = useState(false);
  const [multOptions, setMultOptions] = useState([]);

  // Firebase
  const messagesRef = db.collection(`users/${auth.currentUser.uid}/messages`);
  const query = messagesRef.orderBy("createdAt", "asc").limit(1000);
  const [messages] = useCollectionData(query, { idField: "id" });

  messagesRef.onSnapshot((snap) => dummy.current?.scrollIntoView());

  const agentsRef = db.collection("agents");
  const userRef = db.doc(`users/${auth.currentUser.uid}`);

  // connectedAgentId &&
  //   db.doc(`agents/${connectedAgentId}`).onSnapshot((snap) => {
  //     if (!snap.data().online) {
  //       setConnectedAgent(null);
  //     }
  //   });

  useEffect(() => {
    dummy.current.scrollIntoView();
    userRef.set({
      agent: "",
      isClient: true,
      online: true,
      email: auth.currentUser.email || null,
    });
  }, [messages]);

  useEffect(() => {
    if (connectedAgent) {
      const agentRef = db.doc(`agents/${connectedAgentId}`);
      agentRef.onSnapshot((snap) => {
        console.log(snap.data());
        if (!snap.data().online) {
          setConnectedAgent(null);
          setConnectedAgentId(null);
        }
      });
    }
  });

  const didMountRef = useRef(false);
  useEffect(() => {
    if (didMountRef.current) {
      if (!connectedAgent) {
        sendMessage("Agent has left the chat.", "bot", null, true);
      }
    } else didMountRef.current = true;
  }, [connectedAgent]);

  //Listen for active agents
  useEffect(() => {
    agentsRef
      .where("online", "==", true)
      .where("activeClientId", "==", null)
      .limit(1)
      .onSnapshot((snap) => {
        let agents = [];
        let agentId = "";
        let agentImgs = [];

        snap.forEach((agent) => {
          agents.push(agent.data().name);
          agentId = agent.data().agentId;
          agentImgs.push(agent.data().imgURL);
        });

        console.log({ agents });
        setAvailAgent(agents[0]);
        setAvailAgentId(agentId);
        setAvailAgentImgs(agentImgs);

        // console.log({ activeAgentId });

        // console.log("agentName", agent.data().name)
      });
    // console.log({ activeAgent });
  }, []);

  //Make User Offline Before Leaving Page

  useEffect(() => {
    window.addEventListener("beforeunload", alertUser);
    return () => {
      userRef.update({
        agent: "",
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
      agent: "",
    });
  };

  const submitMessage = async (msg) => {
    setIsMultiOpen(false);
    sendMessage(msg, auth.currentUser.displayName, auth.currentUser.uid);

    if (!connectedAgent) {
      const res = await calcResponse(msg);

      console.log({ res });

      sendMessage(res.reply, "bot", null, true);

      if (res.tag === "true") {
        console.log("agent requested");
        if (availAgent) assignAgent();
        else sendMessage("No agent available", "bot", null, true);
      }
    }
  };

  const calcResponse = async (msg) => {
    const options = {
      method: "POST",
      url:
        "https://cors-anywhere.herokuapp.com/https://chatback.londonscg.co.uk/",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      },
      data: [msg],
    };

    const { data } = await axios.request(options);

    console.log({ data });

    if (data.is_multi === "true") {
      setMultOptions(data.options);
      setIsMultiOpen(true);
    }

    return data;
  };

  const sendMessage = async (msg, sender, senderId, isAgent) => {
    await messagesRef.add({
      name: sender,
      text: msg,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid: senderId ?? "bot",
      photoURL: senderId
        ? "https://www.freepngimg.com/thumb/facebook/62681-flat-icons-face-computer-design-avatar-icon.png"
        : "https://i.pinimg.com/originals/08/e7/ec/08e7ec0f84233b37ac26e920bc60ec57.gif",
      isAgent: isAgent || false,
    });
  };

  const assignAgent = () => {
    const agentRef = db.doc(`agents/${availAgentId}`);
    setConnectedAgentId(availAgentId);
    setConnectedAgent(availAgent);
    setConnectedAgentImg(availAgentImgs[0]);

    agentRef.update({
      activeClient:
        auth.currentUser.displayName ?? `User${auth.currentUser.uid}`,
      activeClientId: auth.currentUser.uid,
    });

    sendMessage(`${availAgent} (Agent) has joined the chat`, "bot", null, true);
  };

  return (
    <div className="chatroom">
      <h1>Finnobot</h1>
      <div className="chatroom__agentinfo">
        <div>
          Connected :{" "}
          {connectedAgent ? (
            <img
              src={connectedAgentImg}
              alt="avail-agent"
              className="agent__avatar"
            />
          ) : (
            <>
              <i className="fa fa-user-times" />
            </>
          )}
        </div>
        <div>
          Available :{" "}
          {availAgent ? (
            availAgentImgs
              .reverse()
              .map(
                (img, i) =>
                  i < 3 && (
                    <img
                      src={img}
                      alt="avail-agent"
                      className="agent__avatar"
                      key={i}
                    />
                  )
              )
          ) : (
            <>
              <i className="fa fa-user-times" />
            </>
          )}{" "}
        </div>
      </div>

      <div className="finn__logout" onClick={() => auth.signOut()}>
        <i className="fa fa-sign-out" aria-hidden="true"></i>
      </div>

      <div className="chatroom__drop" onClick={handleToggle}>
        <i className="fa fa-chevron-down"></i>
      </div>
      <div>
        {/* <SignOut /> */}

        <main className="chatroom__main">
          {messages &&
            messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

          {isMultiOpen && (
            <MultiOption
              submitMessage={submitMessage}
              multOptions={multOptions}
            />
          )}
          <span ref={dummy}></span>
        </main>

        {/* <form onSubmit={submitMessage} className="chatroom__form">
          <input
            type="text"
            className="chatroom__input"
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
          />

          <button type="submit" className="chatroom__button">
            Enter
          </button>
        </form> */}
        <ChatForm submitMessage={submitMessage} />
      </div>
    </div>
  );
};

export default ChatRoom;
