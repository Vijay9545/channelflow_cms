import { useState, useEffect } from 'react';
import { FiGift, FiPlus, FiTrash, FiCalendar, FiActivity } from 'react-icons/fi';
import api from '../api';
import anime, { animateStagger } from '../hooks/useAnime';
import './Rewards.css';

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    point: '',
    fromDate: '',
    toDate: '',
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRewards();
  }, []);

  useEffect(() => {
    if (!loading) {
      animateStagger('.page-header > *, .search-bar, .stats-grid > *, .table-container, .table tbody tr', {
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(60),
        easing: 'outQuart'
      });
    }
  }, [loading]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/reward/getAllRewardPoint');
      setRewards(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch rewards', err);
      setError('Failed to load reward configurations from API.');
      setRewards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reward configuration?')) return;
    try {
      await api.delete(`/reward/deleteRewardPoint/${id}`);
      fetchRewards();
    } catch (err) {
      console.error('Failed to delete reward', err);
      alert('Failed to delete reward point.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/reward/addRewardPoint', formData);
      setShowModal(false);
      setFormData({ point: '', fromDate: '', toDate: '', isActive: true });
      fetchRewards();
    } catch (err) {
      console.error('Failed to add reward', err);
      alert('Failed to add reward point.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRewards = rewards.filter(r => {
    const pointStr = (r?.point || '').toString();
    const term = searchTerm.toLowerCase();
    return pointStr.includes(term);
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Rewards</h1>
          <p className="text-muted">Active reward and loyalty configurations.</p>
        </div>
        <div className="stat-pill">
          <FiGift /> {rewards.length} Reward Config(s)
        </div>
      </div>

      <div className="card glass-panel mb-4">
        <div className="search-bar input-with-icon" style={{maxWidth: '350px'}}>
          <FiGift className="input-icon" />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by points..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Reward Config
        </button>
      </div>

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      {loading ? (
        <div className="loader-container"><div className="spinner"></div></div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="stats-grid mb-4">
            {rewards.slice(0, 4).map((reward, i) => (
              <div key={i} className="card glass-panel d-flex gap-3 align-center">
                <div className="stat-icon" style={{backgroundColor: 'rgba(99,102,241,0.12)', color: 'var(--primary)'}}>
                  <FiGift />
                </div>
                <div>
                  <div className="font-medium" style={{fontSize: '1.1rem'}}>
                    {reward.point} Points
                  </div>
                  <p className="text-muted m-0" style={{fontSize: '0.8rem'}}>Per ₹100 Spent</p>
                </div>
              </div>
            ))}
          </div>

          {/* Full Table */}
          <div className="card glass-panel">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Reward Points</th>
                    <th>Rate</th>
                    <th>Valid From</th>
                    <th>Valid To</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRewards.length > 0 ? filteredRewards.map((reward, i) => (
                    <tr key={reward._id || reward.id || i}>
                      <td className="font-medium">{reward.point} Points</td>
                      <td>Per ₹100</td>
                      <td className="text-muted">
                        {new Date(reward.fromDate).toLocaleDateString()}
                      </td>
                      <td className="text-muted">
                        {new Date(reward.toDate).toLocaleDateString()}
                      </td>
                      <td>
                        {reward.isActive
                          ? <span className="badge badge-success">Active</span>
                          : <span className="badge badge-neutral">Inactive</span>
                        }
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => handleDelete(reward._id || reward.id)}
                          style={{ 
                            background: '#ef4444', 
                            color: 'white', 
                            border: 'none', 
                            padding: '8px 16px', 
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'inline-block'
                          }}
                        >
                          DELETE
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="text-center text-muted" style={{padding: '3rem'}}>
                        No reward configurations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Reward Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-scale-up">
            <div className="modal-header">
              <h3><FiGift /> Add Reward Configuration</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group mb-3">
                  <label>Points (per ₹100)</label>
                  <input 
                    type="number" 
                    name="point"
                    className="form-control" 
                    placeholder="e.g. 5" 
                    required
                    value={formData.point}
                    onChange={handleInputChange}
                  />
                  <p className="text-muted text-sm mt-1">Number of points earned for every ₹100 spent</p>
                </div>
                
                <div className="row">
                  <div className="col form-group mb-3">
                    <label>From Date</label>
                    <input 
                      type="date" 
                      name="fromDate"
                      className="form-control" 
                      required
                      value={formData.fromDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col form-group mb-3">
                    <label>To Date</label>
                    <input 
                      type="date" 
                      name="toDate"
                      className="form-control" 
                      required
                      value={formData.toDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group d-flex align-center gap-2">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="isActive">Active upon creation</label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;
