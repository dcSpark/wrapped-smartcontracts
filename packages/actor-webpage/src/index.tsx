import React from "react";
import ReactDOM from "react-dom/client";

import { HashRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <HashRouter>
    <ToastContainer />
    <Routes>
      <Route path="/" element={<App />} />
    </Routes>
  </HashRouter>,
);
