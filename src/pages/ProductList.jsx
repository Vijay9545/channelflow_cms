import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye, FiX } from 'react-icons/fi';
import api from '../api';
import anime, { animateStagger } from '../hooks/useAnime';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
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
  }, [loading]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/product/getProductList');
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products', err);
      // Removed fallback dummy data to ensure pure API integration
      setError('Could not connect to API or fetch products.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/product/deleteProduct/${id}`);
        setProducts(products.filter(p => p._id !== id && p.id !== id));
      } catch (err) {
        console.error('Failed to delete', err);
        alert('Failed to delete product from the server. Check your permissions.');
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const titleStr = p?.title?.toString() || '';
    const catStr = p?.categoryName?.toString() || '';
    const term = searchTerm.toLowerCase();
    return titleStr.toLowerCase().includes(term) || catStr.toLowerCase().includes(term);
  });

  return (
    <div className="product-list-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p className="text-muted">Manage your catalog and pricing tiers.</p>
        </div>
        <Link to="/products/create" className="btn btn-primary shadow-hover">
          <FiPlus /> Add Product
        </Link>
      </div>

      {error && <div className="alert alert-warning mb-4" style={{borderColor: 'var(--warning)', color: 'var(--warning)'}}>{error}</div>}

      <div className="card glass-panel flex-column gap-3">
        <div className="search-bar input-with-icon" style={{maxWidth: '350px'}}>
          <FiSearch className="input-icon" />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search products..." 
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
                  <th>Product</th>
                  <th>Category</th>
                  <th>Base Price</th>
                  <th>Pricing Tiers</th>
                  <th style={{textAlign: 'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="font-medium text-main">{product.title}</div>
                    </td>
                    <td><span className="badge badge-success">{product.categoryName || 'General'}</span></td>
                    <td>
                      <div className="font-medium">
                        ₹{product.variants?.customer?.price || 0}
                      </div>
                      <div className="text-muted" style={{fontSize: '0.75rem'}}>MRP: ₹{product.variants?.customer?.mrp || 0}</div>
                    </td>
                    <td className="text-muted">
                      {product.priceTiers?.length || 0} tier(s)
                    </td>
                    <td style={{textAlign: 'right'}}>
                      <div className="action-buttons">
                        <button 
                          onClick={() => navigate(`/products/edit/${product._id}`)} 
                          className="icon-btn-action text-primary"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        {product.mainImage && (
                          <button 
                            onClick={() => setSelectedImage(product.mainImage)} 
                            className="icon-btn-action text-success"
                            title="View Image"
                          >
                            <FiEye />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(product._id)} 
                          className="icon-btn-action text-danger"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted" style={{padding: '3rem 1rem'}}>
                      No products found. Add some to build your catalog.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedImage(null)}>
              <FiX />
            </button>
            <img src={selectedImage} alt="Product Detail" className="modal-image-full" />
            <div style={{padding: '1.5rem', textAlign: 'center'}}>
              <p className="m-0 text-muted">Product Image Preview</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
