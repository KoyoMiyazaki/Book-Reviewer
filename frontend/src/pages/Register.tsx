import React, { useState } from "react";
import { Button, Stack, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Title from "../components/Title";
import { useAppDispatch } from "../util/hooks";
import { login } from "../slices/authSlice";
import { RegisterInput } from "../util/types";

const Register = () => {
  const [inputValues, setInputValues] = useState<RegisterInput>({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

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
        "http://localhost:8080/auth/register",
        inputValues
      );
      const data = await res.data.data;
      localStorage.setItem("jwtToken", data.token);
      dispatch(
        login({
          name: data.name,
          email: data.email,
        })
      );
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="column" spacing={2} maxWidth="600px" margin="0 auto">
        <Title title="Register" />
        <TextField
          required
          label="Name"
          name="name"
          value={inputValues.name}
          onChange={handleChange}
        />
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
        <TextField
          required
          label="Confirm Password"
          type="password"
          name="passwordConfirmation"
          value={inputValues.passwordConfirmation}
          onChange={handleChange}
        />
        <Button variant="outlined" type="submit" sx={{ textTransform: "none" }}>
          Register
        </Button>
      </Stack>
    </form>
  );
};

export default Register;
