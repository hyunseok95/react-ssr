import React from "react";
import { Route, Routes } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";

import { Home } from "./views/home";
import { Other } from "./views/other";

interface MyProps {
  hydration?: any;
}

export default function App(props: MyProps, context?: any): React.ReactNode {
  return (
    <React.Suspense>
      <StaticRouter location={props.hydration.url}>
        <Routes>
          <Route key="/" path="/" Component={Home} />;
          <Route key="/other" path="/other" Component={Other} />;
        </Routes>
      </StaticRouter>
    </React.Suspense>
  );
}

// export default function App(props: MyProps, context?: any): React.ReactNode {
//   return (
//     <html>
//       <head>
//         <meta charSet="utf-8" />
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         {/* <link rel="stylesheet" href="/styles.css"></link> */}
//         <title>My app</title>
//       </head>
//       <body>
//         <React.Suspense>
//           <StaticRouter location={props.hydration.url}>
//             <Routes>
//               <Route key="/" path="/" Component={Home} />;
//               <Route key="/other" path="/other" Component={Other} />;
//             </Routes>
//           </StaticRouter>
//         </React.Suspense>
//         <script src="/static/index.js"></script>
//       </body>
//     </html>
//   );
// }
