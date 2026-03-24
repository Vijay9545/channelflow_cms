import { useState, useEffect } from 'react';
import { FiGift, FiPercent, FiCalendar, FiToggleRight } from 'react-icons/fi';
import api from '../api';
import anime, { animateStagger } from '../hooks/useAnime';

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const getRewardBadge = (type) => {
    return <span className="badge badge-neutral">{type || 'Unknown'}</span>;
  };

  const filteredRewards = rewards.filter(r => {
    const nameStr = (r?.name || r?.title || '').toString();
    const typeStr = (r?.type || '').toString();
    const term = searchTerm.toLowerCase();
    return nameStr.toLowerCase().includes(term) || typeStr.toLowerCase().includes(term);
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
            placeholder="Search rewards..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
                  {reward.type === 'percentage' ? <FiPercent /> : <FiGift />}
                </div>
                <div>
                  <div className="font-medium" style={{fontSize: '1.1rem'}}>
                    {reward.type === 'percentage' ? `${reward.value}%` : `₹${reward.value}`}
                  </div>
                  <p className="text-muted m-0" style={{fontSize: '0.8rem'}}>{reward.name || reward.title || 'Reward'}</p>
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
                    <th>Name / Title</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Min Order</th>
                    <th>Valid Until</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRewards.length > 0 ? filteredRewards.map((reward, i) => (
                    <tr key={reward._id || reward.id || i}>
                      <td className="font-medium">{reward.name || reward.title || '—'}</td>
                      <td>{getRewardBadge(reward.type)}</td>
                      <td>
                        {reward.type === 'percentage'
                          ? `${reward.value || reward.discount}%`
                          : `₹${reward.value || reward.amount}`
                        }
                      </td>
                      <td className="text-muted">
                        {reward.minOrderValue || reward.minimumOrder ? `₹${reward.minOrderValue || reward.minimumOrder}` : '—'}
                      </td>
                      <td className="text-muted">
                        {reward.validUntil || reward.expiryDate
                          ? new Date(reward.validUntil || reward.expiryDate).toLocaleDateString()
                          : '—'
                        }
                      </td>
                      <td>
                        {reward.isActive
                          ? <span className="badge badge-success">Active</span>
                          : <span className="badge badge-neutral">Inactive</span>
                        }
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
    </div>
  );
};

export default Rewards;
