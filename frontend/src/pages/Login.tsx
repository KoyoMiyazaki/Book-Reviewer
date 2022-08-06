import React, { useState } from "react";
import { Button, Stack, TextField, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Title from "../components/Title";
import { useAppDispatch } from "../util/hooks";
import { login } from "../slices/authSlice";
import { LoginInput } from "../util/types";

const Login = () => {
  const [inputValues, setInputValues] = useState<LoginInput>({
    email: "",
    password: "",
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
        "http://localhost:8080/auth/login",
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
        <Title title="ログイン" />
        <TextField
          required
          label="メールアドレス"
          name="email"
          value={inputValues.email}
          onChange={handleChange}
        />
        <TextField
          required
          label="パスワード"
          type="password"
          name="password"
          value={inputValues.password}
          onChange={handleChange}
        />
        <Typography>
          {"アカウントを作成する場合は"}
          <Link to="/register">{"こちら"}</Link>
          {"をクリックしてください"}
        </Typography>
        <Button variant="outlined" type="submit" sx={{ textTransform: "none" }}>
          {"ログイン"}
        </Button>
      </Stack>
    </form>
  );
};

export default Login;
