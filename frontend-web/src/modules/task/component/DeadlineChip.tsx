import { Box, Tooltip } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

interface Props {
  deadline?: string | null;
  isDone?: boolean;
}

export default function DeadlineChip({ deadline, isDone }: Props) {
  if (!deadline) return null;

  const date = new Date(deadline);
  date.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isOverdue = !isDone && date < today;
  const isToday = date.getTime() === today.getTime();

  const formatted = date.toLocaleDateString("vi-VN", { month: "short", day: "numeric" });

  return (
    <Tooltip title={isOverdue ? "Đã quá hạn" : "Hạn hoàn thành"} arrow>
        <Box
            display="inline-flex"
            alignItems="center"
            gap={0.5}
            sx={{
            fontSize: "1rem",
            color: isOverdue ? "#d32f2f" : isToday ? "#d97706" : "#73a030",
            bgcolor: isOverdue ? "#ffebee" : isToday ? "#fffbeb" : "#e8f5e9",
            px: 1, py: 0.3,
            borderRadius: "4px",
            border: isOverdue ? "1px solid #ef5350" : "none",
            }}
        >
            <CalendarTodayIcon fontSize="inherit" />
            <span style={{ fontSize: "13px" }}>{formatted}</span>
        </Box>
    </Tooltip>
  );
}