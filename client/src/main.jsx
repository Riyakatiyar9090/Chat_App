// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
// import { BrowserRouter } from 'react-router-dom'
// import { AuthProvider } from '../context/AuthContext.jsx'

// createRoot(document.getElementById('root')).render(
//   <BrowserRouter>
//   <AuthProvider>
//     <App />
//   </AuthProvider>
//   </BrowserRouter>,
// )

import React from "react";
import "./index.css";

import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>,
);
