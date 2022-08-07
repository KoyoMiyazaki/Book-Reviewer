import React, { useState } from "react";
import { Button, Stack, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import Title from "../components/Title";
import { useAppDispatch } from "../util/hooks";
import { login } from "../slices/authSlice";
import { setToast } from "../slices/toastSlice";
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
      dispatch(
        setToast({
          message: "ようこそ！",
          severity: "success",
        })
      );
      navigate("/");
    } catch (error) {
      if (error instanceof AxiosError) {
        dispatch(
          setToast({
            message: error.response?.data.error,
            severity: "error",
          })
        );
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="column" spacing={2} maxWidth="600px" margin="0 auto">
        <Title title="アカウント登録" />
        <TextField
          required
          label="名前"
          name="name"
          value={inputValues.name}
          onChange={handleChange}
        />
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
        <TextField
          required
          label="パスワード(確認用)"
          type="password"
          name="passwordConfirmation"
          value={inputValues.passwordConfirmation}
          onChange={handleChange}
        />
        <Button variant="outlined" type="submit" sx={{ textTransform: "none" }}>
          {"登録"}
        </Button>
      </Stack>
    </form>
  );
};

export default Register;
