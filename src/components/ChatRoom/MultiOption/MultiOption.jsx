import React from "react";

const MultiOption = ({ submitMessage, multOptions }) => {
  //   const multOptions = ["some", "shiz"];

  const handleClick = (msg) => {
    submitMessage(msg);
  };

  return (
    <div className="multoptions">
      {multOptions.map((opt) => (
        <div
          className="multoptions__option"
          key={opt}
          onClick={() => handleClick(opt)}
        >
          {opt}
        </div>
      ))}
    </div>
  );
};

export default MultiOption;
