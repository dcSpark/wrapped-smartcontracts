import React from "react";
import ReactDOM from "react-dom/client";

import { HashRouter, Route, Routes } from "react-router-dom";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<App />} />
    </Routes>
  </HashRouter>
);
