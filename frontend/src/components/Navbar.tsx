import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  InputBase,
  Paper,
  Stack,
  styled,
  Toolbar,
  Typography,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../util/hooks";
import { logout } from "../slices/authSlice";

const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "white",
});

const Navbar = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [searchWord, setSearchWord] = useState("");
  const navigate = useNavigate();

  const handleSearchWordInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchWord(event.target.value);
  };

  const handleSearchWordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchWord === "") {
      return false;
    } else {
      navigate(`/search?q=${searchWord}`);
      return true;
    }
  };

  return (
    <AppBar position="sticky">
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={10}>
          <Typography variant="h6" component="h1">
            <StyledLink to="/">Book Review</StyledLink>
          </Typography>
          {/* 検索欄 */}
          <Paper
            component="form"
            onSubmit={handleSearchWordSubmit}
            sx={{
              p: "1px 4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1, width: { xs: "120px", sm: "240px" } }}
              placeholder="Search Book"
              inputProps={{ "aria-label": "search book" }}
              name="q"
              value={searchWord}
              onInput={handleSearchWordInput}
              required
            />
            <IconButton type="submit" sx={{ p: "10px" }} aria-label="search">
              <Search />
            </IconButton>
          </Paper>
        </Stack>
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
