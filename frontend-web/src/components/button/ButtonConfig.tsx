import React from "react";
import { Button, CircularProgress } from "@mui/material";
import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import s from "./ButtonConfig.module.scss";

interface ButtonProps extends Omit<MuiButtonProps, "type" | "color"> {
  props?: MuiButtonProps;
  selected?: boolean;
  label?: React.ReactNode;
  onClick?: () => void;
  children?: React.ReactNode;
  loading?: boolean;
  htmlType?: "button" | "submit" | "reset";
  danger?: boolean;
  type?: "primary" | "default" | "text" | "link"; 
  styles?: any;
}

export const ButtonConfig: React.FC<ButtonProps> = ({
  props,
  label,
  children,
  onClick,
  htmlType,
  disabled,
  loading,
  danger,
  type,
  styles,
  size,
  className,
  ...otherProps
}) => {
  const isContained = type === "primary" || !type;
  const isOutlined = type === "default";
  
  const buttonColor = danger ? "error" : "primary";

  return (
    <Button
      variant={isContained ? "contained" : isOutlined ? "outlined" : "text"}
      color={buttonColor}
      disabled={disabled || loading}
      onClick={onClick}
      type={htmlType}
      size={size}
      className={`${s.buttonConfig} ${className || ""}`}
      sx={styles}
      {...otherProps}
    >
      {loading ? <CircularProgress size={24} /> : (label || children)}
    </Button>
  );
};