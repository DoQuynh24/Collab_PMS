import { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { InvitationAccept, routes } from './modules/index';
import { Layout } from './components/Layout';
import LoadingPage from './components/loading/LoadingPage';
import { NotifyProvider } from './components/notification/NotifiProvider';
import { useQueryClient } from '@tanstack/react-query';

function App() {
  const loginRoute = routes.find((r) => r.path === '/login');
  const LoginComponent = loginRoute?.component; 

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const pathname = window.location.pathname;

    if (token && !pathname.startsWith('/invitations')) {
      localStorage.setItem('access_token', token);
      window.history.replaceState({}, '', window.location.pathname);
      queryClient.invalidateQueries({ queryKey: ['current-user'] });

      const redirect = localStorage.getItem('invitation_redirect');
      if (redirect) {
        localStorage.removeItem('invitation_redirect');
        navigate(redirect, { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }
  }, [navigate, queryClient]);

  return (
    <NotifyProvider>
      <Suspense fallback={<LoadingPage loadFiles={false} />}>
        <Routes>
            <Route 
              path="/invitations/accept" 
              element={<InvitationAccept />} 
            />
          <Route element={<Layout />}>
            {routes
              .filter((route) => route.path !== '/login') 
              .map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<route.component />}
                />
              ))}
          </Route>
          <Route
            path="/login"
            element={LoginComponent ? <LoginComponent /> : <div>Login component not found</div>} 
          />
          <Route
            path="/"
            element={<Navigate to="/home" replace />}
          />
        </Routes>
      </Suspense>
    </NotifyProvider>
  );
}

export default App;