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

export const ProjetDetail = lazyLoad(
  () => import('./project/ProjectDetail'),
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
  () => import('./project/component/setting/ProjectMemberSetting'),
  (module) => module.default
);

export const ProjectStatusesSetting = lazyLoad(
  () => import('./project/component/setting/ProjectStatusSetting'),
  (module) => module.default
);

export const routes: RouteConfig[] = [
  { path: '/home', component: Home, title: 'Home' },
  { path: '/login', component: Login, title: 'Login' },
  { path: '/account', component: Account, title: 'Account' },
  { path: '/projects/:projectId', component: ProjetDetail, title: 'Project Detail' },
  { path: '/projects/:projectId/settings/details', component: ProjectDetailSetting, title: 'Project Settings' },
  { path: '/projects/:projectId/settings/members', component: ProjectMemberSetting, title: 'Project Members' },
  { path: '/projects/:projectId/settings/statuses', component: ProjectStatusesSetting, title: 'Project Status' },
];