import { Button, IconButton } from "@mui/material";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

import styles from "../../ProjectListView.module.scss";
import { useGetCurrentUser } from "../../../login/api/auth";
import { useGetProjectById } from "../../api/get-project-id";
import type { ITask } from "../../../task/types";

interface Props {
  checkedIds: Set<number>;
  totalCount: number;
  projectId: string;
  projectMembers: any[];
  onSelectAll: () => void;
  onClearAll: () => void;
  onArchive: () => void;
  onDelete: () => void;
  tasks: ITask[];
}

export default function TaskActionBar({
  checkedIds,
  totalCount,
  projectId,
  projectMembers,
  onSelectAll,
  onClearAll,
  onArchive,
  onDelete,
  tasks,
}: Props) {
  const { data: currentUser } = useGetCurrentUser();
  const { data: project } = useGetProjectById(projectId);

  const currentMember = projectMembers.find((m) => m.user_id === currentUser?.user_id);
  const isOwnerOrAdmin = currentMember?.role === "admin" || project?.owner_id === currentUser?.user_id;

  const allCheckedCreatedByMe = [...checkedIds].every(
    (id) => tasks.find((t) => t.task_id === id)?.created_by === currentUser?.user_id
  );

  const canBulkArchive = isOwnerOrAdmin || allCheckedCreatedByMe;
  const canBulkDelete = isOwnerOrAdmin;

  return (
    <div className={styles.actionBar}>
        <span className={styles.actionBarCount}>{checkedIds.size} đã chọn</span>
        <span className={styles.actionBarDivider}>|</span>

        <Button
        size="small"
        className={styles.actionBarBtn}
        onClick={checkedIds.size === totalCount ? onClearAll : onSelectAll}
        startIcon={<CheckBoxIcon sx={{ fontSize: 16 }} />}
        >
        {checkedIds.size === totalCount ? "Bỏ chọn tất cả" : "Chọn tất cả"}
        </Button>

        {(canBulkArchive || canBulkDelete) && (
        <span className={styles.actionBarDivider}>|</span>
        )}

        {canBulkArchive && (
        <Button
            size="small"
            className={styles.actionBarBtn}
            onClick={onArchive}
            startIcon={<ArchiveIcon sx={{ fontSize: 16 }} />}
        >
            Lưu trữ
        </Button>
        )}

        {canBulkDelete && (
        <Button
            size="small"
            className={styles.actionBarBtn}
            onClick={onDelete}
            startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
        >
            Xóa
        </Button>
        )}

        <span className={styles.actionBarDivider}>|</span>

        <IconButton size="small" className={styles.actionBarBtn} onClick={onClearAll}>
        <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
    </div>
  );
}