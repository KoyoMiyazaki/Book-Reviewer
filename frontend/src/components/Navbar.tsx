import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "@mui/icons-material";
import {
  AppBar,
  Button,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../util/hooks";
import { logout } from "../slices/authSlice";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  return (
    <AppBar position="sticky">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <Menu />
        </IconButton>
        <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
          Book Review
        </Typography>
        {user ? (
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Typography variant="h6" component="p">
              Hello {user.name} !
            </Typography>
            <Button color="inherit" onClick={() => dispatch(logout())}>
              Logout
            </Button>
          </Stack>
        ) : (
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
