import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiPlus, FiTrash2, FiUpload, FiImage } from 'react-icons/fi';
import api from '../api';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [extraUrl, setExtraUrl] = useState(''); // Temp state for pasting extra URLs
  const [extraImageFiles, setExtraImageFiles] = useState([]); // Array of { file, preview, isExisting, url }
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryName: '',
    categoryId: '',
    subCategoryId: '',
    mainImage: '',
    images: [],
    sku: '',
    hsnCode: '',
    gst: '18%',
    variants: {
      distributor: { price: '', mrp: '', qty: '', miniOrderQty: '' },
      retailer: { price: '', mrp: '', qty: '', miniOrderQty: '' },
      customer: { price: '', mrp: '', qty: '', miniOrderQty: '' }
    },
    priceTiers: [
      { minQty: 1, price: '' }
    ]
  });

  const fetchDependencyData = async () => {
    try {
      const [catRes, subRes] = await Promise.all([
        api.get('/category/getCategoryList'),
        api.get('/sub-category/getSubCategoryList'),
      ]);
      setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data.data || []);
      setSubCategories(Array.isArray(subRes.data) ? subRes.data : subRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch dependency data', err);
    }
  };

  useEffect(() => {
    fetchDependencyData();
    if (isEditMode) {
      fetchProduct();
    }
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      extraImageFiles.forEach(img => {
        if (img.preview && img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [id]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, mainImage: '' })); // clear the text url if local file used
    }
  };

  const handleExtraFilesChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newExtraImages = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        isExisting: false
      }));
      setExtraImageFiles(prev => [...prev, ...newExtraImages]);
    }
  };

  const removeExtraImage = (index) => {
    setExtraImageFiles(prev => {
      const newImages = [...prev];
      const removed = newImages.splice(index, 1)[0];
      if (removed.preview && removed.preview.startsWith('blob:')) {
        URL.revokeObjectURL(removed.preview);
      }
      return newImages;
    });
  };

  const addExtraUrl = () => {
    if (extraUrl.trim()) {
      setExtraImageFiles(prev => [...prev, {
        file: null,
        preview: extraUrl.trim(),
        url: extraUrl.trim(),
        isExisting: true
      }]);
      setExtraUrl('');
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/product/getProduct/${id}`);
      const fetchedData = res.data.data || res.data;
      setFormData({
        ...formData,
        ...fetchedData,
        // Ensure variants exist to avoid crashes
        variants: fetchedData.variants || formData.variants
      });
      if (fetchedData.mainImage) {
        setPreviewUrl(fetchedData.mainImage);
      }
      if (fetchedData.images && Array.isArray(fetchedData.images)) {
        setExtraImageFiles(fetchedData.images.map(url => ({
          file: null,
          preview: url,
          url: url,
          isExisting: true
        })));
      }
    } catch (err) {
      console.error('Failed to fetch product', err);
      alert('Could not fetch product details from the API. Returning to list.');
      navigate('/products');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTierChange = (index, field, value) => {
    const newTiers = [...formData.priceTiers];
    newTiers[index][field] = value;
    setFormData(prev => ({ ...prev, priceTiers: newTiers }));
  };

  const addTier = () => {
    setFormData(prev => ({
      ...prev,
      priceTiers: [...prev.priceTiers, { minQty: '', price: '' }]
    }));
  };

  const handleVariantChange = (variant, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: {
        ...prev.variants,
        [variant]: {
          ...prev.variants[variant],
          [field]: field === 'price' || field === 'mrp' || field === 'qty' || field === 'miniOrderQty' ? Number(value) : value
        }
      }
    }));
  };

  const removeTier = (index) => {
    setFormData(prev => ({
      ...prev,
      priceTiers: prev.priceTiers.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadData = new FormData();
      
      const vData = { ...formData.variants };
      Object.keys(vData).forEach(key => {
        uploadData.append(`variants[${key}][price]`, Number(vData[key].price) || 0);
        uploadData.append(`variants[${key}][mrp]`, Number(vData[key].mrp) || 0);
        uploadData.append(`variants[${key}][qty]`, Number(vData[key].qty) || 0);
        uploadData.append(`variants[${key}][miniOrderQty]`, Number(vData[key].miniOrderQty) || 0);
      });

      formData.priceTiers.forEach((tier, index) => {
        uploadData.append(`priceTiers[${index}][minQty]`, Number(tier.minQty) || 0);
        uploadData.append(`priceTiers[${index}][price]`, Number(tier.price) || 0);
      });

      ['title', 'sku', 'hsnCode', 'gst'].forEach(key => {
        uploadData.append(key, formData[key] || '');
      });
      
      if (formData.subCategoryId && formData.subCategoryId.trim() !== '') {
        uploadData.append('subCategoryId', formData.subCategoryId.trim());
      }

      if (imageFile) {
        uploadData.append('mainImage', imageFile);
      } else if (formData.mainImage) {
        uploadData.append('mainImage', formData.mainImage);
      }

      // Add extra images
      extraImageFiles.forEach((img, index) => {
        if (img.file) {
          uploadData.append('images', img.file);
        } else if (img.isExisting && img.url) {
          uploadData.append(`images`, img.url);
        }
      });

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (isEditMode) {
        await api.put(`/product/updateProduct/${id}`, uploadData, config);
      } else {
        // use the exact path they had earlier:
        await api.post('/api/product/addSingleProduct'.replace('/api', ''), uploadData, config);
      }
      navigate('/products');
    } catch (err) {
      console.error('Failed to save product', err);
      alert('Failed to save product to the API. Please check your console for details.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="loader-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="product-form-page animate-fade-in">
      <div className="page-header d-flex justify-between align-center mb-4">
        <div className="d-flex align-center gap-3">
          <button onClick={() => navigate('/products')} className="icon-btn-action text-muted mr-2">
            <FiArrowLeft size={24} />
          </button>
          <div>
            <h1>{isEditMode ? 'Edit Product' : 'Create Product'}</h1>
            <p className="text-muted">{isEditMode ? 'Update product details' : 'Add a new product to your catalog'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="card glass-panel main-form-section">
          <h3 className="mb-4 text-gradient">General Information</h3>
          
          <div className="form-group">
            <label className="form-label">Product Title *</label>
            <input 
              type="text" 
              name="title" 
              className="form-control" 
              value={formData.title} 
              onChange={handleInputChange} 
              required 
            />
          </div>

          <div className="form-grid-three mb-3">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select 
                name="categoryId" 
                className="form-control" 
                value={formData.categoryId} 
                onChange={(e) => {
                  const catId = e.target.value;
                  const selectedCat = categories.find(c => (c._id || c.id) === catId);
                  setFormData(prev => ({
                    ...prev,
                    categoryId: catId,
                    categoryName: selectedCat ? selectedCat.name : '',
                    subCategoryId: '' 
                  }));
                }} 
                required
              >
                <option value="">-- Select Category --</option>
                {categories.filter(c => c.isActive !== false).map(cat => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{gridColumn: 'span 2'}}>
              <label className="form-label">Sub-Category</label>
              <select 
                name="subCategoryId" 
                className="form-control" 
                value={formData.subCategoryId} 
                onChange={handleInputChange}
                disabled={!formData.categoryId}
              >
                <option value="">-- Select Sub-Category --</option>
                {subCategories
                  .filter(sc => sc.isActive !== false && (sc.categoryId === formData.categoryId || sc.category?._id === formData.categoryId || sc.category === formData.categoryId))
                  .map(sub => (
                    <option key={sub._id || sub.id} value={sub._id || sub.id}>{sub.name}</option>
                  ))}
              </select>
            </div>
          </div>

          <div className="form-grid-three mb-3">
            <div className="form-group">
              <label className="form-label">SKU</label>
              <input name="sku" type="text" className="form-control" value={formData.sku} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label className="form-label">GST (%)</label>
              <input name="gst" type="text" className="form-control" value={formData.gst} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label className="form-label">HSN Code</label>
              <input name="hsnCode" type="text" className="form-control" value={formData.hsnCode} onChange={handleInputChange} />
            </div>
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Main Image (Select Local File OR paste URL)</label>
            <div className="d-flex align-center gap-3">
              <div style={{flex: 1}} className="file-upload-container">
                <label className="file-upload-label" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 12px', border: '2px dashed #ddd', borderRadius: '6px', cursor: 'pointer', background: '#fafafa', margin: 0, height: '42px', boxSizing: 'border-box'}}>
                  <FiUpload size={18} className="text-muted" />
                  <span className="text-muted" style={{fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px'}}>
                    {imageFile ? imageFile.name : 'Choose local file...'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{display: 'none'}} />
                </label>
              </div>
              <div style={{color: '#888', fontWeight: 'bold', fontSize: '14px'}}>OR</div>
              <div style={{flex: 1}}>
                <input name="mainImage" type="text" className="form-control" placeholder="https://..." value={formData.mainImage} onChange={(e) => { handleInputChange(e); setImageFile(null); setPreviewUrl(e.target.value); }} />
              </div>
            </div>
            {previewUrl && (
              <div className="mt-3" style={{width: '200px', height: '150px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #eee', background: '#f8f9fa'}}>
                <img src={previewUrl} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'contain'}} onError={(e)=>{e.target.src='https://placehold.co/400x400?text=Invalid+Image'}} />
              </div>
            )}
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Additional Images (Files OR URLs)</label>
            <div className="d-flex flex-column gap-2">
              <div className="file-upload-container">
                <label className="file-upload-label" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 12px', border: '2px dashed #ddd', borderRadius: '6px', cursor: 'pointer', background: '#fafafa', margin: 0, height: '42px', boxSizing: 'border-box'}}>
                  <FiUpload size={18} className="text-muted" />
                  <span className="text-muted" style={{fontSize: '14px'}}>Choose local files...</span>
                  <input type="file" accept="image/*" multiple onChange={handleExtraFilesChange} style={{display: 'none'}} />
                </label>
              </div>
              
              <div className="d-flex gap-2">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Paste additional image URL..." 
                  value={extraUrl}
                  onChange={(e) => setExtraUrl(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addExtraUrl(); } }}
                />
                <button type="button" onClick={addExtraUrl} className="btn btn-secondary px-3" style={{height: '42px'}}>
                  <FiPlus />
                </button>
              </div>
            </div>
            
            {extraImageFiles.length > 0 && (
              <div className="mt-3" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px'}}>
                {extraImageFiles.map((img, idx) => (
                  <div key={idx} style={{position: 'relative', width: '120px', height: '100px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #eee', background: '#f8f9fa'}}>
                    <img src={img.preview} alt={`Extra ${idx}`} style={{width: '100%', height: '100%', objectFit: 'contain'}} onError={(e)=>{e.target.src='https://placehold.co/400x400?text=Invalid+Image'}} />
                    <button 
                      type="button" 
                      onClick={() => removeExtraImage(idx)} 
                      style={{position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px'}}
                      title="Remove Image"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              name="description" 
              className="form-control" 
              rows="4" 
              value={formData.description} 
              onChange={handleInputChange}
            ></textarea>
          </div>

          <hr className="my-4" style={{opacity: 0.1}} />
          <h3 className="mb-4 text-gradient">Base Pricing & Variants</h3>
          
          <div className="variants-grid">
            {['distributor', 'retailer', 'customer'].map(vType => (
              <div key={vType} className="card glass-panel mb-3" style={{padding: '1rem'}}>
                <h4 style={{textTransform: 'capitalize', marginBottom: '1rem'}}>{vType}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                  <div className="form-group m-0">
                    <label className="form-label text-xs">Price (₹)</label>
                    <input type="number" className="form-control form-control-sm" value={formData.variants[vType].price} onChange={(e) => handleVariantChange(vType, 'price', e.target.value)} />
                  </div>
                  <div className="form-group m-0">
                    <label className="form-label text-xs">MRP (₹)</label>
                    <input type="number" className="form-control form-control-sm" value={formData.variants[vType].mrp} onChange={(e) => handleVariantChange(vType, 'mrp', e.target.value)} />
                  </div>
                  <div className="form-group m-0">
                    <label className="form-label text-xs">Stock Qty</label>
                    <input type="number" className="form-control form-control-sm" value={formData.variants[vType].qty} onChange={(e) => handleVariantChange(vType, 'qty', e.target.value)} />
                  </div>
                  <div className="form-group m-0">
                    <label className="form-label text-xs">Min Order</label>
                    <input type="number" className="form-control form-control-sm" value={formData.variants[vType].miniOrderQty} onChange={(e) => handleVariantChange(vType, 'miniOrderQty', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card glass-panel side-form-section">
          <div className="d-flex justify-between align-center mb-4">
            <h3 className="text-gradient m-0">Pricing Tiers</h3>
            <button type="button" onClick={addTier} className="btn btn-secondary btn-sm" style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem'}}>
              <FiPlus /> Add Tier
            </button>
          </div>
          
          <p className="text-muted" style={{fontSize: '0.85rem', marginBottom: '1.5rem'}}>
            Configure bulk pricing logic.
          </p>

          <div className="tiers-container">
            {formData.priceTiers.map((tier, index) => (
              <div key={index} className="pricing-tier-row">
                <div className="tier-inputs">
                  <div className="form-group m-0" style={{flex: 1}}>
                    <label className="form-label text-xs">Min Qty</label>
                    <input 
                      type="number" 
                      min="1"
                      className="form-control form-control-sm" 
                      value={tier.minQty} 
                      onChange={(e) => handleTierChange(index, 'minQty', e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group m-0" style={{flex: 1}}>
                    <label className="form-label text-xs">Price ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      className="form-control form-control-sm" 
                      value={tier.price} 
                      onChange={(e) => handleTierChange(index, 'price', e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                {formData.priceTiers.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeTier(index)} 
                    className="icon-btn-action text-danger mt-4" 
                    title="Remove Tier"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>

      <div className="form-actions mt-4 card glass-panel d-flex justify-end gap-3" style={{padding: '1rem 1.5rem'}}>
        <button type="button" onClick={() => navigate('/products')} className="btn btn-secondary">
          Cancel
        </button>
        <button type="button" onClick={handleSubmit} className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner-small" style={{width: '16px', height: '16px'}}></span> : <span><FiSave /> Save Product</span>}
        </button>
      </div>
    </div>
  );
};

export default ProductForm;
