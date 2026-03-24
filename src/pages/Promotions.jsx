import { useState, useEffect } from 'react';
import { FiSave, FiImage, FiSettings, FiCheckCircle, FiUpload } from 'react-icons/fi';
import api from '../api';
import anime, { animateStagger } from '../hooks/useAnime';
import './Promotions.css';

const Promotions = () => {
  const [formData, setFormData] = useState({
    active: false,
    targetScreen: 'ProductListing'
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPromotionSettings();
    
    // Cleanup object URL on unmount
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      animateStagger('.page-header > *, .settings-card, .preview-card', {
        translateX: [-30, 0],
        opacity: [0, 1],
        delay: anime.stagger(150),
        easing: 'outQuart'
      });
    }
  }, [loading]);

  const fetchPromotionSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/promotions/popup');
      if (response.data) {
        setFormData({
          active: response.data.active || false,
          targetScreen: response.data.targetScreen || 'ProductListing'
        });
        if (response.data.imageUrl) {
          setPreviewUrl(response.data.imageUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching promotion settings:', error);
      // Fallback silently if the endpoint doesn't exist yet, but show a warning
      if (error.response?.status === 404) {
         setMessage({ type: 'warning', text: 'Backend endpoint not found yet. You can still preview the UI.' });
      } else {
         setMessage({ type: 'error', text: 'Failed to load settings.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Create a local blob URL for immediate preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      const payload = new FormData();
      payload.append('active', formData.active);
      payload.append('targetScreen', formData.targetScreen);
      
      if (imageFile) {
        payload.append('image', imageFile); // 'image' should match what backend multer expects
      }
      
      await api.post('/promotions/popup', payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage({ type: 'success', text: 'Promotion settings saved successfully!' });
    } catch (error) {
      console.error('Error saving promotion settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="promotions-page">
      <div className="page-header">
        <h1>Promotion Popup Settings</h1>
        <p className="text-muted">Manage the promotional banner shown to users in the app</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="promotions-content">
        <div className="card settings-card">
          <div className="card-header">
            <h3><FiSettings className="icon" /> Configuration</h3>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : (
              <form onSubmit={handleSubmit} className="promotions-form">
                
                <div className="form-group toggle-group">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                    />
                    <span className="slider round"></span>
                  </label>
                  <div className="toggle-label">
                    <strong>Enable Promotion Popup</strong>
                    <p className="text-muted text-sm">Turn on to display the popup in the app</p>
                  </div>
                </div>

                <div className="form-group">
                  <label>Banner Image Upload</label>
                  <div className="file-upload-container">
                    <label className="file-upload-label">
                      <FiUpload className="upload-icon" />
                      <span>{imageFile ? imageFile.name : 'Choose an image from local storage'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="file-input"
                      />
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Target Screen</label>
                  <select 
                    name="targetScreen" 
                    value={formData.targetScreen}
                    onChange={handleInputChange}
                  >
                    <option value="Home">Home Screen</option>
                    <option value="ProductListing">Product Listing</option>
                    <option value="Cart">Cart Screen</option>
                    <option value="Profile">User Profile</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : <><FiSave style={{ marginRight: '8px' }}/> Save Changes</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="card preview-card">
          <div className="card-header">
            <h3>Preview</h3>
          </div>
          <div className="card-body">
            {previewUrl ? (
              <div className="image-preview-container">
                <img 
                  src={previewUrl} 
                  alt="Promotion Preview" 
                  className="promotion-preview-img"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image' }}
                />
                <div className="preview-details">
                  <div className="preview-status">
                    Status: {formData.active ? <span className="status-active"><FiCheckCircle /> Active</span> : <span className="status-inactive">Inactive</span>}
                  </div>
                  <div className="preview-target">
                    Target: <strong>{formData.targetScreen}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-preview">
                <FiImage className="empty-icon" />
                <p>Upload an image to see a preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promotions;
