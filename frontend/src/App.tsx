import React from "react";
import { Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import { Box } from "@mui/material";
import Login from "./pages/Login";

function App() {
  return (
    <>
      <Navbar />
      <Box padding="1rem">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
        </Routes>
      </Box>
    </>
  );
}

export default App;
