# Collab PMS — Project Management System

Hệ thống quản lý dự án và công việc nhóm, xây dựng với NestJS (backend) và React + Vite (frontend).

## Công nghệ sử dụng

### Backend

- NestJS (Node.js) + TypeScript — Framework chính
- TypeORM — ORM kết nối MySQL
- MySQL — Cơ sở dữ liệu
- JWT + Passport.js — Xác thực và ủy quyền
- Google OAuth2 — Đăng nhập bằng Google
- Cloudinary — Lưu trữ file đính kèm (ảnh, tài liệu)
- SendGrid — Gửi email thông báo
- @nestjs/schedule — Lên lịch nhắc nhở deadline

### Frontend

- React 19 + TypeScript + Vite
- Material UI (MUI) — Thư viện giao diện
- TanStack React Query — Quản lý trạng thái server
- React Router DOM — Điều hướng
- @dnd-kit — Kéo thả (Kanban Board)
- React Hook Form + Yup — Xử lý form và validation

### Deployment & Dịch vụ bên ngoài

- Railway — Nền tảng triển khai (Backend + Database)
- Cloudinary — Lưu trữ file
- SendGrid — Dịch vụ gửi email

## Tính năng chính

### Quản lý dự án
- Tạo, chỉnh sửa, archive và xóa dự án
- Phân quyền 3 cấp: **Chủ sở hữu** (toàn quyền), **Admin** (quản lý thành viên, trạng thái, cài đặt), **Thành viên** (tạo và chỉnh sửa task)
- Dự án **Riêng tư** hoặc **Công khai**
- Mời thành viên qua email hoặc chia sẻ mã dự án

### Quản lý nhiệm vụ (Task)
- Bảng Kanban với kéo thả (drag & drop) — thay đổi trạng thái và sắp xếp cột
- Danh sách (List view) và Lịch (Calendar view)
- Tổng quan dự án (Overview) với tiến độ và thống kê
- Nhóm task theo người thực hiện hoặc độ ưu tiên
- Bộ lọc theo người thực hiện, độ ưu tiên, trạng thái
- Tùy chỉnh hiển thị card (TASK-ID, cờ ưu tiên, deadline, avatar)
- Ẩn task đã hoàn thành
- Lưu trữ (archive) và khôi phục task
- Xuất dữ liệu Excel với định dạng đầy đủ

### Tài liệu đính kèm
- Upload ảnh, PDF, Word, Excel, PowerPoint, ZIP lên Cloudinary
- Kéo thả, click chọn hoặc Ctrl+V để dán ảnh
- Preview trước khi upload, xóa file với confirm modal
- Phân quyền xóa: người tải lên, người tạo task, Admin, Chủ sở hữu

### Bình luận & @mention
- Bình luận trên task với hỗ trợ @mention thành viên
- Reply bình luận (nested comments)
- Chỉnh sửa và xóa bình luận

### Thông báo
- **In-app**: panel thông báo real-time (polling 30s), tabs Tất cả / Chưa đọc
- **Email**: qua SendGrid cho các sự kiện quan trọng
- **Cron jobs**: nhắc nhở deadline sắp tới (8h sáng VN) và task quá hạn (8h sáng VN)
- Tùy chỉnh thông báo per-project per-user (bật/tắt từng loại)

### Cài đặt dự án
- Quản lý trạng thái tùy chỉnh (thêm, đổi tên, sắp xếp, xóa)
- Cài đặt thông báo riêng cho từng dự án
- Quản lý thành viên và phân quyền

## Cấu trúc dự án

```
Collab_PMS/
├── backend/          # NestJS API server
└── frontend-web/     # React + Vite SPA
```

## Yêu cầu hệ thống

- Node.js >= 18
- MySQL 8+
- Tài khoản Google Cloud (OAuth)
- Tài khoản SendGrid (email)
- Tài khoản Cloudinary (file storage)

## Clone repository
```bash
git clone https://github.com/DoQuynh24/Collab_PMS.git
cd Collab_PMS

# Backend
cd backend
npm install
cp .env.example .env
# Điền các biến môi trường vào .env
npm run start:dev

# Frontend (terminal mới)
cd frontend-web
npm install
cp .env.example .env
# Điền các biến môi trường vào .env
npm run dev
```

## Deploy

Dự án được deploy trên **Railway** (backend + database) và **Railway** (frontend).

- Backend: `npm run build` → `npm run start:prod`
- Frontend: `npm run build` → serve thư mục `dist/`

## Tài liệu API

Sau khi chạy backend, truy cập `http://localhost:3000/api` để xem Swagger docs.

## Phiên bản

**1.0.0** — June 2026
