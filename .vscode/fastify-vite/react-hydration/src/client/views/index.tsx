import { ValidationMap } from "prop-types";
import React, { ReactNode } from "react";

interface MyProps {
  name?: string;
}

export const Home: React.FunctionComponent<MyProps> = function (
  props: MyProps,
  context?: any
): ReactNode {
  return (
    <div>
      <>My context's value: {context}</>; Hello {props.name}
    </div>
  );
};
