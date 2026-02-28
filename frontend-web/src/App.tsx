import { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Account, routes } from './modules/index';
import { Layout } from './components/Layout';
import LoadingPage from './components/loading/LoadingPage';
import { NotifyProvider } from './components/notification/NotifiProvider';
import { useQueryClient } from '@tanstack/react-query';

function App() {
  const loginRoute = routes.find((r) => r.path === '/login');
  const LoginComponent = loginRoute?.component; 

 const queryClient = useQueryClient();

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (token) {
    localStorage.setItem('access_token', token);
    window.history.replaceState({}, '', window.location.pathname);
    queryClient.invalidateQueries({ queryKey: ['current-user'] });
  }
}, []);

  return (
    <NotifyProvider>
      <Suspense fallback={<LoadingPage loadFiles={false} />}>
        <Routes>
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
          <Route 
            path="/account" 
            element={<Account />} 
          />
        </Routes>
      </Suspense>
    </NotifyProvider>
  );
}

export default App;