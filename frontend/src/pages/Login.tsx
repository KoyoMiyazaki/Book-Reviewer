import React from "react";
import { Button, Stack, TextField, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import Title from "../components/Title";

const Login = () => {
  return (
    <Stack direction="column" spacing={2} maxWidth="600px" margin="0 auto">
      <Title title="Login" />
      <TextField required label="Email Address" />
      <TextField required label="Password" type="password" />
      <Typography>
        {"If you want to create account, please click "}
        <Link to="/register">here</Link>
        {" ."}
      </Typography>
      <Button variant="contained">Login</Button>
    </Stack>
  );
};

export default Login;
