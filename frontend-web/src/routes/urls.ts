export const loginUrl = "/login";
export const homeUrl = "/";
export const accountUrl = "/account";
export const projectUrl = "/projects"
export const projectDetailUrl = "/projects/:projectId";
export const invitationAcceptUrl = "/invitations/accept";
export const archiveUrl = "/archive";
export const joinProjectUrl = "/join";

export const isProjectPath = (pathname: string, projectId: string): boolean => {
  return pathname.startsWith(`/projects/${projectId}`);
};

export const ROUTES = {
  projectDetail: (id: string) => `/projects/${id}`,
  projectList: (id: string) => `/projects/${id}/list`,      
  projectBoard: (id: string) => `/projects/${id}/board`,    
  projectCalendar: (id: string) => `/projects/${id}/calendar`,
  projectDetailsSettings: (id: string) => `/projects/${id}/settings/details`,
  projectMembersSettings: (id: string) => `/projects/${id}/settings/members`,
  projectStatusesSettings: (id: string) => `/projects/${id}/settings/statuses`,
};
