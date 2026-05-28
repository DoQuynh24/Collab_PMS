import { Box, CssBaseline, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useEffect, useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useGetCurrentUser } from '../modules/login/api/auth';
import { VideoSocketProvider, useVideoSocket } from '../modules/video/context/VideoSocketContext';
import { VideoCallProvider, useVideoCall } from '../modules/video/context/VideoCallContext';
import { IncomingCallBanner } from '../modules/video/component/IncomingCallBanner';
import { VideoRoom } from '../modules/video/component/VideoRoom';
import { FloatingCallBar } from '../modules/video/component/FloatingCallBar';

function CallBannerSlot() {
  const { incomingCall, clearIncomingCall } = useVideoSocket();
  const { activeCall } = useVideoCall();
  if (!incomingCall || activeCall) return null;
  return <IncomingCallBanner call={incomingCall} onDismiss={clearIncomingCall} />;
}

function ActiveCallSlot() {
  const { activeCall, clearActiveCall, isMinimized, setMinimized } = useVideoCall();
  const { data: currentUser } = useGetCurrentUser();

  if (!activeCall || !currentUser) return null;

  return (
    <>
      <Box sx={{ display: isMinimized ? 'none' : 'contents' }}>
        <VideoRoom
          appId={activeCall.appId}
          channelName={activeCall.channelName}
          token={activeCall.token}
          uid={currentUser.user_id}
          userName={activeCall.userName}
          memberMap={activeCall.memberMap}
          roomId={activeCall.room.id}
          isHost={activeCall.isHost}
          onMinimize={() => setMinimized(true)}
          onLeave={clearActiveCall}
        />
      </Box>

      {isMinimized && <FloatingCallBar />}
    </>
  );
}

export function Layout() {
  const isMobile = useMediaQuery('(max-width:900px)');
  const [open, setOpen] = useState(false);
  const { data: currentUser } = useGetCurrentUser();
  usePageTitle();

  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  return (
    <VideoCallProvider>
      <VideoSocketProvider userId={currentUser?.user_id ?? null}>
        <Box
          sx={{
            display: 'flex',
            minHeight: '100vh',
            backgroundImage: 'radial-gradient(circle at top, rgba(86, 99, 238, 0.08), transparent 36%)',
          }}
        >
          <CssBaseline />
          <Header onToggleSidebar={() => setOpen((v) => !v)} isMobile={isMobile} />
          <Sidebar open={open} onToggle={() => setOpen((v) => !v)} isMobile={isMobile} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              width: '100%',
              px: { xs: 1.25, sm: 2, md: 3 },
              pb: { xs: 2, sm: 2.5, md: 3 },
              pt: { xs: 8.5, sm: 9 },
              overflow: 'auto',
              minWidth: 0,
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Outlet />
          </Box>
          <CallBannerSlot />
          <ActiveCallSlot />
        </Box>
      </VideoSocketProvider>
    </VideoCallProvider>
  );
}
