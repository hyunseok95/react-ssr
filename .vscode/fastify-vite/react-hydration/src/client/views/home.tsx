import React from "react";

interface MyProps {
  name?: string;
}

export const Home: React.FunctionComponent<MyProps> = function (
  props: MyProps,
  context?: any
): React.ReactNode {
  return (
    <div>
      <p>test</p>
      {/* <>My context's value: {context}</>; Hello {props.name} */}
    </div>
  );
};
