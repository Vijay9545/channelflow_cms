import { Routes, Route } from 'react-router-dom';
import OrderList from './OrderList';
import OrderDetails from './OrderDetails';
import './Orders.css';

const Orders = () => {
  return (
    <div className="orders-module">
      <Routes>
        <Route path="/" element={<OrderList />} />
        <Route path="/:id" element={<OrderDetails />} />
      </Routes>
    </div>
  );
};

export default Orders;
