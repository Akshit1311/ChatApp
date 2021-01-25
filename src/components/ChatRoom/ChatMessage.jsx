import { auth } from "../../firebase";

const ChatMessage = ({ message }) => {
  const { uid, text, photoURL } = message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="user-img" />
      <p>{text}</p>
    </div>
  );
};

export default ChatMessage;
