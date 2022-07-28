import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Button,
  Grid,
  IconButton,
  InputBase,
  Paper,
  Stack,
  styled,
  Toolbar,
  Typography,
} from "@mui/material";
import { Home, Search } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../util/hooks";
import { logout } from "../slices/authSlice";

const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "white",
});

const Navbar = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [searchWord, setSearchWord] = useState<string>("");
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
          p: { md: "0.25rem 1rem", xs: "0.25rem" },
        }}
      >
        <Grid container alignItems="center">
          <Grid item xs={2} md={3}>
            <Typography
              variant="h6"
              component="h1"
              sx={{ display: { md: "block", xs: "none" } }}
            >
              <StyledLink to="/">Book Review</StyledLink>
            </Typography>
            <IconButton
              sx={{
                marginRight: "1rem",
                p: "10px",
                color: "white",
                display: { md: "none" },
              }}
              aria-label="search"
              component={Link}
              to="/"
            >
              <Home />
            </IconButton>
          </Grid>
          <Grid item xs={8} md={6}>
            {/* 検索欄 */}
            <Paper
              component="form"
              onSubmit={handleSearchWordSubmit}
              sx={{
                p: "1px 4px",
                display: "flex",
                alignItems: "center",
                width: "95%",
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
          </Grid>

          <Grid
            item
            xs={2}
            md={3}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            {user ? (
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Typography
                  variant="body1"
                  component="p"
                  fontWeight={600}
                  sx={{ display: { md: "block", xs: "none" } }}
                >
                  Hello, {user.name}!
                </Typography>
                <Button
                  color="inherit"
                  onClick={() => dispatch(logout())}
                  sx={{ fontSize: { sm: "16px", xs: "12px" } }}
                >
                  Logout
                </Button>
              </Stack>
            ) : (
              <Button
                color="inherit"
                sx={{ fontSize: { sm: "16px", xs: "12px" } }}
                component={Link}
                to="/login"
              >
                Login
              </Button>
            )}
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
