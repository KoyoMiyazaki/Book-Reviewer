import React from "react";
import { Button, Stack, TextField } from "@mui/material";
import Title from "../components/Title";

const Register = () => {
  console.log("Register rendered");
  return (
    <Stack direction="column" spacing={2} maxWidth="600px" margin="0 auto">
      <Title title="Register" />
      <TextField required label="Name" />
      <TextField required label="Email Address" />
      <TextField required label="Password" type="password" />
      <TextField required label="Confirm Password" type="password" />
      <Button variant="contained">Register</Button>
    </Stack>
  );
};

export default Register;
