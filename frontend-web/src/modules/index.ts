import { lazyLoad } from '../utils/loadable';
import type { ComponentType } from 'react';

interface RouteConfig {
  path: string;
  component: ComponentType<any>;
  title: string;
}

export const Home = lazyLoad(
  () => import('./home/Home'),
  (module) => module.default
);

export const Login = lazyLoad(
  () => import('./login/Login'),
  (module) => module.default
);

export const Account = lazyLoad(
  () => import('./account/MyAccount'),
  (module) => module.default
);

export const ProjectBoardView = lazyLoad(
  () => import('./project/ProjectBoardView'),
  (module) => module.default
);

export const ProjectListViewPage = lazyLoad(
  () => import('./project/ProjectListView'),
  (module) => module.default
);

export const InvitationAccept = lazyLoad(
  () => import('./project-member/component/InvitationAccept'),
  (module) => module.default
);

export const ProjectDetailSetting = lazyLoad(
  () => import('./project/component/setting/ProjectDetailSetting'),
  (module) => module.default
);

export const ProjectMemberSetting = lazyLoad(
  () => import('./project/component/setting/member/ProjectMemberSetting'),
  (module) => module.default
);

export const ProjectStatusesSetting = lazyLoad(
  () => import('./project/component/setting/ProjectStatusSetting'),
  (module) => module.default
);

export const ArchivedProjects = lazyLoad(
  () => import('./project/ArchivedProjects'),
  (module) => module.default
);

export const JoinProject = lazyLoad(
  () => import('./project-invitation/JoinProject'),
  (module) => module.default
);

export const ProjectOverview = lazyLoad(
  () => import('./project/ProjectOverview'),
  (module) => module.default
);

export const ProjectCalendar = lazyLoad(
  () => import('./project/ProjectCalendar'),
  (module) => module.default
);

export const routes: RouteConfig[] = [
  { path: '/home', component: Home, title: 'Dành cho bạn' },
  { path: '/login', component: Login, title: 'Đăng nhập' },
  { path: '/account', component: Account, title: 'Tài khoản' },
  { path: '/archive', component: ArchivedProjects, title: 'Kho lưu trữ' },
  { path: '/join', component: JoinProject, title: 'Tham gia dự án' },
  { path: '/projects/:projectId/board', component: ProjectBoardView, title: 'Bảng công việc' },
  { path: '/projects/:projectId/list', component: ProjectListViewPage, title: 'Danh sách công việc' },
  { path: '/projects/:projectId', component: ProjectOverview, title: 'Tổng quan dự án' },
  { path: '/projects/:projectId/calendar', component: ProjectCalendar, title: 'Lịch dự án' },
  { path: '/projects/:projectId/settings/details', component: ProjectDetailSetting, title: 'Cài đặt dự án' },
  { path: '/projects/:projectId/settings/members', component: ProjectMemberSetting, title: 'Thành viên dự án' },
  { path: '/projects/:projectId/settings/statuses', component: ProjectStatusesSetting, title: 'Trạng thái dự án' },
];