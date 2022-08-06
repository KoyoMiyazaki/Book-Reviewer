import React from "react";
import { useAppDispatch, useAppSelector } from "../util/hooks";
import { Alert, Snackbar } from "@mui/material";
import { closeToast } from "../slices/toastSlice";

const Toast = () => {
  const isToastOpen = useAppSelector((state) => state.toast.isOpen);
  const toastMessage = useAppSelector((state) => state.toast.message);
  const toastSeverity = useAppSelector((state) => state.toast.severity);
  const dispatch = useAppDispatch();

  return (
    <Snackbar
      open={isToastOpen}
      autoHideDuration={6000}
      onClose={() => dispatch(closeToast())}
    >
      <Alert severity={toastSeverity} sx={{ width: "100%" }}>
        {toastMessage}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
