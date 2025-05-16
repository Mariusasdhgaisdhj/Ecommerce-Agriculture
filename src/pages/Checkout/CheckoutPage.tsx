import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, CheckCircle } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../services/api';

const CheckoutPage = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { cartItems, totalItems, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect unauthenticated users to login
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Redirect to cart if cart is empty
    if (cartItems.length === 0 && !orderPlaced) {
      navigate('/cart');
    }
    
    // Pre-fill address if user is logged in
    if (user?.address) {
      setShippingAddress(user.address);
    }
  }, [cartItems.length, user, navigate, orderPlaced, isAuthenticated]);

  const convertToPHP = (priceInUSD: number) => {
    const exchangeRate = 58; // Example exchange rate
    return (priceInUSD * exchangeRate).toFixed(2);
  };

  const handleNext = () => {
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      setError('Shipping address is required');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const orderData = {
        cartItems: cartItems.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        paymentMethod,
        shippingAddress
      };
      
      // Add nonce if using braintree payment
      if (paymentMethod === 'braintree') {
        (orderData as any).nonce = 'demo-nonce-' + Date.now(); // For demo purpose
      }
      
      await orderAPI.createOrder(orderData);
      
      // Clear the cart
      clearCart();
      
      // Show success message
      setOrderPlaced(true);
      setActiveStep(3);
    } catch (err: any) {
      console.error('Error placing order:', err);
      setError(err.response?.data?.message || 'Failed to place your order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout isAuthenticated={isAuthenticated}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
        
        {/* Checkout Steps */}
        <div className="flex justify-center mb-12">
          <div className="w-full max-w-3xl">
            <div className="flex items-center">
              <div className={`flex-1 text-center ${activeStep >= 1 ? 'text-green-700' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center border-2 ${activeStep >= 1 ? 'border-green-700 bg-green-50' : 'border-gray-300'}`}>
                  1
                </div>
                <div className="mt-2">Shipping</div>
              </div>
              
              <div className={`w-full h-1 ${activeStep >= 2 ? 'bg-green-700' : 'bg-gray-300'}`}></div>
              
              <div className={`flex-1 text-center ${activeStep >= 2 ? 'text-green-700' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center border-2 ${activeStep >= 2 ? 'border-green-700 bg-green-50' : 'border-gray-300'}`}>
                  2
                </div>
                <div className="mt-2">Payment</div>
              </div>
              
              <div className={`w-full h-1 ${activeStep >= 3 ? 'bg-green-700' : 'bg-gray-300'}`}></div>
              
              <div className={`flex-1 text-center ${activeStep >= 3 ? 'text-green-700' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center border-2 ${activeStep >= 3 ? 'border-green-700 bg-green-50' : 'border-gray-300'}`}>
                  3
                </div>
                <div className="mt-2">Confirmation</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Checkout Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {activeStep === 1 && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <Truck className="mr-2 h-5 w-5 text-green-700" />
                    Shipping Information
                  </h2>
                  
                  {!isAuthenticated && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-blue-800">
                        Already have an account? <button className="font-medium underline" onClick={() => navigate('/login')}>Login</button> for a faster checkout.
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="block text-gray-700 font-medium">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                          defaultValue={user?.name?.split(' ')[0] || ''}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="block text-gray-700 font-medium">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                          defaultValue={user?.name?.split(' ')[1] || ''}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-gray-700 font-medium">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                        defaultValue={user?.email || ''}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-gray-700 font-medium">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                        defaultValue={user?.phone || ''}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="address" className="block text-gray-700 font-medium">
                        Shipping Address
                      </label>
                      <textarea
                        id="address"
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Enter your full shipping address"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {activeStep === 2 && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <CreditCard className="mr-2 h-5 w-5 text-green-700" />
                    Payment Method
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      <label className={`border rounded-lg p-4 flex items-center cursor-pointer ${paymentMethod === 'card' ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                          className="mr-3 text-green-600"
                        />
                        <div>
                          <h3 className="font-medium">Credit/Debit Card</h3>
                          <p className="text-sm text-gray-600">Pay with Visa, Mastercard, etc.</p>
                        </div>
                      </label>
                      
                      <label className={`border rounded-lg p-4 flex items-center cursor-pointer ${paymentMethod === 'paypal' ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="paypal"
                          checked={paymentMethod === 'paypal'}
                          onChange={() => setPaymentMethod('paypal')}
                          className="mr-3 text-green-600"
                        />
                        <div>
                          <h3 className="font-medium">PayPal</h3>
                          <p className="text-sm text-gray-600">Pay with your PayPal account</p>
                        </div>
                      </label>
                      
                      <label className={`border rounded-lg p-4 flex items-center cursor-pointer ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="mr-3 text-green-600"
                        />
                        <div>
                          <h3 className="font-medium">Cash on Delivery</h3>
                          <p className="text-sm text-gray-600">Pay when you receive your order</p>
                        </div>
                      </label>
                    </div>
                    
                    {paymentMethod === 'card' && (
                      <div className="space-y-6 mt-6 border-t pt-6">
                        <div className="space-y-2">
                          <label htmlFor="cardNumber" className="block text-gray-700 font-medium">
                            Card Number
                          </label>
                          <input
                            type="text"
                            id="cardNumber"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                            placeholder="1234 5678 9012 3456"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label htmlFor="expiryDate" className="block text-gray-700 font-medium">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              id="expiryDate"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                              placeholder="MM/YY"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="cvv" className="block text-gray-700 font-medium">
                              CVV
                            </label>
                            <input
                              type="text"
                              id="cvv"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                              placeholder="123"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="nameOnCard" className="block text-gray-700 font-medium">
                            Name on Card
                          </label>
                          <input
                            type="text"
                            id="nameOnCard"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeStep === 3 && (
                <div className="p-6">
                  {orderPlaced ? (
                    <div className="text-center py-8">
                      <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                        <CheckCircle className="text-green-600 h-8 w-8" />
                      </div>
                      <h2 className="text-2xl font-semibold mb-2">Order Placed Successfully!</h2>
                      <p className="text-gray-600 mb-8">
                        Thank you for your order. We'll send you a confirmation email with your order details.
                      </p>
                      <button
                        onClick={() => navigate('/products')}
                        className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition-colors"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center">
                        <CheckCircle className="mr-2 h-5 w-5 text-green-700" />
                        Order Review
                      </h2>
                      
                      {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                          {error}
                        </div>
                      )}
                      
                      <div className="space-y-6">
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 p-4 border-b">
                            <h3 className="font-medium">Order Items ({totalItems})</h3>
                          </div>
                          
                          <ul className="divide-y divide-gray-200">
                            {cartItems.map((item) => (
                              <li key={item._id} className="p-4 flex items-center">
                                <div className="flex-shrink-0 mr-4">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded-md"
                                  />
                                </div>
                                <div className="flex-grow">
                                  <h4 className="font-medium">{item.name}</h4>
                                  <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                                </div>
                                <div className="ml-4 font-medium">
                                  ₱{convertToPHP(item.price * item.quantity)}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 p-4 border-b">
                              <h3 className="font-medium">Shipping Details</h3>
                            </div>
                            <div className="p-4">
                              <p className="text-gray-600 whitespace-pre-line">{shippingAddress}</p>
                            </div>
                          </div>
                          
                          <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 p-4 border-b">
                              <h3 className="font-medium">Payment Method</h3>
                            </div>
                            <div className="p-4">
                              <p className="text-gray-600">
                                {paymentMethod === 'card' 
                                  ? 'Credit/Debit Card' 
                                  : paymentMethod === 'paypal' 
                                    ? 'PayPal' 
                                    : 'Cash on Delivery'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {!orderPlaced && (
                <div className="p-6 bg-gray-50 border-t">
                  <div className="flex justify-between">
                    {activeStep > 1 && (
                      <button
                        onClick={handleBack}
                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Back
                      </button>
                    )}
                    
                    <div className="ml-auto">
                      {activeStep < 3 ? (
                        <button
                          onClick={handleNext}
                          className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
                        >
                          Next
                        </button>
                      ) : (
                        <button
                          onClick={handlePlaceOrder}
                          disabled={isLoading}
                          className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:bg-gray-400"
                        >
                          {isLoading ? 'Processing...' : 'Place Order'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage; 