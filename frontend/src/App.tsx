import React from "react";
import { Route, Routes } from "react-router-dom";
import { Box } from "@mui/material";
import "./App.css";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import SearchResult from "./pages/SearchResult";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <Box padding="1rem">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="search" element={<SearchResult />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
        </Routes>
      </Box>
    </>
  );
}

export default App;
