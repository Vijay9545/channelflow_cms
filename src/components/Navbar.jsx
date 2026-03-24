import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiMenu, FiBell } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { logout, user } = useAuth();
  
  const displayName = user?.name || user?.email || user?.company || 'Admin User';
  const initial = displayName[0].toUpperCase();

  return (
    <header className="navbar glass-panel">
      <div className="navbar-left">
        <button className="icon-btn d-mobile-only">
          <FiMenu />
        </button>
        <span className="navbar-title text-muted">Admin Panel</span>
      </div>
      
      <div className="navbar-right">
        <button className="icon-btn position-relative">
          <FiBell />
          <span className="notification-dot"></span>
        </button>
        
        <div className="user-profile">
          <div className="avatar" title={displayName}>{initial}</div>
          <span className="user-name" title={displayName}>{displayName}</span>
        </div>
        
        <button onClick={logout} className="btn btn-secondary logout-btn">
          <FiLogOut /> <span className="d-none-mobile">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
