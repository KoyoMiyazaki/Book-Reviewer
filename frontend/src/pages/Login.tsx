import React, { useState } from "react";
import { Button, Stack, TextField, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Title from "../components/Title";
import axios from "axios";

const Login = () => {
  const [inputValues, setInputValues] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValues((prev) => {
      return {
        ...prev,
        [event.target.name]: event.target.value,
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:8080/auth/login",
        inputValues
      );
      const data = await res.data.data;
      localStorage.setItem("jwtToken", data.token);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="column" spacing={2} maxWidth="600px" margin="0 auto">
        <Title title="Login" />
        <TextField
          required
          label="Email Address"
          name="email"
          value={inputValues.email}
          onChange={handleChange}
        />
        <TextField
          required
          label="Password"
          type="password"
          name="password"
          value={inputValues.password}
          onChange={handleChange}
        />
        <Typography>
          {"If you want to create account, please click "}
          <Link to="/register">here</Link>
          {" ."}
        </Typography>
        <Button variant="contained" type="submit">
          Login
        </Button>
      </Stack>
    </form>
  );
};

export default Login;
