# Collab PMS — Backend

NestJS REST API cho hệ thống quản lý dự án Collab PMS.

## Công nghệ

- **NestJS 11** + **TypeScript** — Framework chính
- **TypeORM 0.3** — ORM kết nối MySQL
- **MySQL2** — Database driver
- **Passport.js** + **JWT** — Xác thực và ủy quyền
- **passport-google-oauth20** — Đăng nhập Google OAuth2
- **@nestjs/schedule** — Lên lịch chạy cron job (nhắc deadline)
- **@sendgrid/mail** — Gửi email thông báo
- **Cloudinary** — Lưu trữ file đính kèm
- **Multer** — Xử lý upload file
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

| Job | Cron (UTC) | Giờ VN | Mô tả |
|---|---|---|---|
| `handleDeadlineReminder` | `0 1 * * *` | 8h sáng | Nhắc nhở task sắp đến hạn ngày mai |
| `handleOverdueReminder` | `0 1 * * *` | 8h sáng | Thông báo task đã quá hạn (1 lần duy nhất) |

## Swagger Docs

Truy cập `http://localhost:3000/api` sau khi chạy server.
