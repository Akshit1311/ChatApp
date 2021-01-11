import { auth } from "../../firebase";
import firebase from "firebase/app";

const SignIn = () => {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    // auth.signInAnonymously();
    auth.signInWithPopup(provider);
  };

  return (
    <div className="login">
      <h1>Agent Sign In</h1>
      <button onClick={signInWithGoogle}>Sign In</button>
    </div>
  );
};

export default SignIn;
