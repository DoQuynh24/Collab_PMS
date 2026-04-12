import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import {
  Box,
  TextField,
  Paper,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
} from "@mui/material";
import type { ICommentUser } from "../type/index";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  members: ICommentUser[];
  minRows?: number;
  size?: "small" | "medium";
}

export default function MentionInput({
  value,
  onChange,
  placeholder,
  members,
  minRows = 2,
  size = "medium",
}: Props) {
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState<number>(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const filtered = mentionQuery !== null
    ? members.filter((m) =>
        m.name.toLowerCase().includes(mentionQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {    const newVal = e.target.value;
    const cursor = e.target.selectionStart ?? newVal.length;

    const textBeforeCursor = newVal.slice(0, cursor);
    const atIndex = textBeforeCursor.lastIndexOf("@");

    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(atIndex + 1);
      if (
        !textAfterAt.includes("\u200B") &&
        !textAfterAt.includes(" ") &&
        !textAfterAt.includes("\n")
      ) {
        setMentionQuery(textAfterAt);
        setMentionStart(atIndex);
        setSelectedIndex(0);
        onChange(newVal);
        return;
      }
    }

    setMentionQuery(null);
    setMentionStart(-1);
    onChange(newVal);
  };

  const insertMention = (member: ICommentUser) => {
    const before = value.slice(0, mentionStart);
    const after = value.slice(mentionStart + 1 + (mentionQuery?.length ?? 0));
    const mention = `@${member.name}\u200B `;
    const newVal = `${before}${mention}${after}`;
    onChange(newVal);
    setMentionQuery(null);
    setMentionStart(-1);

    setTimeout(() => {
      if (inputRef.current) {
        const pos = before.length + mention.length;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(pos, pos);
      }
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (mentionQuery === null || filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      insertMention(filtered[selectedIndex]);
    } else if (e.key === "Escape") {
      setMentionQuery(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setMentionQuery(null);
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Box sx={{ position: "relative" }} onMouseDown={(e) => e.stopPropagation()}>
      <TextField
        fullWidth
        multiline
        minRows={minRows}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        variant="outlined"
        size={size}
        inputRef={inputRef}
      />

      {mentionQuery !== null && filtered.length > 0 && (
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            bottom: "100%",
            left: 0,
            mb: 0.5,
            width: 260,
            zIndex: 1300,
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          <Box sx={{ px: 1.5, py: 0.75, bgcolor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
            <Typography fontSize={11} color="#6b7280" fontWeight={600}>
              THÀNH VIÊN DỰ ÁN
            </Typography>
          </Box>
          <List dense disablePadding>
            {filtered.map((member, idx) => (
              <ListItemButton
                key={member.user_id}
                selected={idx === selectedIndex}
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertMention(member);
                }}
                sx={{
                  py: 0.75,
                  "&.Mui-selected": { bgcolor: "#eff6ff" },
                  "&:hover": { bgcolor: "#f3f4f6" },
                }}
              >
                <ListItemAvatar sx={{ minWidth: 36 }}>
                  <Avatar src={member.picture} sx={{ width: 26, height: 26, fontSize: 11 }}>
                    {member.name.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={member.name}
                  secondary={member.email}
                  primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
                  secondaryTypographyProps={{ fontSize: 11, noWrap: true }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
