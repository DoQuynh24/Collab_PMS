export const loginUrl = "/login";
export const homeUrl = "/";
export const accountUrl = "/account";
export const projectUrl = "/projects"
export const projectDetailUrl = "/projects/:projectId";
export const invitationAcceptUrl = "/invitations/accept";

export const isProjectPath = (pathname: string, projectId: string): boolean => {
  return pathname.startsWith(`/projects/${projectId}`);
};

export const ROUTES = {
  projectDetail: (id: string) => `/projects/${id}`,
  projectDetailsSettings: (id: string) => `/projects/${id}/settings/details`,
  projectMembersSettings: (id: string) => `/projects/${id}/settings/members`,
  projectStatusesSettings: (id: string) => `/projects/${id}/settings/statuses`,
};
