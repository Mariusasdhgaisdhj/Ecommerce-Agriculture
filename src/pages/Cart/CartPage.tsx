import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const CartPage = () => {
  const { cartItems, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect unauthenticated users to login
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  const convertToPHP = (priceInUSD: number) => {
    const exchangeRate = 58; // Example exchange rate
    return (priceInUSD * exchangeRate).toFixed(2);
  };

  return (
    <Layout isAuthenticated={isAuthenticated}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-7xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty!</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link 
              to="/products" 
              className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition-colors inline-flex items-center"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold">Cart Items ({totalItems})</h2>
                </div>
                
                <ul className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <li key={item._id} className="p-6 flex flex-col sm:flex-row sm:items-center">
                      <div className="sm:flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-md"
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                        <p className="text-green-700 font-medium mb-4">₱{convertToPHP(item.price)}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border rounded-md">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="px-3 py-1 text-gray-600 hover:text-gray-900"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-3 py-1 border-x">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="px-3 py-1 text-gray-600 hover:text-gray-900"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="text-red-600 hover:text-red-800 flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4 sm:mt-0 sm:ml-6 text-right">
                        <p className="text-lg font-bold">
                          ₱{convertToPHP(item.price * item.quantity)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₱{convertToPHP(totalPrice)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">₱150.00</span>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>₱{(parseFloat(convertToPHP(totalPrice)) + 150).toFixed(2)}</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">Including VAT</p>
                  </div>
                  
                  <Link
                    to="/checkout"
                    className="block w-full bg-green-700 text-white text-center px-4 py-3 rounded-lg font-medium hover:bg-green-800 transition-colors mt-6"
                  >
                    Proceed to Checkout
                  </Link>
                  
                  <Link
                    to="/products"
                    className="block w-full text-center px-4 py-3 rounded-lg border border-gray-300 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CartPage; 