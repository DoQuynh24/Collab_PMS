import styles from "../../project/ProjectListView.module.scss";
import { PRIORITIES } from "../../../constant";
import type { ITask } from "../types";
import type { ITaskStatus } from "../../task-status/types";
import AssigneeSelector from "./AssigneeSelector";
import PrioritySelector from "./PrioritySelector";
import ChangeStatusSelector from "../../task-status/component/ChangeStatusSelector";
import DeadlineChip from "./DeadlineChip";
import { useState } from "react";
import TaskDetailModal from "../TaskDetailModal";
import { Box } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useUpdateTask } from "../api/update-task";

interface TaskRowProps {
  task: ITask;
  statuses: ITaskStatus[];
  projectId: string;   
  projectMembers: any[];
  checked: boolean;
  onCheck: (id: number) => void;
}

export default function TaskRow({
  task,
  statuses,
  projectId,
  projectMembers,
  checked,
  onCheck,
}: TaskRowProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { mutate: updateTask } = useUpdateTask();
  const assigneeMember = projectMembers.find((m) => m.user_id === task.assignee_id);
  const assignee = assigneeMember?.user; 
  const currentStatus = statuses.find((s) => s.id === task.status_id);

  return (
    <>
      <tr>
        <td className={styles.checkCell}>
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onCheck(task.task_id)}
            onClick={(e) => e.stopPropagation()}
          />
        </td>

        <td  onClick={() => setModalOpen(true)}>
          <div className={styles.workCell}>
            <span className={styles.taskLink}>TASK-{task.task_id}</span>
            <span className={styles.taskTitle}>{task.title}</span>
          </div>
        </td>

        <td>
          <Box sx={{ display: "flex", alignItems: "center", "&:hover svg.arrowIcon": { opacity: 1 } }}>
            <AssigneeSelector
              assignee={assignee}
              projectMembers={projectMembers}
              onAssigneeChange={(userId) => updateTask({ taskId: task.task_id, payload: { assignee_id: userId ?? undefined } })}
              showText={true}
              showTooltip={true}
              tooltipTitle={assignee?.name || "Chưa phân công"}
            />
            <KeyboardArrowDownIcon sx={{ fontSize: 15, color: "#555", opacity: 0, transition: "opacity 0.15s" }} className="arrowIcon" />
          </Box>
          
        </td>

        <td>
          <Box sx={{ display: "flex", alignItems: "center", "&:hover svg.arrowIcon": { opacity: 1 } }}>
            <PrioritySelector
              priority={PRIORITIES.find((p) => p.id === task.priority_id)}
              onPriorityChange={(priorityId) => updateTask({ taskId: task.task_id, payload: { priority_id: priorityId } })}
              showText={true}
            />
            <KeyboardArrowDownIcon sx={{ fontSize: 15, color: "#555", opacity: 0, transition: "opacity 0.15s" }} className="arrowIcon" />
          </Box>
        </td>

        <td>
          <ChangeStatusSelector
            currentStatusId={task.status_id}
            currentStatusName={currentStatus?.name}
            projectId={projectId} 
            onStatusChange={(statusId) => updateTask({ taskId: task.task_id, payload: { status_id: statusId } })}
          />
        </td>

        <td>
          {task.deadline
            ? <DeadlineChip deadline={task.deadline} />
            : <span style={{ fontSize: 13, color: "#9ca3af" }}>Chưa có hạn</span>
          }
        </td>
      </tr>
      <TaskDetailModal
        key={task.task_id}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        task={task}
        projectMembers={projectMembers}
        projectId={projectId}
        projectOwnerId={projectMembers.find((m: any) => m.role === 'owner')?.user_id}
      />
    </>
  );
}
