import { Routes, Route } from 'react-router-dom';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import './Products.css';

const Products = () => {
  return (
    <div className="products-module">
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/create" element={<ProductForm />} />
        <Route path="/edit/:id" element={<ProductForm />} />
      </Routes>
    </div>
  );
};

export default Products;
