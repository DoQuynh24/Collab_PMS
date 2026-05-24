export const COLLAB_URL = import.meta.env.VITE_COLLAB_URL;

export const URL_API_AUTH_GOOGLE = `${COLLAB_URL}/auth/google`;
export const URL_API_AUTH_GOOGLE_CALLBACK = `${COLLAB_URL}/auth/google/callback`;
export const URL_API_AUTH_ME = `${COLLAB_URL}/auth/me`;
export const URL_API_SEARCH_USER = `${COLLAB_URL}/auth`;
//Projects
export const URL_API_GET_PROJECT = `${COLLAB_URL}/projects`;
//Tasks
export const URL_API_GET_TASK = `${COLLAB_URL}/tasks`;
//Task Status
export const URL_API_GET_PROJECT_TASK = `${COLLAB_URL}/project-task-statuses`;
//Invitations
export const URL_API_GET_INVITATION = `${COLLAB_URL}/invitations`;
//Comments
export const URL_API_GET_COMMENT = `${COLLAB_URL}/comments`;
//Notifications
export const URL_API_NOTIFICATIONS = `${COLLAB_URL}/notifications`;
//Attachments
export const URL_API_ATTACHMENTS = `${COLLAB_URL}/attachments`;
//Meetings
export const URL_API_MEETINGS = `${COLLAB_URL}/meetings`;
