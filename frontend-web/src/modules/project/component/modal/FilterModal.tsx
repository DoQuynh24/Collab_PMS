import { useState } from "react";
import {
  Box,
  Typography,
  Popover,
  TextField,
  Checkbox,
  InputAdornment,
  Avatar,
  Divider,
  Button,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { FILTER_TABS, PRIORITIES } from "../../../../constant";

interface ProjectMember {
  user_id: number;
  user?: { name?: string; picture?: string; email?: string };
}

interface TaskStatus {
  id: number;
  name: string;
}

export interface FilterValues {
  assignees: number[];
  priorities: number[];
  statuses: number[];
}

interface Props {
  projectMembers: ProjectMember[];
  statuses: TaskStatus[];
  onFilterChange: (filters: FilterValues) => void;
}

export function FilterModal({ projectMembers, statuses, onFilterChange }: Props) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [activeTab, setActiveTab] = useState("assignee");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAssignees, setSelectedAssignees] = useState<number[]>([]);
    const [selectedPriorities, setSelectedPriorities] = useState<number[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<number[]>([]);

    const open = Boolean(anchorEl);

    const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);

    const handleClose = () => {
        setAnchorEl(null);
        setSearchTerm("");
    };

    const handleReset = () => {
        setSelectedAssignees([]);
        setSelectedPriorities([]);
        setSelectedStatuses([]);
        onFilterChange({ assignees: [], priorities: [], statuses: [] });
    };

    const handleApply = () => {
        onFilterChange({
        assignees: selectedAssignees,
        priorities: selectedPriorities,
        statuses: selectedStatuses,
        });
        handleClose();
    };

    const toggle = <T,>(list: T[], item: T): T[] =>
        list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

    const filteredMembers = projectMembers.filter(
        (m) =>
        m.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredStatuses = statuses.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const countByTab: Record<string, number> = {
    assignee: selectedAssignees.length,
    priority: selectedPriorities.length,
    status: selectedStatuses.length,
    };

    const activeCount = selectedAssignees.length + selectedPriorities.length + selectedStatuses.length;

    return (
        <>
        <IconButton
            onClick={handleOpen}
            sx={{
            border: "1px solid",
            borderRadius: "6px",
            padding: "5px",
            gap: "5px",
            bgcolor: activeCount > 0 ? "#eef0ff" : "transparent",
            borderColor: activeCount > 0 ? "#5663ee" : "#d3d3d3",
            }}
        >
            <FilterListIcon sx={{ color: activeCount > 0 ? "#5663ee" : "#545454" }} />
            <Typography fontSize={14} color={activeCount > 0 ? "#5663ee" : "#545454"}>
            Bộ lọc {activeCount > 0 ? `(${activeCount})` : ""}
            </Typography>
        </IconButton>

        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            PaperProps={{
            sx: {
                width: 520,
                height: 400,
                borderRadius: "10px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            },
            }}
        >
            <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
            <Box sx={{ width: 160, borderRight: "1px solid #e5e7eb", py: 1, flexShrink: 0 }}>
                {FILTER_TABS.map((tab) => {
                const count = countByTab[tab.key] ?? 0
                return (
                    <Box
                    key={tab.key}
                    onClick={() => { setActiveTab(tab.key); setSearchTerm(""); }}
                    sx={{
                        px: 2, py: 1, cursor: "pointer", fontSize: 13,
                        fontWeight: activeTab === tab.key ? 600 : 400,
                        color: activeTab === tab.key ? "#5663ee" : "#374151",
                        bgcolor: activeTab === tab.key ? "#eef0ff" : "transparent",
                        borderLeft: activeTab === tab.key ? "2px solid #5663ee" : "2px solid transparent",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        "&:hover": { bgcolor: "#f4f5f7" },
                    }}
                    >
                    {tab.label}
                    {count > 0 && (
                        <Box sx={{
                        width: 18, height: 18, borderRadius: "50%",
                        bgcolor: "#5663ee", color: "#fff",
                        fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                        {count}
                        </Box>
                    )}
                    </Box>
                );
                })}
            </Box>

            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <Box sx={{ px: 2, pt: 1.5, pb: 1, flexShrink: 0 }}>
                <TextField
                    size="small" fullWidth
                    placeholder={FILTER_TABS.find((t) => t.key === activeTab)?.placeholder ?? ""}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: "#9ca3af" }} />
                        </InputAdornment>
                    ),
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", fontSize: 13 } }}
                />
                </Box>

                <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", px: 2 }}>
                {activeTab === "assignee" && (
                    <>
                    <FormControlLabel
                        control={
                        <Checkbox size="small"
                            checked={selectedAssignees.includes(-1)}
                            onChange={() => setSelectedAssignees(toggle(selectedAssignees, -1))}
                            sx={{ color: "#9ca3af", "&.Mui-checked": { color: "#5663ee" } }}
                        />
                        }
                        label={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: "#e5e7eb", fontSize: 11 }}>?</Avatar>
                            <Typography fontSize={13}>Chưa phân công</Typography>
                        </Box>
                        }
                        sx={{ ml: 0, mb: 0.5, width: "100%" }}
                    />
                    {filteredMembers.map((member) => (
                        <FormControlLabel
                        key={member.user_id}
                        control={
                            <Checkbox size="small"
                            checked={selectedAssignees.includes(member.user_id)}
                            onChange={() => setSelectedAssignees(toggle(selectedAssignees, member.user_id))}
                            sx={{ color: "#9ca3af", "&.Mui-checked": { color: "#5663ee" } }}
                            />
                        }
                        label={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Avatar src={member.user?.picture} sx={{ width: 24, height: 24, fontSize: 11 }}>
                                {member.user?.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography fontSize={13}>{member.user?.name}</Typography>
                                <Typography fontSize={11} color="#9ca3af">{member.user?.email}</Typography>
                            </Box>
                            </Box>
                        }
                        sx={{ ml: 0, mb: 0.5, width: "100%" }}
                        />
                    ))}
                    </>
                )}

                {activeTab === "priority" && (
                    <>
                    {PRIORITIES.filter((p) =>
                        p.name.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((priority) => (
                        <FormControlLabel
                        key={priority.id}
                        control={
                            <Checkbox size="small"
                            checked={selectedPriorities.includes(priority.id)}
                            onChange={() => setSelectedPriorities(toggle(selectedPriorities, priority.id))}
                            sx={{ color: "#9ca3af", "&.Mui-checked": { color: "#5663ee" } }}
                            />
                        }
                        label={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: priority.color }} />
                            <Typography fontSize={13}>{priority.name}</Typography>
                            </Box>
                        }
                        sx={{ ml: 0, mb: 0.5, width: "100%" }}
                        />
                    ))}
                    </>
                )}

                {activeTab === "status" && (
                    <>
                    {filteredStatuses.map((status) => (
                        <FormControlLabel
                        key={status.id}
                        control={
                            <Checkbox size="small"
                            checked={selectedStatuses.includes(status.id)}
                            onChange={() => setSelectedStatuses(toggle(selectedStatuses, status.id))}
                            sx={{ color: "#9ca3af", "&.Mui-checked": { color: "#5663ee" } }}
                            />
                        }
                        label={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{
                                px: 1, py: 0.3, borderRadius: "4px",
                                bgcolor: "#e5e7eb", fontSize: 12, fontWeight: 600,
                                color: "#374151",
                            }}>
                                {status.name.toUpperCase()}
                            </Box>
                            </Box>
                        }
                        sx={{ ml: 0, mb: 0.5, width: "100%" }}
                        />
                    ))}
                    </>
                )}
                </Box>
            </Box>
            </Box>

            <Divider />
            <Box sx={{ px: 2, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <Typography fontSize={12} color="#9ca3af">
                {activeCount > 0 ? `${activeCount} bộ lọc đang áp dụng` : "Chưa có bộ lọc nào"}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
                <Button size="small" onClick={handleReset} disabled={activeCount === 0}
                sx={{ fontSize: 12, color: "#6b7280", textTransform: "none", borderRadius: "6px" }}>
                Xóa tất cả
                </Button>
                <Button size="small" variant="contained" onClick={handleApply}
                sx={{ fontSize: 12, bgcolor: "#5663ee", "&:hover": { bgcolor: "#4451d4" }, textTransform: "none", borderRadius: "6px" }}>
                Áp dụng
                </Button>
            </Box>
            </Box>
        </Popover>
        </>
    );
}