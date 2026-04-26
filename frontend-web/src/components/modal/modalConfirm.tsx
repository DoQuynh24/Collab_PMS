import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined"; 
import styles from "./modalConfirm.module.scss";

interface ModalConfirmProps {
  ComponentElement?: React.ComponentType;
  title?: string;
  titleButton?: string;
  cancelButtonText?: string;
  message?: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  onClick?: () => void;
  showCancelButton?: boolean;
  confirmButtonProps?: React.ComponentProps<typeof Button>;
  cancelButtonProps?: React.ComponentProps<typeof Button>;
  children?: React.ReactNode;
  isArchive?: boolean;   
  isDelete?: boolean;
}

export function ModalConfirm({
  ComponentElement,
  title,
  message,
  open,
  setOpen,
  onClick,
  titleButton = "Confirm",
  cancelButtonText = "Cancel",
  showCancelButton = true,
  confirmButtonProps,
  cancelButtonProps,
  children,
  isArchive = false,
  isDelete = false,
}: ModalConfirmProps) {
  const handleClose = () => setOpen(false);

  const handleConfirm = () => {
    onClick?.();
    handleClose();
  };

  return (
    <>
      {ComponentElement && <ComponentElement />}

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: styles.modalContent,
        }}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "flex-start",  
            pt: "80px",                
          },
        }}
      >
        <DialogTitle className={styles.modalHeader}>
          <div className={styles.titleWrapper}>
            {isArchive && <WarningAmberIcon className={styles.warningIcon} />}
            {isDelete && (<ReportProblemOutlinedIcon className={styles.reportIcon} />)}
            <Typography variant="h6" fontWeight={500} color="#1f2937">
              {title || "Xác nhận"}
            </Typography>
          </div>
          <IconButton onClick={handleClose} size="small" className={styles.closeButton}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent className={styles.modalBody}>
          {children ? (
            children
          ) : (
            <Typography variant="body1" color="#4b5563" sx={{ lineHeight: 1.6, pt: 1 }}>
              {message}
            </Typography>
          )}
        </DialogContent>

        <DialogActions className={styles.modalFooter}>
          {showCancelButton && (
            <Button
              variant="outlined"
              onClick={handleClose}
              className={styles.cancelButton}
              {...cancelButtonProps}
            >
              {cancelButtonText}
            </Button>
          )}

          <Button
            variant="contained"
            onClick={handleConfirm}
            className={isArchive ? styles.archiveButton : styles.confirmButton}
            {...confirmButtonProps}
          >
            {titleButton}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}