# Collab PMS — Frontend

Giao diện người dùng (SPA) cho hệ thống quản lý dự án **Collab PMS**, được xây dựng bằng **React + Vite**.

## Công nghệ

- **React 19** + **TypeScript**
- **Vite** — Build tool & Development server
- **Material UI (MUI)** — Thư viện giao diện chính
- **TanStack React Query** — Quản lý trạng thái server và caching
- **React Router DOM** — Điều hướng
- **@dnd-kit** — Kéo thả (Kanban Board)
- **React Hook Form + Yup** — Xử lý form và validation
- **xlsx-js-style** — Xuất file Excel có định dạng
- **date-fns** — Xử lý ngày tháng
- **SCSS Modules** — Styling

## Tính năng chính

- Kanban Board với kéo thả mượt mà
- Task Detail Modal đầy đủ (bình luận, @mention, đính kèm file)
- Upload file bằng kéo thả hoặc Ctrl + V
- Hệ thống thông báo realtime (in-app)
- Xuất báo cáo Excel có định dạng

## Cài đặt

```bash
npm install
npm run dev
```

Tạo file `.env` (hoặc `.env.local`) tại thư mục `frontend-web/`:

```env
VITE_COLLAB_URL=http://localhost:3000
```

## Scripts

```bash
npm run dev       # Vite dev server (mặc định port 5173)
npm run build     # Build production → dist/
npm run preview   # Preview build
npm run lint      # ESLint
```