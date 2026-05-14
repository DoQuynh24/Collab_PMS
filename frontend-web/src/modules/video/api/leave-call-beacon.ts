import { COLLAB_URL } from '../../../constant/config';

export function leaveCallBeacon(roomId: number): void {
  const token = localStorage.getItem('access_token');
  if (!token) return;

  fetch(`${COLLAB_URL}/video/${roomId}/leave`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
    keepalive: true,
  }).catch(() => {});
}
