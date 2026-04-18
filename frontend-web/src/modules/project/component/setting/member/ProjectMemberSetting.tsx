import { useState } from "react";
import { Box, Typography, IconButton, Tooltip, Button, Chip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import { useGetProjectById } from "../../../api/get-project-id";
import { useGetCurrentUser } from "../../../../login/api/auth";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ROUTES } from "../../../../../routes/urls";
import LoadingPage from "../../../../../components/loading/LoadingPage";
import { MemberListTab } from "./MemberListTab";
import { JoinRequestTab } from "./JoinRequestTab";
import { useGetJoinRequests } from "../../../../project-invitation/api/get-join-requests";

type Tab = "members" | "requests";

export function ProjectMemberSettings() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();

  const defaultTab = searchParams.get("tab") === "requests" ? "requests" : "members";
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  const { data: project, isLoading } = useGetProjectById(projectId!);
  const { data: currentUser } = useGetCurrentUser();

  const members = project?.project_members || [];
  const isOwner = project?.owner_id === currentUser?.user_id;
  const isAdmin = members.some(
    (m: any) => Number(m.user_id) === Number(currentUser?.user_id) && m.role === "admin"
  );
  const canManage = isOwner || isAdmin;

  const { data: joinRequests = [] } = useGetJoinRequests(projectId!, canManage);
  const pendingCount = joinRequests.length;

  if (isLoading) return <LoadingPage />;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <Tooltip title="Quay lại">
          <IconButton onClick={() => navigate(ROUTES.projectDetail(projectId!))}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h5" fontWeight={600}>Quyền truy cập</Typography>
      </Box>

      <Box sx={{ display: "flex", borderBottom: "1px solid #e5e7eb", mb: 3 }}>
        {([
          { key: "members", label: "Thành viên", icon: <PeopleOutlinedIcon fontSize="small" />, badge: members.length },
          ...(canManage ? [{ key: "requests", label: "Yêu cầu tham gia", icon: <GroupAddOutlinedIcon fontSize="small" />, badge: pendingCount }] : []),
        ] as const).map((tab) => (
          <Button
            key={tab.key}
            startIcon={tab.icon}
            onClick={() => setActiveTab(tab.key as Tab)}
            sx={{
              textTransform: "none",
              fontSize: 14,
              color: activeTab === tab.key ? "#5663ee" : "#6b7280",
              borderBottom: activeTab === tab.key ? "2px solid #5663ee" : "2px solid transparent",
              borderRadius: 0,
              px: 2, py: 1.2,
              "&:hover": { bgcolor: "#f5f5f5", color: "#5663ee" },
            }}
          >
            {tab.label}
            {tab.badge > 0 && (
              <Chip
                label={tab.badge}
                size="small"
                sx={{
                  ml: 1, height: 18, fontSize: 11,
                  bgcolor: tab.key === "requests" && pendingCount > 0
                    ? "#fef3c7" : activeTab === tab.key ? "#e0e7ff" : "#f3f4f6",
                  color: tab.key === "requests" && pendingCount > 0
                    ? "#d97706" : activeTab === tab.key ? "#4f46e5" : "#6b7280",
                }}
              />
            )}
          </Button>
        ))}
      </Box>

      {activeTab === "members" ? (
        <MemberListTab
          projectId={projectId!}
          projectName={project?.name}
          members={members}
          ownerId={project?.owner_id}
          canManage={canManage}
        />
      ) : (
        <JoinRequestTab projectId={projectId!} />
      )}
    </Box>
  );
}

export default ProjectMemberSettings;
