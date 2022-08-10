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
import axios, { AxiosError } from "axios";
import Title from "../components/Title";
import { useAppDispatch, useAppSelector } from "../util/hooks";
import { login, logout } from "../slices/authSlice";
import { UpdateAccountInput } from "../util/types";
import { setToast } from "../slices/toastSlice";
import { StatusCodes } from "http-status-codes";

const ProfileManager = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [inputValues, setInputValues] = useState<UpdateAccountInput>({
    password: "",
    newName: user?.name,
    newEmail: user?.email,
    newPassword: "",
  });
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [emailWhenDelete, setEmailWhenDelete] = useState<string>("");
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
      dispatch(
        setToast({
          message: "更新しました！",
          severity: "success",
        })
      );
      navigate("/");
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === StatusCodes.UNAUTHORIZED) {
          dispatch(
            setToast({
              message: "ログインしてください",
              severity: "error",
            })
          );
          dispatch(logout());
          navigate("/login");
        } else {
          dispatch(
            setToast({
              message: error.response?.data.error,
              severity: "error",
            })
          );
        }
      }
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
      dispatch(
        setToast({
          message: "削除しました！",
          severity: "success",
        })
      );
      navigate("/");
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === StatusCodes.UNAUTHORIZED) {
          dispatch(
            setToast({
              message: "ログインしてください",
              severity: "error",
            })
          );
          dispatch(logout());
          navigate("/login");
        } else {
          dispatch(
            setToast({
              message: error.response?.data.error,
              severity: "error",
            })
          );
        }
      }
    }
  };

  const handleClickOpen = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setEmailWhenDelete("");
    setDialogOpen(false);
  };

  return (
    <Stack direction="column" spacing={2} maxWidth="600px" margin="0 auto">
      {/* ユーザ更新 */}
      <form onSubmit={handleSubmit}>
        <Stack direction="column" spacing={2}>
          <Title title="アカウント編集" />
          <TextField
            required
            label="新しい名前"
            name="newName"
            value={inputValues.newName}
            onChange={handleChange}
          />
          <TextField
            required
            label="新しいメールアドレス"
            name="newEmail"
            value={inputValues.newEmail}
            onChange={handleChange}
          />
          <TextField
            required
            label="新しいパスワード"
            type="password"
            name="newPassword"
            value={inputValues.newPassword}
            onChange={handleChange}
          />
          <TextField
            required
            label="現在のパスワード"
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
            {"更新"}
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
        {"アカウントを削除"}
      </Button>

      {/* ダイアログ */}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"アカウント削除"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {
              "アカウントを削除するとあなたのレビュー内容などが全て削除されます。\n本当に削除しますか？"
            }
          </DialogContentText>
          <TextField
            required
            placeholder="削除する場合はメールアドレスを入力"
            name="email"
            value={emailWhenDelete}
            onChange={(e) => {
              setEmailWhenDelete(e.target.value);
            }}
            sx={{ width: "100%", marginTop: "1rem" }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            sx={{ textTransform: "none" }}
            autoFocus
          >
            {"削除しない"}
          </Button>
          <Button
            color="error"
            onClick={deleteAccount}
            disabled={user?.email !== emailWhenDelete}
            sx={{ textTransform: "none" }}
          >
            {"削除する"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default ProfileManager;
