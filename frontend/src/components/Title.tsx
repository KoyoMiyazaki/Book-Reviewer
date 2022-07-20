import { Typography } from "@mui/material";
import React from "react";

export interface TitleProps {
  title: string;
}

const Title = ({ title }: TitleProps) => {
  return (
    <Typography
      variant="h5"
      component="h2"
      sx={{ flexGrow: 1 }}
      fontWeight={500}
    >
      {title}
    </Typography>
  );
};

export default Title;
