import { Fragment } from "react";
import { Typography } from "@mui/material";

interface Props {
  content: string;
}

// Match @Tên\u200B (format mới) hoặc @[Tên] (backward compat)
export default function CommentContent({ content }: Props) {
  const parts = content.split(/(@[^\u200B@\n]+\u200B|@\[[^\]]+\])/g);

  return (
    <Typography
      component="span"
      sx={{ fontSize: 14, color: "#374151", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
    >
      {parts.map((part, i) => {
        const newFormat = part.match(/^@([^\u200B]+)\u200B$/);
        const oldFormat = part.match(/^@\[(.+)\]$/);
        const name = newFormat?.[1] ?? oldFormat?.[1];

        if (name) {
          return (
            <Typography
              key={i}
              component="span"
              sx={{
                color: "#2563eb",
                fontWeight: 600,
                bgcolor: "#eff6ff",
                borderRadius: "4px",
                px: 0.5,
                fontSize: "inherit",
              }}
            >
              @{name}
            </Typography>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </Typography>
  );
}
