import React, { useEffect, useRef, useState } from "react";

//SpeechRecognition

const SpeechRecognition =
  window.SpeachRecognition || window.webkitSpeechRecognition;

const mic = new SpeechRecognition();

mic.continuous = false;
mic.interimResults = false;
mic.lang = "en-US";

const ChatForm = ({ submitMessage }) => {
  const [isListening, setIsListening] = useState(false);
  const [formValue, setFormValue] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    isListening ? handleListen() : mic.stop();
  }, [isListening]);

  useEffect(() => {
    inputRef.current.scrollLeft = inputRef.current.scrollWidth;
  }, [formValue]);

  const handleListen = () => {
    if (isListening) {
      mic.start();
      mic.onend = () => {
        console.log("continue....");
        setIsListening(false);
      };
    } else {
      mic.stop();
      mic.onend = () => {
        console.log("Stopped mic...");
      };
    }

    mic.onstart = () => {
      console.log("mics on..");
    };

    mic.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((res) => res[0])
        .map((res) => res.transcript)
        .join("");

      console.log(transcript);
      setFormValue(transcript);
      submitMessage(transcript);
      setFormValue("");

      mic.onerror = (e) => {
        console.log(e.error);
      };
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    submitMessage(formValue);
    setFormValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="chatroom__form">
      <input
        type="text"
        className="chatroom__input"
        value={formValue}
        onChange={(e) => setFormValue(e.target.value)}
        ref={inputRef}
      />

      <i
        className={`fa fa-microphone ${isListening ? "mic-enabled" : ""}`}
        onClick={() => setIsListening(!isListening)}
      />

      <button type="submit" className="chatroom__button">
        Enter
      </button>
    </form>
  );
};

export default ChatForm;
