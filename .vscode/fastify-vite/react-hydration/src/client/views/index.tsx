import React, { ReactNode, useRef } from "react";
import { Link } from "react-router-dom";
import { useAtom } from "jotai";
import { todoList } from "../state";

type GreetingsProps = {
  name: string;
};

const Greetings: React.FC<GreetingsProps> = ({ name }) => (
  <div>Hello, {name}</div>
);

export default function HomePage(
  props: any,
  context: any
): React.ReactNode | null {
  const [state, updateState] = useAtom(todoList);
  const input: any = useRef(null);
  // const addItem = async () => {
  //   updateState((todoList) => {
  //     return [...todoList, input.current.value];
  //   });
  //   input.current.value = "";
  // };
  return (
    <>
      <ul>
        {state.map((item, i) => {
          return <li key={`item-${i}`}>{item}</li>;
        })}
      </ul>
      <div>
        <input ref={input} />
        {/* <button onClick={addItem}>Add</button> */}
      </div>
      <p>
        <Link to="/other">Go to another page</Link>
      </p>
    </>
  );
}
