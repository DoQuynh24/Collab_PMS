import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './modules/index';
import { Layout } from './components/Layout';
import LoadingPage from './components/loading/LoadingPage';
import { NotifyProvider } from './components/notification/NotifiProvider';

function App() {
  const loginRoute = routes.find((r) => r.path === '/login');
  const LoginComponent = loginRoute?.component; 

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
        </Routes>
      </Suspense>
    </NotifyProvider>
  );
}

export default App;