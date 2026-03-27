# CollabPMS - Backend

Backend của hệ thống CollabPMS được xây dựng bằng **NestJS + TypeScript**.

## Công nghệ
- NestJS
- TypeORM + MySQL
- JWT Authentication
- Google OAuth2

## Hướng dẫn cài đặt

```bash
cd backend
# Cài đặt dependencies
npm install

# Copy file môi trường
cp .env.example .env

# Chạy ở chế độ development
npm run start
npm run start:dev