import { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  Stack,
  Button,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useAddStatus } from "../api/add-task-status";

interface Props {
  projectId: string;
}

export function AddStatusColumn({ projectId }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: addStatus, isPending } = useAddStatus();

  useEffect(() => {
    if (adding) setTimeout(() => inputRef.current?.focus(), 50);
  }, [adding]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    addStatus(
      { project_id: projectId, name: trimmed },
      {
        onSuccess: () => {
          setName("");
          setAdding(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setName("");
    setAdding(false);
  };

  if (!adding) {
    return (
      <Box
        onClick={() => setAdding(true)}
        sx={{ cursor: "pointer" }}
      >
        <Tooltip title="Thêm trạng thái">
            <AddIcon />
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 260,
        flexShrink: 0,
        background: "#f4f5f7",
        borderRadius: "8px",
        padding: "12px",
      }}
    >
      <TextField
        inputRef={inputRef}
        size="small"
        fullWidth
        placeholder="Tên cột mới..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isPending}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); handleSubmit(); }
          if (e.key === "Escape") { handleCancel(); }
        }}
        sx={{
          mb: 1,
          "& .MuiOutlinedInput-root": {
            bgcolor: "#fff",
            borderRadius: "6px",
            fontSize: 14,
            "& fieldset": { borderColor: "#5663ee" },
          },
        }}
      />
      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          variant="contained"
          onClick={handleSubmit}
          disabled={!name.trim() || isPending}
          startIcon={
            isPending
              ? <CircularProgress size={14} sx={{ color: "#fff" }} />
              : <CheckIcon fontSize="small" />
          }
          sx={{
            bgcolor: "#5663ee",
            "&:hover": { bgcolor: "#4451d4" },
            borderRadius: "6px",
            textTransform: "none",
            fontSize: 13,
          }}
        >
          Thêm
        </Button>
        <Button
          size="small"
          onClick={handleCancel}
          disabled={isPending}
          startIcon={<CloseIcon fontSize="small" />}
          sx={{ color: "#6b7280", borderRadius: "6px", textTransform: "none", fontSize: 13 }}
        >
          Hủy
        </Button>
      </Stack>
    </Box>
  );
}