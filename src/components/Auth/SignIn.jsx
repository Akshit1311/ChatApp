import { auth } from "../../firebase";
import firebase from "firebase/app";

const SignIn = () => {
  const signInWithGoogle = () => {
    // const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInAnonymously();
    // auth.signInWithPopup(provider);
  };

  return <button onClick={signInWithGoogle}>Sign In</button>;
};

export default SignIn;
