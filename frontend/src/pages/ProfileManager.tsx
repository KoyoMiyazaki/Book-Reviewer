import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Stack, TextField } from "@mui/material";
import axios from "axios";
import Title from "../components/Title";
import { useAppDispatch, useAppSelector } from "../util/hooks";
import { login } from "../slices/authSlice";
import { UpdateAccountInput } from "../util/types";

const ProfileManager = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [inputValues, setInputValues] = useState<UpdateAccountInput>({
    password: "",
    newName: user?.name,
    newEmail: user?.email,
    newPassword: "",
  });
  console.log(user);
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
      const token: string | null = localStorage.getItem("jwtToken");
      const res = await axios.patch(
        "http://localhost:8080/auth/account",
        inputValues,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
        <Title title="Update Account" />
        <TextField
          required
          label="New Name"
          name="newName"
          value={inputValues.newName}
          onChange={handleChange}
        />
        <TextField
          required
          label="New Email Address"
          name="newEmail"
          value={inputValues.newEmail}
          onChange={handleChange}
        />
        <TextField
          required
          label="New Password"
          type="password"
          name="newPassword"
          value={inputValues.newPassword}
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
        <Button variant="contained" type="submit">
          Update Account
        </Button>
      </Stack>
    </form>
  );
};

export default ProfileManager;
