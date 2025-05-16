import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Package, 
  ShoppingBag, 
  LogOut, 
  Save,
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Edit,
  ChevronRight,
  Plus,
  Tag,
  Image as ImageIcon,
  DollarSign,
  Store,
  Loader2
} from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { orderAPI, productAPI, categoryAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

interface Order {
  _id: string;
  products: { 
    product: { 
      _id: string; 
      name: string; 
      price: number; 
      image: string 
    }; 
    quantity: number 
  }[];
  payment: { 
    method: string; 
    transaction_id?: string; 
    status: string 
  };
  shippingAddress: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  quantity: number;
  image: string;
  createdAt: string;
}

const ProfilePage = () => {
  const { user, isAuthenticated, isLoading: authLoading, updateUserProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Order history
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  // Sell product states
  const [showSellForm, setShowSellForm] = useState(false);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productCategory, setProductCategory] = useState('');
  const [categories, setCategories] = useState<{_id: string, name: string}[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productError, setProductError] = useState('');
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Mock orders for demo
  const mockOrders: Order[] = [
    {
      _id: 'mock-order-1',
      products: [
        {
          product: {
            _id: '1',
            name: 'Organic Rice Seeds',
            price: 4.99,
            image: 'https://i.ebayimg.com/images/g/ZhgAAOSwylhbglHM/s-l1200.jpg'
          },
          quantity: 2
        },
        {
          product: {
            _id: '3',
            name: 'Tomato Seeds',
            price: 2.49,
            image: 'https://m.media-amazon.com/images/I/41KjmvqDpEL._AC_UF1000,1000_QL80_.jpg'
          },
          quantity: 1
        }
      ],
      payment: {
        method: 'card',
        transaction_id: 'mock-transaction-1',
        status: 'completed'
      },
      shippingAddress: '123 Garden Street, Plantville',
      status: 'Delivered',
      totalAmount: 12.47,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
    },
    {
      _id: 'mock-order-2',
      products: [
        {
          product: {
            _id: '2',
            name: 'Sweet Corn Seeds',
            price: 3.99,
            image: 'https://www.marketresearchintellect.com/images/blogs/growing-sweet-profits-the-sweet-corn-seed-market-on-the-rise.webp'
          },
          quantity: 3
        }
      ],
      payment: {
        method: 'paypal',
        transaction_id: 'mock-transaction-2',
        status: 'completed'
      },
      shippingAddress: '123 Garden Street, Plantville',
      status: 'Processed',
      totalAmount: 11.97,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
    }
  ];
  
  // Mock categories for fallback
  const mockCategories = [
    { _id: 'cat-1', name: 'Grains' },
    { _id: 'cat-2', name: 'Vegetables' },
    { _id: 'cat-3', name: 'Root Vegetables' },
    { _id: 'cat-4', name: 'Leafy Green' },
    { _id: 'cat-5', name: 'Vine Crops' },
    
  ];

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/login');
    }

    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;

      setOrdersLoading(true);
      try {
        const response = await orderAPI.getOrdersByUser();
        setOrders(response.orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        // Use mock orders as fallback
        setOrders(mockOrders);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAllCategories();
        if (response.categories && response.categories.length > 0) {
          setCategories(response.categories);
        } else {
          // Use mock categories if API returns empty array
          setCategories(mockCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Use mock categories as fallback
        setCategories(mockCategories);
      }
    };
    
    const fetchUserProducts = async () => {
      if (!isAuthenticated) return;
      
      setProductsLoading(true);
      try {
        const response = await productAPI.getUserProducts();
        setUserProducts(response.products);
      } catch (error) {
        console.error('Error fetching user products:', error);
        setUserProducts([]); // Empty array as fallback
      } finally {
        setProductsLoading(false);
      }
    };
    
    fetchCategories();
    fetchUserProducts();
  }, [isAuthenticated]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!name.trim()) {
      setFormError('Name is required');
      return;
    }
    
    setIsLoading(true);
    try {
      await updateUserProfile({
        name,
        phone,
        address
      });
      
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      setFormError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const convertToPHP = (price: number) => {
    const exchangeRate = 58; // Example exchange rate
    return (price * exchangeRate).toFixed(2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSellProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductError('');
    
    // Validate form
    if (!productName.trim() || !productDescription.trim() || !productPrice || !productQuantity || !productCategory) {
      setProductError('All fields are required');
      return;
    }
    
    if (!productImage) {
      setProductError('Product image is required');
      return;
    }
    
    const price = parseFloat(productPrice);
    const quantity = parseInt(productQuantity, 10);
    
    if (isNaN(price) || price <= 0) {
      setProductError('Please enter a valid price');
      return;
    }
    
    if (isNaN(quantity) || quantity <= 0) {
      setProductError('Please enter a valid quantity');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('name', productName);
      formData.append('description', productDescription);
      formData.append('price', productPrice);
      formData.append('quantity', productQuantity);
      formData.append('category', productCategory);
      formData.append('productImage', productImage);
      
      await productAPI.createProduct(formData);
      
      toast.success('Product listed successfully!');
      
      // Reset form
      setProductName('');
      setProductDescription('');
      setProductPrice('');
      setProductQuantity('');
      setProductCategory('');
      setProductImage(null);
      setImagePreview(null);
      setShowSellForm(false);
      
      // Refresh user products
      const response = await productAPI.getUserProducts();
      setUserProducts(response.products);
    } catch (err: any) {
      setProductError(err.response?.data?.message || 'Failed to list product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <Layout isAuthenticated={isAuthenticated}>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated={isAuthenticated}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>
          
          {/* Profile section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-16 w-16 bg-green-700 rounded-full flex items-center justify-center text-white">
                    <User size={32} />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold">{user?.name}</h2>
                    <p className="text-gray-600">{user?.email}</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center text-red-600 hover:text-red-800 transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {isEditing ? (
                <form onSubmit={handleUpdateProfile}>
                  {formError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
                      {formError}
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                        placeholder="Your name"
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        disabled
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50"
                        placeholder="Your email"
                      />
                      <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                        placeholder="+63 917 123 4567"
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
                        Shipping Address
                      </label>
                      <textarea
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                        placeholder="Your shipping address"
                        rows={3}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-8 flex space-x-4">
                    <button
                      type="submit"
                      className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition-colors flex items-center"
                      disabled={isLoading}
                    >
                      <Save className="mr-2 h-5 w-5" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form
                        if (user) {
                          setName(user.name || '');
                          setPhone(user.phone || '');
                          setAddress(user.address || '');
                        }
                      }}
                      className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-gray-500 text-sm mb-1">Full Name</h3>
                      <p className="font-medium flex items-center">
                        <User className="h-5 w-5 text-green-600 mr-2" />
                        {user?.name || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm mb-1">Email Address</h3>
                      <p className="font-medium flex items-center">
                        <Mail className="h-5 w-5 text-green-600 mr-2" />
                        {user?.email}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm mb-1">Phone Number</h3>
                      <p className="font-medium flex items-center">
                        <Phone className="h-5 w-5 text-green-600 mr-2" />
                        {user?.phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm mb-1">Shipping Address</h3>
                      <p className="font-medium flex items-start">
                        <MapPin className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                        <span className="flex-1">{user?.address || 'Not provided'}</span>
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-8 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <Edit className="mr-2 h-5 w-5" />
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Sell Products Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Store className="h-6 w-6 text-green-700 mr-2" />
                  <h2 className="text-xl font-semibold">My Products</h2>
                </div>
                
                <button 
                  onClick={() => setShowSellForm(!showSellForm)}
                  className={`flex items-center text-sm font-medium px-4 py-2 rounded-lg ${
                    showSellForm 
                      ? 'bg-gray-200 text-gray-700' 
                      : 'bg-green-700 text-white hover:bg-green-800'
                  } transition-colors`}
                >
                  {showSellForm ? (
                    'Cancel'
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Sell Product
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {showSellForm && (
                <div className="mb-8 border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">List a New Product</h3>
                  
                  {productError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
                      {productError}
                    </div>
                  )}
                  
                  <form onSubmit={handleSellProduct} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="productName" className="block text-gray-700 font-medium mb-2">
                          Product Name*
                        </label>
                        <input
                          type="text"
                          id="productName"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                          placeholder="e.g. Organic Tomato Seeds"
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="productCategory" className="block text-gray-700 font-medium mb-2">
                          Category*
                        </label>
                        <select
                          id="productCategory"
                          value={productCategory}
                          onChange={(e) => setProductCategory(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                          disabled={isSubmitting}
                        >
                          <option value="">Select Category</option>
                          {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="productDescription" className="block text-gray-700 font-medium mb-2">
                        Description*
                      </label>
                      <textarea
                        id="productDescription"
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                        placeholder="Describe your product..."
                        rows={4}
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="productPrice" className="block text-gray-700 font-medium mb-2">
                          Price (PHP)*
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">₱</span>
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            id="productPrice"
                            value={productPrice}
                            onChange={(e) => setProductPrice(e.target.value)}
                            className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                            placeholder="0.00"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="productQuantity" className="block text-gray-700 font-medium mb-2">
                          Available Quantity*
                        </label>
                        <input
                          type="number"
                          min="1"
                          id="productQuantity"
                          value={productQuantity}
                          onChange={(e) => setProductQuantity(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                          placeholder="e.g. 50"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="productImage" className="block text-gray-700 font-medium mb-2">
                        Product Image*
                      </label>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label 
                            htmlFor="productImage" 
                            className="block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <span className="text-gray-600">Click to upload image</span>
                            <input
                              type="file"
                              id="productImage"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageChange}
                              disabled={isSubmitting}
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG or JPEG up to 5MB
                          </p>
                        </div>
                        
                        {imagePreview && (
                          <div className="border rounded-lg overflow-hidden">
                            <img 
                              src={imagePreview} 
                              alt="Product preview" 
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSellForm(false);
                          // Reset form
                          setProductName('');
                          setProductDescription('');
                          setProductPrice('');
                          setProductQuantity('');
                          setProductCategory('');
                          setProductImage(null);
                          setImagePreview(null);
                        }}
                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition-colors flex items-center"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                            Listing...
                          </>
                        ) : (
                          <>
                            <Tag className="h-5 w-5 mr-2" />
                            List Product
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {productsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-700 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading your products...</p>
                </div>
              ) : userProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Products Listed</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't listed any products for sale yet.
                  </p>
                  <button
                    onClick={() => setShowSellForm(true)}
                    className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition-colors flex items-center mx-auto"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Sell Product
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProducts.map((product) => (
                    <div key={product._id} className="border rounded-lg overflow-hidden">
                      <div className="h-48">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold">{product.name}</h3>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-green-700 font-bold">₱{convertToPHP(product.price)}</p>
                          <p className="text-sm text-gray-600">In Stock: {product.quantity}</p>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            Listed on {formatDate(product.createdAt)}
                          </span>
                          <button
                            onClick={() => { /* Edit product */ }}
                            className="text-sm text-green-700 hover:text-green-800"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Order History */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center">
                <Package className="h-6 w-6 text-green-700 mr-2" />
                <h2 className="text-xl font-semibold">Order History</h2>
              </div>
            </div>
            
            <div className="p-6">
              {ordersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-700 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Orders Yet</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't placed any orders yet.
                  </p>
                  <button
                    onClick={() => navigate('/products')}
                    className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition-colors"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order._id} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4 flex flex-wrap items-center justify-between gap-4 border-b">
                        <div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-green-700 mr-2" />
                            <span className="text-sm text-gray-600">
                              {formatDate(order.createdAt)}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center">
                            <span className="font-medium">Order #{order._id.substring(0, 8)}</span>
                            <span className={`ml-3 px-2 py-0.5 text-xs rounded-full ${
                              order.status === 'Delivered' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Total Amount</div>
                          <div className="text-lg font-bold text-green-700">
                            ₱{convertToPHP(order.totalAmount)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Products</h4>
                          <div className="space-y-3">
                            {order.products.map((item) => (
                              <div key={item.product._id} className="flex items-center">
                                <img 
                                  src={item.product.image} 
                                  alt={item.product.name}
                                  className="h-12 w-12 object-cover rounded-md mr-3" 
                                />
                                <div className="flex-1">
                                  <h5 className="font-medium">{item.product.name}</h5>
                                  <p className="text-sm text-gray-600">
                                    Quantity: {item.quantity} × ₱{convertToPHP(item.product.price)}
                                  </p>
                                </div>
                                <div className="font-medium">
                                  ₱{convertToPHP(item.product.price * item.quantity)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium mb-1">Shipping Address</h4>
                            <p className="text-gray-600">{order.shippingAddress}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Payment Method</h4>
                            <div className="flex items-center">
                              <CreditCard className="h-4 w-4 text-green-700 mr-2" />
                              <span className="capitalize">{order.payment.method}</span>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {/* View order details */}}
                          className="mt-4 text-green-700 hover:text-green-800 transition-colors flex items-center"
                        >
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage; 