import React, { useRef, useState, useEffect } from "react";

import firebase from "firebase/app";

import SignOut from "../Auth/SignOut";
import { useCollectionData } from "react-firebase-hooks/firestore";
import db, { auth } from "../../firebase";
import ChatMessage from "./ChatMessage";
import axios from "axios";

import { withStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';

function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  h2: {
    color: "#000"
  }
}));



const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
    zIndex: "10"
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    '&:focus': {
      backgroundColor: "#ffffff",
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: "#000000",
      },
    },
  },
}))(MenuItem);

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition 
const mic = new SpeechRecognition()

mic.continuous = true
mic.interimResults = true 

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
  useEffect(() => {
    const script = document.createElement('script');
  
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateFunction";
    script.async = true;
  
    document.body.appendChild(script);
  
    return () => {
      document.body.removeChild(script);
    }
  }, []);
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
  
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const classes = useStyles();
  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = React.useState(getModalStyle);
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleCut = () => {
    setOpen(false);
  };

  const body = (
    <div style={modalStyle} className={classes.paper}>
      <h2 id="simple-modal-title" className={classes.h2}>Chat History will send to your Email.</h2>
        <input type="text" placeholder="Enter your Email..." />
      <button>Send</button>
    </div>
  )
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
  const [Microphone, setMicrophone] = useState(true)
  const [islistening, setIslisting] = useState(false)
  const [note, setNote] = useState(null)
  const [saveNotes, setSaveNotes] = useState([])
  useEffect(() => {
    handleListen()
  },[islistening])

  const setItems = () => {
    
  }
  const handleListen = () => {
    if(islistening) {
      mic.start()
      mic.onend = () => {
        mic.start()
      }
    }else{
      mic.stop()
      mic.onend = () => {
        console.log("stop")
      }
    }
    mic.onstart = ()=>{}
    mic.onresult = event => {
      const transcript = Array.from(event.results).map( result => result[0]).map(result => result.transcript).join('')
      console.log(transcript);
      setNote(transcript);
    }
  }
  

  return (
    <div className="chatroom">
      {/* <div id="google_translate_element"></div> */}
      <h1>Finnobot</h1>
      <div class="subitems">
        <div>Active Agent : {activeAgent}</div>
        <div id="google_translate_element"></div>
      </div>
      
      
      <div>
      <div
        className="chatroom__setting"
        aria-controls="customized-menu"
        aria-haspopup="true"
        variant="contained"
        onClick={handleClick}
      >
        <i className="fa fa-cog"></i>
      </div>
      <StyledMenu
        id="customized-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        
        <StyledMenuItem>
          <ListItemIcon>
            <i className="fa fa-envelope setting_icons"></i>
          </ListItemIcon>
          <ListItemText primary="Sent History" onClick={handleOpen} />
          <Modal
            open={open}
            onClose={handleCut}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
          >
            {body}
          </Modal>
        </StyledMenuItem>
        <StyledMenuItem>
          <ListItemIcon>
            <i className="fa fa-comments setting_icons"></i>
          </ListItemIcon>
          <ListItemText primary="Clear History" />
        </StyledMenuItem>
        <StyledMenuItem>
          <ListItemIcon>
            <i className="fa fa-power-off setting_icons"></i>
          </ListItemIcon>
          <ListItemText primary="End Conservation" />
        </StyledMenuItem>
      </StyledMenu>
    </div>
    {/* <div className="chatroom__language" id="google_translate_element">
      <i className="fa fa-language lang"></i>
    </div> */}
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
          <p>{note}</p>
        </main>

        <form onSubmit={sendMessage} className="chatroom__form">
          <input
            type="text"
            className="chatroom__input"
            placeholder="Type a message..."
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
          />
          <div className="chatroom__mic">
            <i className={Microphone ? "fa fa-microphone" : "fa fa-microphone-slash"} onClick={() => {setIslisting(prevState => !prevState); setMicrophone(prevState => !prevState)}}></i>
          </div>
          <button type="submit" className="chatroom__button">
            <i className="fa fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
