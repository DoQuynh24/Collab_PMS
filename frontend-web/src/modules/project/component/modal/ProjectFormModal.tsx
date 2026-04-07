import {
  Box,
  Modal,
  Typography,
  Button,
  TextField,
  Stack,
} from "@mui/material";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createProjectSchema, type CreateProjectFormData } from "../../rules/add-project.rules";
import { useCreateProject } from "../../api/add-project";
import { ToastContext } from "../../../../components/notification/NotifiProvider";

interface ProjectFormModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProjectFormModal({ open, onClose }: ProjectFormModalProps) {
  const today = new Date().toISOString().split("T")[0];

  const [access, setAccess] = useState<"private" | "public">("private");

  const { mutate: createProject, isPending: loading } = useCreateProject();
  const { showToast } = useContext(ToastContext)!;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormData>({
    resolver: yupResolver(createProjectSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      start_date: today,
      end_date: "",
    },
  });

  const submitForm = async (data: CreateProjectFormData) => {
    const payload = {
      ...data,
      access,
    };

    createProject(payload, {
      onSuccess: () => {
        showToast("Tạo dự án thành công!", "success");
        reset();
        setAccess("private");
        onClose();
      },
      onError: (error) => {
        showToast(
          "Tạo dự án thất bại: " + (error.message || "Lỗi không xác định"),
          "error"
        );
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        p: 3,
      }}
    >
      <Box
        sx={{
          width: 400,
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 3,
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        }}
      >
        <Typography variant="h6" fontWeight={600} mb={3}>
          Thêm dự án mới
        </Typography>

        <form onSubmit={handleSubmit(submitForm)}>
          <Stack spacing={2.5}>
            <TextField
              label="Tên dự án"
              size="small"
              fullWidth
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <TextField
              label="Mô tả"
              size="small"
              fullWidth
              multiline
              rows={3}
              {...register("description")}
              error={!!errors.description}
              helperText={errors.description?.message}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Ngày bắt đầu"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register("start_date")}
                error={!!errors.start_date}
                helperText={errors.start_date?.message}
              />

              <TextField
                label="Ngày kết thúc"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register("end_date")}
                error={!!errors.end_date}
                helperText={errors.end_date?.message}
              />
            </Stack>

            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, color: "text.secondary" }}
              >
                Quyền riêng tư
              </Typography>

              <Stack direction="row" spacing={1}>
                {["private", "public"].map((type) => (
                  <Box
                    key={type}
                    onClick={() => setAccess(type as "private" | "public")}
                    sx={{
                      flex: 1,
                      textAlign: "center",
                      py: 1,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor:
                        access === type ? "primary.main" : "grey.300",
                      bgcolor:
                        access === type ? "primary.light" : "transparent",
                      cursor: "pointer",
                      fontWeight: access === type ? 600 : 400,
                    }}
                  >
                    {type === "private" ? "🔒 Riêng tư" : "🌍 Công khai"}
                  </Box>
                ))}
              </Stack>
            </Box>

            <Stack
              direction="row"
              justifyContent="flex-end"
              spacing={1.5}
              mt={2}
            >
              <Button
                variant="outlined"
                size="small"
                onClick={onClose}
                disabled={loading || isSubmitting}
              >
                Đóng
              </Button>

              <Button
                variant="contained"
                size="small"
                type="submit"
                disabled={loading || isSubmitting}
              >
                {loading || isSubmitting ? "Đang tạo..." : "Tạo dự án"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
}