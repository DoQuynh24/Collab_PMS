import { Box, Typography, Avatar, Chip, Stack, Tooltip } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useGetProjectById } from './api/get-project-id';
import { useGetTasksByProject } from '../task/api/get-task-by-project';
import { useGetProjectTaskStatuses } from '../task-status/api/get-project-task-status';
import { ProjectHeader } from './component/ProjectHeader';
import { ProjectNav } from './component/ProjectNav';
import { SectionCard } from './component/overview/SectionCard';
import { ProgressBar } from './component/overview/ProgressBar';
import LoadingPage from '../../components/loading/LoadingPage';
import { PRIORITIES, getMemberRoleLabel } from '../../constant';
import { calcPercent } from '../../utils/projectColor';
import styles from './ProjectOverview.module.scss';

const WORKLOAD_LEGEND = [
  { color: '#d1d5db', label: 'Chưa hoàn thành' },
  { color: '#059669', label: 'Hoàn thành' },
];

export default function ProjectOverview() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useGetProjectById(projectId!);
  const { data: tasks = [] } = useGetTasksByProject(projectId!);
  const { data: statusData } = useGetProjectTaskStatuses(projectId!);

  if (isLoading) return <LoadingPage />;

  const statuses = statusData?.data ?? [];
  const members = project?.project_members ?? [];
  const now = new Date();
  const total = tasks.length;

  const lastStatus = statuses.length > 0
    ? statuses.reduce((a, b) => a.order_index > b.order_index ? a : b)
    : null;

  const done = lastStatus ? tasks.filter(t => t.status_id === lastStatus.id).length : 0;
  const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < now && t.status_id !== lastStatus?.id).length;
  const progress = calcPercent(done, total);

  const tasksByStatus = statuses.map(s => ({ ...s, count: tasks.filter(t => t.status_id === s.id).length }));
  const tasksByPriority = PRIORITIES.map(p => ({ ...p, count: tasks.filter(t => t.priority_id === p.id).length }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minWidth: 0 }}>
      <ProjectHeader projectName={project?.name} projectId={projectId} />
      <ProjectNav projectId={projectId} />

      <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
        <Box className={styles.grid}>

          <SectionCard title="Đánh giá tiến độ dự án" span2>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <ProgressBar
                value={progress}
                color={progress === 100 ? '#059669' : '#5663ee'}
                tooltipTitle={`Hoàn thành: ${progress}%`}
                height={10}
              />
              <Typography fontSize={14} fontWeight={700} color={progress === 100 ? '#059669' : '#5663ee'}>
                {progress}%
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {[
                { label: 'Tổng nhiệm vụ', value: total, color: '#374151' },
                { label: 'Hoàn thành', value: done, color: '#059669' },
                { label: 'Quá hạn', value: overdue, color: '#ef4444' },
              ].map(s => (
                <Box key={s.label} sx={{ textAlign: 'center' }}>
                  <Typography fontSize={18} fontWeight={700} color={s.color}>{s.value}</Typography>
                  <Typography fontSize={12} color="#6b7280">{s.label}</Typography>
                </Box>
              ))}
            </Box>
          </SectionCard>

          <SectionCard title="Theo trạng thái" fixedHeight={160}>
            <Stack spacing={1.5}>
              {tasksByStatus.length === 0 ? (
                <Typography fontSize={13} color="#9ca3af">Chưa có trạng thái nào.</Typography>
              ) : tasksByStatus.map(s => (
                <Box key={s.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography fontSize={13} color="#374151">{s.name.toUpperCase()}</Typography>
                    <Typography fontSize={13} fontWeight={600} color="#374151">{s.count}</Typography>
                  </Box>
                  <ProgressBar
                    value={calcPercent(s.count, total)}
                    tooltipTitle={`${s.name.toUpperCase()}: ${s.count} nhiệm vụ (${calcPercent(s.count, total)}%)`}
                  />
                </Box>
              ))}
            </Stack>
          </SectionCard>

          <SectionCard title="Theo độ ưu tiên" fixedHeight={160}>
            <Stack spacing={1.5}>
              {tasksByPriority.map(p => (
                <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={p.name.toUpperCase()}
                    size="small"
                    sx={{ fontSize: 11, height: 20, bgcolor: `${p.color}20`, color: p.color, fontWeight: 600, width: 100 }}
                  />
                  <ProgressBar
                    value={calcPercent(p.count, total)}
                    color={p.color}
                    tooltipTitle={`${p.name.toUpperCase()}: ${p.count} nhiệm vụ (${calcPercent(p.count, total)}%)`}
                  />
                  <Typography fontSize={13} fontWeight={600} color="#374151" sx={{ width: 24, textAlign: 'right' }}>
                    {p.count}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </SectionCard>

          <SectionCard
            title="Tiến độ công việc của thành viên"
            span2
            action={
              <Box sx={{ display: 'flex', gap: 2 }}>
                {WORKLOAD_LEGEND.map(l => (
                  <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: 2, bgcolor: l.color }} />
                    <Typography fontSize={11} color="#6b7280">{l.label}</Typography>
                  </Box>
                ))}
              </Box>
            }
          >
            {members.length === 0 ? (
              <Typography fontSize={13} color="#9ca3af">Chưa có thành viên nào.</Typography>
            ) : (
              <Stack spacing={1.5}>
                {members.map((m: any) => {
                  const memberTasks = tasks.filter(t => t.assignee_id === m.user_id);
                  const doneTasks = lastStatus ? memberTasks.filter(t => t.status_id === lastStatus.id).length : 0;
                  const todoTasks = memberTasks.length - doneTasks;

                  return (
                    <Box key={m.member_id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Tooltip title={m.user?.name ?? ''}>
                        <Avatar src={m.user?.picture} sx={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}>
                          {m.user?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                      </Tooltip>
                      <Box sx={{ width: 130, flexShrink: 0 }}>
                        <Typography fontSize={13} fontWeight={500} color="#111827" noWrap>{m.user?.name}</Typography>
                        <Typography fontSize={11} color="#9ca3af">
                          {getMemberRoleLabel(m.user_id, project?.owner_id, m.role)}
                        </Typography>
                      </Box>
                      {memberTasks.length === 0 ? (
                        <Box sx={{ flex: 1, height: 8, bgcolor: '#f3f4f6', borderRadius: 4 }} />
                      ) : (
                        <Box sx={{ flex: 1, display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: '1px' }}>
                          {todoTasks > 0 && (
                            <Tooltip title={`Chưa hoàn thành: ${todoTasks}`}>
                              <Box sx={{ flex: todoTasks, bgcolor: '#d1d5db', minWidth: 4 }} />
                            </Tooltip>
                          )}
                          {doneTasks > 0 && (
                            <Tooltip title={`Hoàn thành: ${doneTasks}`}>
                              <Box sx={{ flex: doneTasks, bgcolor: '#059669', minWidth: 4 }} />
                            </Tooltip>
                          )}
                        </Box>
                      )}
                      <Typography fontSize={12} color="#6b7280" sx={{ width: 60, textAlign: 'right', flexShrink: 0 }}>
                        {memberTasks.length} nhiệm vụ
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </SectionCard>

        </Box>
      </Box>
    </Box>
  );
}

