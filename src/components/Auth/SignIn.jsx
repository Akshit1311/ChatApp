import { auth } from "../../firebase";
import firebase from "firebase/app";

import GoogleLogo from "../../assets/googleLogo.png";

const SignIn = ({ handleToggle }) => {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  const signInAnon = () => {
    auth.signInAnonymously();
  };

  return (
    <div className="finnobot__init">
      <i className="fa fa-times" onClick={handleToggle}></i>

      <div className="tip-box">
        <i className="fa fa-lightbulb-o" aria-hidden="true"></i>
        To save chats you can continue with google
      </div>

      <button className="g-login" onClick={signInWithGoogle}>
        <img src={GoogleLogo} alt="google-logo" />
        Sign In with Google
      </button>
      <button className="g-login" onClick={signInAnon}>
        <i className="fa fa-user-circle-o"></i>
        Continue anonymously
      </button>
    </div>
  );
};

export default SignIn;
