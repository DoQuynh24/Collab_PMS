import * as yup from "yup";

export const createProjectSchema = yup.object({
  name: yup
    .string()
    .required("Tên dự án là bắt buộc")
    .min(3, "Tên dự án phải có ít nhất 3 ký tự")
    .max(255, "Tên dự án tối đa 255 ký tự")
    .trim(),

  description: yup
    .string()
    .nullable()
    .optional(),

  start_date: yup
    .string()
    .required("Ngày bắt đầu là bắt buộc"),

  end_date: yup
    .string()
    .nullable()
    .test(
      "is-after-start-date",
      "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu",
      function (value) {
        const { start_date } = this.parent;

        if (!value) return true; 

        return new Date(value) >= new Date(start_date);
      }
    ),
});

export type CreateProjectFormData = yup.InferType<
  typeof createProjectSchema
>;