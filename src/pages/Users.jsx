import { useState, useEffect } from 'react';
import { FiUsers, FiPlus, FiSave, FiX, FiMail, FiPhone, FiHome, FiLock, FiBriefcase } from 'react-icons/fi';
import api from '../api';
import anime, { animateStagger } from '../hooks/useAnime';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 2,
    name: '',
    mobile: '',
    company: '',
    deliveryAddress: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!loading) {
      // Premium entrance animation
      animateStagger('.page-header > *, .search-bar, .card, .table tbody tr', {
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(80),
        easing: 'outQuart'
      });
    }
  }, [loading, showForm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/user/getAllUser');
      setUsers(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
      setError('Failed to load users from API.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'role' ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/user/register', formData);
      setShowForm(false);
      setFormData({
        email: '',
        password: '',
        role: 2,
        name: '',
        mobile: '',
        company: '',
        deliveryAddress: ''
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to register user', err);
      alert('Registration failed. Please check your admin privileges and try again.');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role) => {
    if (role === 0) return <span className="badge badge-danger">Admin</span>;
    if (role === 1) return <span className="badge badge-warning">Manager</span>;
    return <span className="badge badge-success">User</span>;
  };

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    const searchableString = `${u?.name || ''} ${u?.email || ''} ${u?.mobile || ''} ${u?.company || ''}`.toLowerCase();
    return searchableString.includes(term);
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p className="text-muted">All registered users in the system.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? <><FiX /> Cancel</> : <><FiPlus /> Register User</>}
        </button>
      </div>

      <div className="card glass-panel mb-4">
        <div className="search-bar input-with-icon" style={{maxWidth: '350px'}}>
          <FiUsers className="input-icon" />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showForm && (
        <div className="card glass-panel mb-4 animate-fade-in">
          <div className="d-flex justify-between align-center mb-4">
            <h3 className="text-gradient m-0">Register New User</h3>
            <button onClick={() => setShowForm(false)} className="icon-btn-action text-muted"><FiX size={20} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid-three">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div className="input-with-icon">
                  <FiUsers className="input-icon" />
                  <input name="name" type="text" className="form-control" value={formData.name} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <div className="input-with-icon">
                  <FiMail className="input-icon" />
                  <input name="email" type="email" className="form-control" value={formData.email} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <div className="input-with-icon">
                  <FiLock className="input-icon" />
                  <input name="password" type="password" className="form-control" value={formData.password} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <div className="input-with-icon">
                  <FiPhone className="input-icon" />
                  <input name="mobile" type="text" className="form-control" value={formData.mobile} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Company</label>
                <div className="input-with-icon">
                  <FiBriefcase className="input-icon" />
                  <input name="company" type="text" className="form-control" value={formData.company} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select name="role" className="form-control" value={formData.role} onChange={handleInputChange} required>
                  <option value={2}>User (Retailer)</option>
                  <option value={1}>Manager</option>
                  <option value={0}>Super Admin (0)</option>
                </select>
              </div>
            </div>
            <div className="form-group mt-3">
              <label className="form-label">Delivery Address</label>
              <div className="input-with-icon">
                <FiHome className="input-icon" />
                <input name="deliveryAddress" type="text" className="form-control" value={formData.deliveryAddress} onChange={handleInputChange} />
              </div>
            </div>
            <div className="d-flex gap-3 justify-end mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner-small"></span> : <><FiSave /> Register</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      <div className="card glass-panel">
        {loading ? (
          <div className="loader-container"><div className="spinner"></div></div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? filteredUsers.map((user) => {
                  const displayName = user.name || user.email || user.mobile || 'Unknown User';
                  const dateStr = user.createdAt || user.register_date || user.updatedAt;
                  return (
                  <tr key={user._id || user.id}>
                    <td>
                      <div className="user-cell d-flex align-center gap-3">
                        <div className="user-avatar-sm d-flex align-center justify-center font-medium" style={{width: 36, height: 36, borderRadius: '50%', backgroundColor: '#f0f4f8', color: '#4a90e2'}}>
                          {displayName[0].toUpperCase()}
                        </div>
                        <span className="font-medium">{displayName}</span>
                      </div>
                    </td>
                    <td className="text-muted">{user.email || '—'}</td>
                    <td className="text-muted">{user.mobile || '—'}</td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td><span className={`badge ${user.isActive ? 'badge-success' : 'badge-neutral'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="text-muted">{dateStr ? new Date(dateStr).toLocaleDateString() : '—'}</td>
                  </tr>
                )}) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted" style={{padding: '3rem'}}>No users found.</td>
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

export default Users;
