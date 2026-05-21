# Collab PMS — Backend

NestJS REST API cho hệ thống quản lý dự án Collab PMS.

## Công nghệ

- **NestJS 11** + **TypeScript** — Framework chính
- **TypeORM 0.3** — ORM kết nối MySQL
- **MySQL2** — Database driver
- **Passport.js** + **JWT** — Xác thực và ủy quyền
- **passport-google-oauth20** — Đăng nhập Google OAuth2
- **@nestjs/schedule** — Lên lịch chạy cron job (nhắc deadline, nhắc họp)
- **@sendgrid/mail** — Gửi email thông báo
- **Cloudinary** — Lưu trữ file đính kèm
- **Multer** — Xử lý upload file
- **Socket.IO** (`@nestjs/websockets`) — Real-time signaling cho video call
- **agora-token** — Sinh Agora RTC token cho video call
- **class-validator** — Validation DTO
- **@nestjs/swagger** — Tự động sinh tài liệu API

## Cài đặt

```bash
npm install
cp .env.example .env
# Điền các biến môi trường
npm run start:dev
```
## Scripts

```bash
npm run start:dev    # Dev với hot-reload
npm run start:prod   # Production (node dist/main)
npm run build        # Build TypeScript → dist/
npm run lint         # ESLint
npm run test         # Jest unit tests
```

## Cron Jobs

| Job | Cron (UTC) | Mô tả |
|---|---|---|
| `handleDeadlineReminder` | `0 1 * * *` | 8h sáng | Nhắc nhở task sắp đến hạn ngày mai |
| `handleOverdueReminder` | `0 1 * * *` | 8h sáng | Thông báo task đã quá hạn (1 lần duy nhất) |
| `handleMeetingReminder` | `* * * * *` (mỗi phút) | Nhắc nhở in-app 5 phút trước cuộc họp |
| `handleMeetingExpiry` | `*/5 * * * *` (mỗi 5 phút) | Mark meeting `completed` nếu đã qua 30 phút mà không ai tham gia |
| `expireStaleRooms` | `0 * * * *` (mỗi giờ) | Tự đóng video room active quá 4 giờ |

## Swagger Docs

Truy cập `http://localhost:3000/api` sau khi chạy server.
