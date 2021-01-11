import React, { useRef, useState, useEffect } from "react";

import firebase from "firebase/app";

import SignOut from "../Auth/SignOut";
import { useCollectionData } from "react-firebase-hooks/firestore";
import db, { auth } from "../../firebase";
import ChatMessage from "./ChatMessage";

const ChatRoom = () => {
  const dummy = useRef();

  const agentRef = db.doc(`agents/${auth.currentUser.uid}`);
  // const [clientId, setClientId] = useState(agentRef.);

  // const userRef = db.doc(`users/`);

  // const messagesRef = db.collection("messages");
  // const messagesRef = db
  //   .collection("users")
  //   .doc(auth.currentUser.uid)
  //   .collection("messages");

  const messagesRef = db.collection(`users/${auth.currentUser.uid}/messages`);

  const query = messagesRef.orderBy("createdAt").limit(50);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  console.log({ auth });

  useEffect(() => {
    messagesRef.onSnapshot((snap) => dummy.current.scrollIntoView());

    agentRef.set({
      name: auth.currentUser.displayName,
      isClient: false,
      online: true,
      client: null,
    });

    agentRef.onSnapshot((snap) =>
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
      agentRef.update({
        client: null,
        online: false,
      });
      window.removeEventListener("beforeunload", alertUser);
    };
  }, []);

  const alertUser = (e) => {
    e.preventDefault();
    e.returnValue = "";
    agentRef.update({
      online: false,
      client: null,
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      name: auth.currentUser.displayName,
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
    });

    setFormValue("");

    dummy.current.scrollIntoView({ behaviour: "smooth" });
  };

  return (
    <>
      <h1>ChatRoom</h1>
      <div>
        <SignOut />

        <main>
          {messages &&
            messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
          <div ref={dummy}></div>
        </main>

        <form onSubmit={sendMessage}>
          <input
            type="text"
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
          />
          <button type="submit">Enter</button>
        </form>
      </div>
    </>
  );
};

export default ChatRoom;
