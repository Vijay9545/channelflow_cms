import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiSave, FiX, FiTag, FiTrash2 } from 'react-icons/fi';
import api from '../api';
import anime, { animateStagger } from '../hooks/useAnime';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = create, object = edit
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!loading) {
      animateStagger('.page-header > *, .search-bar, .card, .table tbody tr', {
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(80),
        easing: 'outQuart'
      });
    }
  }, [loading, showForm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/category/getCategoryList');
      setCategories(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
      setError('Failed to load categories from API.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? This might affect products linked to it.')) {
      try {
        await api.delete(`/category/deleteCategory/${id}`);
        setCategories(categories.filter(c => (c._id || c.id) !== id));
      } catch (err) {
        console.error('Failed to delete category', err);
        alert("Failed to delete category. It might be in use or you don't have permission.");
      }
    }
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '', isActive: true });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name || '', description: item.description || '', isActive: item.isActive ?? true });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) {
        await api.put(`/category/updateCategory/${editingItem._id || editingItem.id}`, formData);
      } else {
        await api.post('/category/addCategory', formData);
      }
      closeForm();
      fetchCategories();
    } catch (err) {
      console.error('Failed to save category', err);
      alert('Failed to save. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = categories.filter(cat => {
    const nameStr = cat?.name?.toString() || '';
    const descStr = cat?.description?.toString() || '';
    const term = searchTerm.toLowerCase();
    return nameStr.toLowerCase().includes(term) || descStr.toLowerCase().includes(term);
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Categories</h1>
          <p className="text-muted">Manage product categories.</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <FiPlus /> Add Category
        </button>
      </div>

      <div className="card glass-panel mb-4">
        <div className="search-bar input-with-icon" style={{maxWidth: '350px'}}>
          <FiTag className="input-icon" />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      {/* Inline Form */}
      {showForm && (
        <div className="card glass-panel mb-4 animate-fade-in">
          <div className="d-flex justify-between align-center mb-4">
            <h3 className="text-gradient m-0">{editingItem ? 'Edit Category' : 'New Category'}</h3>
            <button onClick={closeForm} className="icon-btn-action text-muted"><FiX size={20} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group" style={{flex: 2}}>
                <label className="form-label">Category Name *</label>
                <input type="text" className="form-control" value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group" style={{flex: 3}}>
                <label className="form-label">Description</label>
                <input type="text" className="form-control" value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="form-group" style={{flexShrink: 0}}>
                <label className="form-label">Active</label>
                <input type="checkbox" checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  style={{width: '20px', height: '20px', marginTop: '8px'}} />
              </div>
            </div>
            <div className="d-flex gap-3 justify-end mt-4">
              <button type="button" onClick={closeForm} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner-small"></span> : <><FiSave /> Save</>}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card glass-panel">
        {loading ? (
          <div className="loader-container"><div className="spinner"></div></div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{textAlign: 'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length > 0 ? filteredCategories.map((cat) => (
                  <tr key={cat._id || cat.id}>
                    <td className="font-medium">{cat.name}</td>
                    <td className="text-muted">{cat.description || '—'}</td>
                    <td>
                      {cat.isActive
                        ? <span className="badge badge-success">Active</span>
                        : <span className="badge badge-neutral">Inactive</span>}
                    </td>
                    <td className="text-muted">
                      {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{textAlign: 'right'}}>
                      <button onClick={() => openEdit(cat)} className="icon-btn-action text-primary" title="Edit">
                        <FiEdit2 />
                      </button>
                      <button onClick={() => handleDelete(cat._id || cat.id)} className="icon-btn-action text-danger" title="Delete">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted" style={{padding: '3rem'}}>
                      No categories found.
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

export default Categories;
