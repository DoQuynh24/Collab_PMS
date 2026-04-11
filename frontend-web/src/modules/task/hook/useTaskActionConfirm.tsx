import { useState } from "react";
import { useContext } from "react";
import { ModalConfirm } from "../../../components/modal/modalConfirm";
import { useArchiveTask } from "../api/archive-task";
import { useDeleteTask } from "../api/delete-task";
import { ToastContext } from "../../../components/notification/NotifiProvider";

export function useTaskActionConfirm(onAfterAction?: () => void) {
  const { showToast } = useContext(ToastContext)!;
  const { mutate: archiveTask } = useArchiveTask();
  const { mutate: deleteTask } = useDeleteTask();

  const [archiveId, setArchiveId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const confirmArchive = (id: number) => setArchiveId(id);
  const confirmDelete = (id: number) => setDeleteId(id);

  const modals = (
    <>
      <ModalConfirm
        open={archiveId !== null}
        setOpen={(v) => { if (!v) setArchiveId(null); }}
        title="Lưu trữ nhiệm vụ"
        message={
          <>
            Nhiệm vụ này cùng tài liệu liên quan sẽ được lưu trữ và không còn hiển thị tại đây.
            Bạn và thành viên sẽ không thể chỉnh sửa.
            <br />
            Bạn có thể khôi phục nhiệm vụ này từ mục{" "}
            <span style={{ textDecoration: "underline", color: "blue", cursor: "pointer" }}>
              Lưu trữ
            </span>.
          </>
        }
        titleButton="Lưu trữ"
        cancelButtonText="Hủy"
        onClick={() => {
          if (archiveId === null) return;
          archiveTask(archiveId, {
            onSuccess: () => { showToast("Nhiệm vụ đã được lưu trữ thành công", "success"); onAfterAction?.(); },
            onError: () => showToast("Lưu trữ nhiệm vụ thất bại", "error"),
          });
          setArchiveId(null);
        }}
        isArchive={true}
      />

      <ModalConfirm
        open={deleteId !== null}
        setOpen={(v) => { if (!v) setDeleteId(null); }}
        title="Xóa vĩnh viễn nhiệm vụ"
        message={
          <>
            Bạn sắp xóa vĩnh viễn nhiệm vụ này cùng các bình luận, tệp đính kèm và toàn bộ dữ liệu liên quan.
            <br />
            Hành động này không thể hoàn tác.
          </>
        }
        titleButton="Xóa"
        cancelButtonText="Hủy"
        onClick={() => {
          if (deleteId === null) return;
          deleteTask(deleteId, {
            onSuccess: () => { showToast("Nhiệm vụ đã được xóa vĩnh viễn", "success"); onAfterAction?.(); },
            onError: () => showToast("Xóa nhiệm vụ thất bại", "error"),
          });
          setDeleteId(null);
        }}
        confirmButtonProps={{
          sx: { backgroundColor: "#d32f2f", "&:hover": { backgroundColor: "#b71c1c" } },
        }}
        isDelete={true}
      />
    </>
  );

  return { confirmArchive, confirmDelete, taskActionModals: modals };
}