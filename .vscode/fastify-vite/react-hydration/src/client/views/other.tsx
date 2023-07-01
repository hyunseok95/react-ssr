import React from "react";
import { Link } from "react-router-dom";

interface MyProps {
  name?: string;
}

export const Other: React.FunctionComponent<MyProps> = function (
  props: MyProps,
  context?: any
): React.ReactNode {
  return (
    <div>
      <p>This page is just for demonstrating client-side navigation.</p>
      <Link to="/">Go back to index</Link>{" "}
    </div>
  );
};
