import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiBox, FiShoppingCart, FiUsers, FiTag, FiLayers, FiGift, FiStar } from 'react-icons/fi';
import anime, { animateStagger } from '../hooks/useAnime';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  useEffect(() => {
    // Premium sidebar entrance
    animateStagger('.sidebar-header, .nav-link, .sidebar-footer', {
      translateX: [-50, 0],
      opacity: [0, 1],
      delay: anime.stagger(60),
      duration: 800,
      easing: 'outQuart'
    });
  }, []);

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <FiHome /> },
    { path: '/users', name: 'Users', icon: <FiUsers /> },
    { path: '/categories', name: 'Categories', icon: <FiTag /> },
    { path: '/sub-categories', name: 'Sub-Categories', icon: <FiLayers /> },
    { path: '/products', name: 'Products', icon: <FiBox /> },
    { path: '/orders', name: 'Orders', icon: <FiShoppingCart /> },
    { path: '/rewards', name: 'Rewards', icon: <FiGift /> },
    { path: '/promotions', name: 'Promotions', icon: <FiStar /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="text-gradient">ChannelFlow</h2>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <p className="text-muted" style={{fontSize: '0.8rem'}}>© 2026 ChannelFlow Admin</p>
      </div>
    </aside>
  );
};

export default Sidebar;
