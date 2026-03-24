import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import anime from '../hooks/useAnime';

const MainLayout = () => {
  const location = useLocation();

  useEffect(() => {
    // Global page transition on route change
    anime({
      targets: '.main-content-inner',
      opacity: [0, 1],
      translateX: [10, 0],
      easing: 'outQuart',
      duration: 600
    });
  }, [location.pathname]);

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="page-container">
          <div className="main-content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
