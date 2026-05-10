import {
  Box, Typography, Avatar, Chip, Stack, Divider, CircularProgress,
} from '@mui/material';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import { useNavigate } from 'react-router-dom';
import { useGetCurrentUser } from '../login/api/auth';
import { useGetProjects } from '../project/api/get-project';
import { useGetAssignedTasks } from '../task/api/get-assigned-tasks';
import { useGetProjectById } from '../project/api/get-project-id';
import { getProjectColor } from '../../utils/projectColor';
import { ROUTES } from '../../routes/urls';
import { PRIORITIES } from '../../constant';
import styles from './Home.module.scss';
import TaskDetailModal from '../task/TaskDetailModal';
import type { ITask } from '../task/types';
import { useState } from 'react';

function TaskDetailWrapper({ task, onClose }: { task: ITask; onClose: () => void }) {
  const { data: project } = useGetProjectById(task.project_id);
  const members = project?.project_members ?? [];
  return (
    <TaskDetailModal
      open
      onClose={onClose}
      task={task}
      projectMembers={members}
      projectId={task.project_id}
      projectOwnerId={project?.owner_id}
    />
  );
}

export function Home() {
  const navigate = useNavigate();
  const { data: user } = useGetCurrentUser();
  const { data: projects = [], isLoading: loadingProjects } = useGetProjects();
  const { data: assignedTasks = [], isLoading: loadingTasks } = useGetAssignedTasks();

  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const overdueTasks = assignedTasks.filter(
    (t) => {
      if (!t.deadline || t.is_done) return false;
      const d = new Date(t.deadline);
      d.setHours(0, 0, 0, 0);
      return d < now;
    }
  );
  const inProgressTasks = assignedTasks.filter((t) => !t.is_done);

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return 'Chào buổi sáng';
    if (h < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <>
    <Box className={styles.container}>
      <Box className={styles.left}>
        <Box className={styles.greeting}>
          <Avatar src={user?.picture} sx={{ width: 48, height: 48, fontSize: 18, fontWeight: 700 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography fontSize={22} fontWeight={700} color="#111827">
              {greeting()}, {user?.name?.split(' ').pop()} 👋
            </Typography>
            <Typography fontSize={14} color="#6b7280">
              Đây là tổng quan công việc của bạn hôm nay.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box className={styles.sectionHeader}>
            <Typography fontSize={15} fontWeight={600} color="#111827">Dự án của tôi</Typography>
            <Typography className={styles.sectionCount}>{projects.length} dự án</Typography>
          </Box>

          {loadingProjects ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
          ) : projects.length === 0 ? (
            <Box className={styles.emptyBox}>
              <Typography fontSize={14} color="#9ca3af">Bạn chưa tham gia dự án nào.</Typography>
            </Box>
          ) : (
            <Box className={styles.projectGrid}>
              {projects.map((project) => {
                const color = getProjectColor(project.project_id);
                return (
                  <Box
                    key={project.project_id}
                    className={styles.projectCard}
                    onClick={() => navigate(ROUTES.projectBoard(project.project_id))}
                  >
                    <Box className={styles.projectCardInner}>
                      <Avatar variant="rounded" sx={{ width: 32, height: 32, fontSize: 13, fontWeight: 700, bgcolor: color.bg, color: color.text, borderRadius: '6px', flexShrink: 0 }}>
                        {project.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontSize={13} fontWeight={600} color="#111827" noWrap>{project.name}</Typography>
                        <Typography fontSize={11} color="#9ca3af">
                          {project.access === 'private' ? '🔒 Riêng tư' : '🌐 Công khai'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        <Box>
          <Box className={styles.sectionHeader}>
            <Typography fontSize={15} fontWeight={600} color="#111827">Nhiệm vụ được giao cho tôi</Typography>
            <Typography className={styles.sectionCount}>{assignedTasks.length} nhiệm vụ</Typography>
          </Box>

          {loadingTasks ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
          ) : assignedTasks.length === 0 ? (
            <Box className={styles.emptyBox}>
              <Typography fontSize={14} color="#9ca3af">Không có nhiệm vụ nào được giao cho bạn.</Typography>
            </Box>
          ) : (
            <Box className={styles.taskList}>
              {assignedTasks.slice(0, 8).map((task, idx) => {
                const priority = PRIORITIES.find((p) => p.id === task.priority_id);
                const isOverdue = task.deadline && !task.is_done && (() => {
                  const d = new Date(task.deadline!);
                  d.setHours(0, 0, 0, 0);
                  return d < now;
                })();
                const projectColor = getProjectColor(task.project_id);
                const projectName = projects.find(p => p.project_id === task.project_id)?.name ?? task.project_id;

                return (
                  <Box key={task.task_id}>
                    {idx > 0 && <Divider />}
                    <Box
                      className={styles.taskRow}
                      onClick={() => setSelectedTask(task)}
                    >
                      <Avatar variant="rounded" sx={{ width: 24, height: 24, fontSize: 10, fontWeight: 700, bgcolor: projectColor.bg, color: projectColor.text, borderRadius: '4px', flexShrink: 0 }}>
                        {task.project_id.charAt(0)}
                      </Avatar>

                      <Box className={styles.taskInfo}>
                        <Typography fontSize={13} fontWeight={500} color="#111827" noWrap>{task.title}</Typography>
                        <Typography fontSize={11} color="#9ca3af" noWrap>{projectName}</Typography>
                      </Box>

                      {task.status && (
                        <Chip label={task.status.name} size="small" sx={{ fontSize: 11, height: 20, bgcolor: '#f3f4f6', color: '#374151', flexShrink: 0 }} />
                      )}

                      {priority && (
                        <Chip label={priority.name} size="small" sx={{ fontSize: 11, height: 20, bgcolor: `${priority.color}20`, color: priority.color, fontWeight: 600, flexShrink: 0 }} />
                      )}

                      {task.deadline && (
                        <Box className={styles.deadline}>
                          <AccessTimeOutlinedIcon sx={{ fontSize: 13, color: isOverdue ? '#ef4444' : '#9ca3af' }} />
                          <Typography fontSize={11} color={isOverdue ? '#ef4444' : '#9ca3af'}>
                            {new Date(task.deadline).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      <Box className={styles.right}>
        <Box className={styles.statsCard}>
          <Box className={styles.statsHeader}>
            <Typography fontSize={14} fontWeight={600} color="#111827">Tổng quan</Typography>
          </Box>
          <Stack divider={<Divider />}>
            <Box className={styles.statRow}>
              <FolderOutlinedIcon sx={{ color: '#5663ee', fontSize: 20 }} />
              <Typography fontSize={13} color="#374151" flex={1}>Dự án</Typography>
              <Typography fontSize={16} fontWeight={700} color="#5663ee">{projects.length}</Typography>
            </Box>
            <Box className={styles.statRow}>
              <TaskAltOutlinedIcon sx={{ color: '#059669', fontSize: 20 }} />
              <Typography fontSize={13} color="#374151" flex={1}>Đang làm</Typography>
              <Typography fontSize={16} fontWeight={700} color="#059669">{inProgressTasks.length}</Typography>
            </Box>
            <Box className={styles.statRow}>
              <WarningAmberOutlinedIcon sx={{ color: '#ef4444', fontSize: 20 }} />
              <Typography fontSize={13} color="#374151" flex={1}>Quá hạn</Typography>
              <Typography fontSize={16} fontWeight={700} color="#ef4444">{overdueTasks.length}</Typography>
            </Box>
          </Stack>
        </Box>

        {overdueTasks.length > 0 && (
          <Box className={styles.overdueCard}>
            <Box className={styles.overdueHeader}>
              <WarningAmberOutlinedIcon sx={{ color: '#ef4444', fontSize: 18 }} />
              <Typography fontSize={14} fontWeight={600} color="#dc2626">
                Quá hạn ({overdueTasks.length})
              </Typography>
            </Box>
            <Stack divider={<Divider sx={{ borderColor: '#fecaca' }} />}>
              {overdueTasks.slice(0, 4).map((task) => (
                <Box
                  key={task.task_id}
                  className={styles.overdueRow}
                  onClick={() => navigate(ROUTES.projectBoard(task.project_id))}
                >
                  <Typography fontSize={12} fontWeight={500} color="#111827" noWrap>{task.title}</Typography>
                  <Typography fontSize={11} color="#ef4444">
                    Hạn: {new Date(task.deadline!).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Box>

    </Box>

    {selectedTask && (
      <TaskDetailWrapper task={selectedTask} onClose={() => setSelectedTask(null)} />
    )}
  </>
  );
}

export default Home;
