import { useState, useEffect, useRef } from 'react';
import { FiBox, FiShoppingCart, FiUsers, FiTag, FiTrendingUp, FiActivity } from 'react-icons/fi';
import api from '../api';
import anime, { animateStagger } from '../hooks/useAnime';
import './Dashboard.css';

const StatCard = ({ title, value, icon, color, index }) => {
  const countRef = useRef(null);
  
  useEffect(() => {
    // Top-level industrial counter animation
    const obj = { val: 0 };
    anime({
      targets: obj,
      val: value,
      round: 1,
      easing: 'outQuart',
      duration: 2000,
      delay: index * 100,
      update: () => {
        if (countRef.current) countRef.current.innerHTML = obj.val.toLocaleString();
      }
    });
  }, [value, index]);

  return (
    <div className="stat-card card glass-panel" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="stat-icon" style={{ backgroundColor: `${color}15`, color: color }}>
        {icon}
      </div>
      <div className="stat-info">
        <h3 className="stat-value text-gradient" ref={countRef}>0</h3>
        <p className="stat-title text-muted">{title}</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    categories: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (!loading) {
      // Staggered entrance for dashboard elements
      animateStagger('.dashboard-header > *, .stat-card, .recent-orders-card', {
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(100, {start: 300}),
        easing: 'outQuart'
      });

      // Stagger table rows
      animateStagger('.table tbody tr', {
        translateX: [-20, 0],
        opacity: [0, 1],
        delay: anime.stagger(50, {start: 800}),
        duration: 600
      });
    }
  }, [loading]);

  const fetchStats = async () => {
    try {
      const results = await Promise.allSettled([
        api.get('/product/getProductList'),
        api.get('/order/getAllOrders'),
        api.get('/user/getAllUser'),
        api.get('/category/getCategoryList'),
      ]);

      const getCount = (result) => {
        if (result.status === 'fulfilled') {
          const d = result.value.data;
          if (Array.isArray(d)) return d.length;
          if (Array.isArray(d?.data)) return d.data.length;
        }
        return 0;
      };

      const getArray = (result) => {
        if (result.status === 'fulfilled') {
          const d = result.value.data;
          if (Array.isArray(d)) return d;
          if (Array.isArray(d?.data)) return d.data;
        }
        return [];
      };

      setStats({
        products: getCount(results[0]),
        orders: getCount(results[1]),
        users: getCount(results[2]),
        categories: getCount(results[3]),
      });

      const allOrders = getArray(results[1]);
      setRecentOrders(allOrders.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  const statCardsData = [
    { title: 'Total Products', value: stats.products, icon: <FiBox />, color: 'var(--primary)' },
    { title: 'Total Orders', value: stats.orders, icon: <FiShoppingCart />, color: 'var(--secondary)' },
    { title: 'Total Users', value: stats.users, icon: <FiUsers />, color: 'var(--success)' },
    { title: 'Categories', value: stats.categories, icon: <FiTag />, color: 'var(--warning)' },
  ];

  const getStatusBadgeClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'delivered': return 'badge-success';
      case 'shipped': return 'badge-primary';
      case 'processing': return 'badge-warning';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  if (loading) {
    return <div className="loader-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard page-container">
      <div className="dashboard-header mb-5">
        <h1 className="text-gradient">Dashboard Overview</h1>
        <p className="text-muted">Welcome to your ChannelFlow admin control panel.</p>
      </div>
      
      <div className="stats-grid mb-5">
        {statCardsData.map((stat, index) => (
          <StatCard 
            key={index} 
            index={index}
            title={stat.title} 
            value={stat.value} 
            icon={stat.icon} 
            color={stat.color} 
          />
        ))}
      </div>

      <div className="card glass-panel recent-orders-card">
        <div className="d-flex align-center justify-between mb-4">
          <h3 className="m-0 d-flex align-center gap-3"><FiActivity style={{color: 'var(--primary)'}} /> Recent Orders</h3>
          <span className="text-muted" style={{fontSize: '0.85rem'}}>Displaying latest activities</span>
        </div>
        {recentOrders.length > 0 ? (
          <div className="table-container" style={{border: 'none', background: 'transparent'}}>
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <tr key={order._id || order.id || i}>
                    <td className="font-medium text-primary">
                      #{(order._id || order.id || '').toString().slice(-6).toUpperCase()}
                    </td>
                    <td>{order.user?.name || order.customer?.name || order.customerName || '—'}</td>
                    <td className="font-medium">₹{(order.totalAmount || order.total || 0).toLocaleString()}</td>
                    <td><span className={`badge ${getStatusBadgeClass(order.status)}`}>{order.status || 'Pending'}</span></td>
                    <td className="text-muted">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted">No orders yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
