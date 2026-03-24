import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiSave, FiX, FiTag, FiTrash2 } from 'react-icons/fi';
import api from '../api';
import anime, { animateStagger } from '../hooks/useAnime';

const SubCategories = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', categoryId: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAll();
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

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [subRes, catRes] = await Promise.all([
        api.get('/sub-category/getSubCategoryList'),
        api.get('/category/getCategoryList'),
      ]);
      setSubCategories(Array.isArray(subRes.data) ? subRes.data : subRes.data.data || []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch sub-categories', err);
      setError('Failed to load data from API.');
      setSubCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sub-category? This might affect products linked to it.')) {
      try {
        await api.delete(`/sub-category/deleteSubCategory/${id}`);
        setSubCategories(subCategories.filter(s => (s._id || s.id) !== id));
      } catch (err) {
        console.error('Failed to delete sub-category', err);
        alert("Failed to delete sub-category. It might be in use or you don't have permission.");
      }
    }
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '', categoryId: '', isActive: true });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      categoryId: item.categoryId || item.category?._id || '',
      isActive: item.isActive ?? true
    });
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
        await api.put(`/sub-category/updateSubCategory/${editingItem._id || editingItem.id}`, formData);
      } else {
        await api.post('/sub-category/addSubCategory', formData);
      }
      closeForm();
      fetchAll();
    } catch (err) {
      console.error('Failed to save sub-category', err);
      alert('Failed to save. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryName = (item) => {
    if (item.categoryName) return item.categoryName;
    if (item.category?.name) return item.category.name;
    const cat = categories.find(c => c._id === item.categoryId || c.id === item.categoryId);
    return cat?.name || '—';
  };

  const filteredSubCategories = subCategories.filter(item => {
    const nameStr = item?.name?.toString() || '';
    const catName = getCategoryName(item) || '';
    const term = searchTerm.toLowerCase();
    return nameStr.toLowerCase().includes(term) || catName.toLowerCase().includes(term);
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Sub-Categories</h1>
          <p className="text-muted">Manage product sub-categories.</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <FiPlus /> Add Sub-Category
        </button>
      </div>

      <div className="card glass-panel mb-4">
        <div className="search-bar input-with-icon" style={{maxWidth: '350px'}}>
          <FiTag className="input-icon" />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search sub-categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      {showForm && (
        <div className="card glass-panel mb-4 animate-fade-in">
          <div className="d-flex justify-between align-center mb-4">
            <h3 className="text-gradient m-0">{editingItem ? 'Edit Sub-Category' : 'New Sub-Category'}</h3>
            <button onClick={closeForm} className="icon-btn-action text-muted"><FiX size={20} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group" style={{flex: 2}}>
                <label className="form-label">Sub-Category Name *</label>
                <input type="text" className="form-control" value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group" style={{flex: 2}}>
                <label className="form-label">Parent Category *</label>
                <select className="form-control" value={formData.categoryId}
                  onChange={e => setFormData({...formData, categoryId: e.target.value})} required>
                  <option value="">-- Select Category --</option>
                  {categories.map(cat => (
                    <option key={cat._id || cat.id} value={cat._id || cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{flex: 2}}>
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
                  <th>Parent Category</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th style={{textAlign: 'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubCategories.length > 0 ? filteredSubCategories.map((item) => (
                  <tr key={item._id || item.id}>
                    <td className="font-medium">{item.name}</td>
                    <td><span className="badge badge-primary">{getCategoryName(item)}</span></td>
                    <td className="text-muted">{item.description || '—'}</td>
                    <td>
                      {item.isActive
                        ? <span className="badge badge-success">Active</span>
                        : <span className="badge badge-neutral">Inactive</span>}
                    </td>
                    <td style={{textAlign: 'right'}}>
                      <button onClick={() => openEdit(item)} className="icon-btn-action text-primary" title="Edit">
                        <FiEdit2 />
                      </button>
                      <button onClick={() => handleDelete(item._id || item.id)} className="icon-btn-action text-danger" title="Delete">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted" style={{padding: '3rem'}}>
                      No sub-categories found.
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

export default SubCategories;
