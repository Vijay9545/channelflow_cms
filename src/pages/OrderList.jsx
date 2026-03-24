import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiSearch, FiPackage } from 'react-icons/fi';
import api from '../api';
import anime, { animateStagger } from '../hooks/useAnime';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!loading) {
      animateStagger('.page-header > *, .search-bar, .card, .table tbody tr', {
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(60),
        easing: 'outQuart'
      });
    }
  }, [loading]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/order/getAllOrders');
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'delivered': return 'badge-success';
      case 'shipped': return 'badge-primary';
      case 'processing': return 'badge-warning';
      case 'pending': default: return 'badge-neutral';
      case 'cancelled': return 'badge-danger';
    }
  };

  const filteredOrders = orders.filter(o => {
    const idStr = (o?.orderId || o?._id || '').toString();
    const customerStr = o?.userId?.name || o?.name || o?.customer || '';
    const term = searchTerm.toLowerCase();
    return idStr.toLowerCase().includes(term) || customerStr.toLowerCase().includes(term);
  });

  return (
    <div className="order-list-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p className="text-muted">Manage customer orders and fulfillment.</p>
        </div>
        <div className="stat-pill">
          <FiPackage /> {orders.length} Total Orders
        </div>
      </div>

      <div className="card glass-panel flex-column gap-3">
        <div className="search-bar input-with-icon" style={{maxWidth: '350px'}}>
          <FiSearch className="input-icon" />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by ID or customer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loader-container"><div className="spinner"></div></div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th style={{textAlign: 'right'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div className="font-medium text-main" title={order.orderId || order._id}>
                        {((order.orderId || order._id).toString()).substring(0, 8)}...
                      </div>
                    </td>
                    <td><span className="text-muted">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</span></td>
                    <td>
                      <div>{order.userId?.name || order.name || order.customer || 'Unknown'}</div>
                      <div className="text-muted text-xs">{order.userId?.mobile || order.mobile || ''}</div>
                    </td>
                    <td>
                      <div style={{fontSize: '0.9rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={(order.order || order.items || []).map(i => i.title || i.name).join(', ')}>
                        {
                          (() => {
                            const items = order.order || order.items || [];
                            if (items.length === 0) return 'No items';
                            const titleStr = items.map(i => i.title || i.name).slice(0, 2).join(', ');
                            return items.length > 2 ? `${titleStr} (+${items.length - 2} more)` : titleStr;
                          })()
                        }
                      </div>
                      <div className="text-xs text-muted mt-1">Total Qty: {(order.order || order.items || []).reduce((acc, i) => acc + Number(i.qty || i.quantity || 1), 0)}</div>
                    </td>
                    <td className="font-medium">₹{Number(order.totalAmount || order.total || 0).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td style={{textAlign: 'right'}}>
                      <button 
                        onClick={() => navigate(`/orders/${order._id}`)} 
                        className="btn btn-secondary btn-sm"
                        style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem'}}
                      >
                        <FiEye style={{marginRight: '0.3rem'}} /> View
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted" style={{padding: '3rem 1rem'}}>
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
