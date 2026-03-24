import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiClock } from 'react-icons/fi';
import api from '../api';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/order/getOrderById/${id}`);
      setOrder(res.data.data || res.data);
    } catch (err) {
      console.error('Failed to fetch order', err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusUpdating(true);
      await api.put(`/order/updateOrder/${id}`, { status: newStatus });
      setOrder(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Failed to update status', err);
      alert('API Error: Could not update the order status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;
  if (!order) return <div className="alert alert-danger m-4">Order not found</div>;

  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case 'pending': return <FiClock />;
      case 'processing': return <FiPackage />;
      case 'shipped': return <FiTruck />;
      case 'delivered': return <FiCheckCircle />;
      default: return <FiClock />;
    }
  };

  return (
    <div className="order-details-page animate-fade-in">
      <div className="page-header d-flex justify-between align-center mb-4">
        <div className="d-flex align-center gap-3">
          <button onClick={() => navigate('/orders')} className="icon-btn-action text-muted mr-2">
            <FiArrowLeft size={24} />
          </button>
          <div>
            <h1>Order #{order.orderId || order._id}</h1>
            <p className="text-muted">Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
        <div className="status-updater d-flex align-center gap-3">
          <span className="text-muted">Update Status:</span>
          <select 
            className="form-control" 
            style={{width: 'auto', minWidth: '150px'}}
            value={order.status || 'Pending'}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={statusUpdating}
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          {statusUpdating && <span className="spinner-small" style={{width: '18px', height: '18px', borderColor: 'var(--primary)', borderTopColor: 'transparent'}}></span>}
        </div>
      </div>

      <div className="order-grid">
        <div className="order-main">
          <div className="card glass-panel mb-4">
            <h3 className="mb-4 text-gradient">Order Items</h3>
            <div className="table-container" style={{border: 'none', background: 'transparent'}}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{textAlign: 'center'}}>Price</th>
                    <th style={{textAlign: 'center'}}>Qty</th>
                    <th style={{textAlign: 'right'}}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.order || order.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="font-medium">
                        <div className="d-flex align-center gap-2">
                          {item.mainImage && <img src={item.mainImage} alt={item.title || item.name} style={{width: 40, height: 40, objectFit: 'cover', borderRadius: 4}} />}
                          <span>{item.title || item.name}</span>
                        </div>
                      </td>
                      <td style={{textAlign: 'center'}}>₹{Number(item.price || 0).toFixed(2)}</td>
                      <td style={{textAlign: 'center'}}>{item.qty || item.quantity}</td>
                      <td style={{textAlign: 'right'}} className="font-medium">₹{Number(item.finalPrice || (item.price * (item.qty || item.quantity)) || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="order-summary mt-4 d-flex justify-end">
              <div className="summary-box" style={{minWidth: '250px'}}>
                <div className="d-flex justify-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span>₹{Number(order.totalAmount || order.total || 0).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-between mb-2">
                  <span className="text-muted">Shipping</span>
                  <span>Free</span>
                </div>
                <hr style={{borderColor: 'var(--border)', margin: '1rem 0'}} />
                <div className="d-flex justify-between font-medium" style={{fontSize: '1.2rem'}}>
                  <span>Total</span>
                  <span className="text-success">₹{Number(order.totalAmount || order.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-sidebar">
          <div className="card glass-panel mb-4">
            <h3 className="mb-4 text-gradient">Current Status</h3>
            <div className="status-display d-flex align-center gap-3" style={{padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)'}}>
              <div className="status-icon text-primary" style={{fontSize: '2rem'}}>
                {getStatusIcon(order.status || 'Pending')}
              </div>
              <div>
                <div className="font-medium" style={{fontSize: '1.2rem'}}>{order.status || 'Pending'}</div>
                <p className="text-muted m-0 text-xs">Awaiting next steps</p>
              </div>
            </div>
          </div>

          <div className="card glass-panel mb-4">
            <h3 className="mb-4 text-gradient">Customer Info</h3>
            <div className="info-row mb-3">
              <div className="text-xs text-muted">Name</div>
              <div className="font-medium">{order.userId?.name || order.name || 'Unknown'}</div>
            </div>
            {order.company && (
              <div className="info-row mb-3">
                <div className="text-xs text-muted">Company</div>
                <div>{order.company}</div>
              </div>
            )}
            <div className="info-row mb-3">
              <div className="text-xs text-muted">Phone</div>
              <div>{order.userId?.mobile || order.mobile || 'Unknown'}</div>
            </div>
          </div>

          <div className="card glass-panel">
            <h3 className="mb-4 text-gradient">Shipping Address</h3>
            <p className="m-0" style={{lineHeight: '1.6'}}>
              {order.deliveryAddress || order.address || 'Address not provided'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
