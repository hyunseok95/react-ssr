import React, { useState } from "react";

interface MyProps {
  name?: string;
}

export const Home: React.FunctionComponent<MyProps> = function (
  props: MyProps,
  context?: any
): React.ReactNode {
  const [message, setMessage] = useState("");
  // ...
  function handleSendClick() {
    console.log(message);
  }

  return (
    <>
      <input value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={handleSendClick}>Send</button>;
    </>
  );
};
