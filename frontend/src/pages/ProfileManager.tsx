import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import axios from "axios";
import Title from "../components/Title";
import { useAppDispatch, useAppSelector } from "../util/hooks";
import { login, logout } from "../slices/authSlice";
import { UpdateAccountInput } from "../util/types";

const ProfileManager = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [inputValues, setInputValues] = useState<UpdateAccountInput>({
    password: "",
    newName: user?.name,
    newEmail: user?.email,
    newPassword: "",
  });
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
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

  const deleteAccount = async () => {
    const token: string | null = localStorage.getItem("jwtToken");
    try {
      const res = await axios.delete("http://localhost:8080/auth/account", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDialogOpen(false);
      dispatch(logout());
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const handleClickOpen = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  return (
    <Stack direction="column" spacing={2} maxWidth="600px" margin="0 auto">
      {/* ユーザ更新 */}
      <form onSubmit={handleSubmit}>
        <Stack direction="column" spacing={2}>
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
          <Button
            variant="outlined"
            type="submit"
            sx={{ textTransform: "none" }}
          >
            Update Account
          </Button>
        </Stack>
      </form>

      {/* ユーザ削除 */}
      <Button
        color="error"
        variant="contained"
        onClick={handleClickOpen}
        sx={{ textTransform: "none" }}
      >
        Delete Account
      </Button>

      {/* ダイアログ */}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {"Are you sure you want to delete your account?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            sx={{ textTransform: "none" }}
            autoFocus
          >
            Cancel
          </Button>
          <Button
            color="error"
            onClick={deleteAccount}
            sx={{ textTransform: "none" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default ProfileManager;
