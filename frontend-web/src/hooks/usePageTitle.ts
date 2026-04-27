import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { routes } from '../modules/index';

export function usePageTitle() {
  const location = useLocation();
  const params = useParams();

  useEffect(() => {
    const matched = routes.find(r => {
      const pattern = r.path.replace(/:[^/]+/g, '[^/]+');
      return new RegExp(`^${pattern}$`).test(location.pathname);
    });

    if (matched?.title) {
      document.title = `${matched.title} | Collab PMS`;
    } else {
      document.title = 'Collab PMS';
    }
  }, [location.pathname, params]);
}
