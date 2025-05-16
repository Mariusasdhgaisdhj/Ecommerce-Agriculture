import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ChevronDown, ChevronRight, Package, Truck, Shield } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { productAPI } from '../../services/api';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
}

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await productAPI.getAllProducts({ limit: 12 });
        setProducts(response.products);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const convertToPHP = (priceInUSD: number) => {
    const exchangeRate = 58; // Example exchange rate
    return (priceInUSD * exchangeRate).toFixed(2); // Convert and format to 2 decimal places
  };

  // For demo purposes, if API fails, use some sample products
  const sampleProducts: Product[] = [
    {
      _id: "1",
      name: "Organic Rice Seeds",
      category: "Grains",
      price: 4.99,
      image: "https://i.ebayimg.com/images/g/ZhgAAOSwylhbglHM/s-l1200.jpg",
      description: "High-yield organic rice seeds suitable for various climates"
    },
    {
      _id: "2",
      name: "Sweet Corn Seeds",
      category: "Vegetables",
      price: 3.99,
      image: "https://www.marketresearchintellect.com/images/blogs/growing-sweet-profits-the-sweet-corn-seed-market-on-the-rise.webp",
      description: "Non-GMO sweet corn seeds, perfect for home gardens"
    },
    {
      _id: "3",
      name: "Tomato Seeds",
      category: "Vegetables",
      price: 2.49,
      image: "https://m.media-amazon.com/images/I/41KjmvqDpEL._AC_UF1000,1000_QL80_.jpg",
      description: "Heirloom tomato seeds producing juicy, flavorful fruits"
    },
    {
      _id: "4",
      name: "Carrot Seeds",
      category: "Root Vegetables",
      price: 2.99,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNs50KDs-WN0k2gfBaP45gIL_Tn8kNKrF3-w&s",
      description: "Fast-growing carrot seeds, rich in nutrients"
    },
    {
      _id: "5",
      name: "Potato Seedlings",
      category: "Root Vegetables",
      price: 5.99,
      image: "https://spudsmart.com/wp-content/uploads/2016/01/potato-seeds.jpg",
      description: "Pre-sprouted potato seedlings for quick cultivation"
    },
    {
      _id: "6",
      name: "Cabbage Seeds",
      category: "Leafy Greens",
      price: 3.49,
      image: "https://vgrgardens.com/wp-content/uploads/2024/11/cabagge-seeds-500x500_1400x.jpg",
      description: "High-yielding cabbage seeds resistant to common diseases"
    }
  ];

  const displayedProducts = isLoading || error 
    ? sampleProducts 
    : (showAllProducts ? products : products.slice(0, 6));

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  };

  const handleBuyNow = (product: Product) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    navigate('/checkout');
  };

  return (
    <Layout isAuthenticated={isAuthenticated}>
      {/* Hero Section */}
      <div className="relative bg-green-700 text-white">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Grow Your Own Food at Home
            </h1>
            <p className="text-xl mb-8">
              Premium quality food crop seeds for sustainable gardening. Start your journey to self-sufficiency and healthy eating with our selection of nutritious crop varieties.
            </p>
            <div className="flex space-x-4">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="bg-white text-green-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
                    Register Now <ChevronRight className="w-5 h-5" />
                  </Link>
                  <Link to="/login" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-green-700 transition-colors">
                    Login Now
                  </Link>
                </>
              ) : (
                <Link to="/products" className="bg-white text-green-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
                  Browse Products <ChevronRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4 p-8 bg-white rounded-lg shadow-lg transform hover:-translate-y-1 transition-transform">
            <Package className="h-12 w-12 text-green-600" />
            <div>
              <h3 className="text-xl font-semibold">Premium Seeds</h3>
              <p className="text-gray-600">High-yield, non-GMO varieties</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-8 bg-white rounded-lg shadow-lg transform hover:-translate-y-1 transition-transform">
            <Truck className="h-12 w-12 text-green-600" />
            <div>
              <h3 className="text-xl font-semibold">Fast Delivery</h3>
              <p className="text-gray-600">Right to your doorstep</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-8 bg-white rounded-lg shadow-lg transform hover:-translate-y-1 transition-transform">
            <Shield className="h-12 w-12 text-green-600" />
            <div>
              <h3 className="text-xl font-semibold">Growing Support</h3>
              <p className="text-gray-600">Planting guides & advice</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Food Crop Seeds</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our collection of premium food crop seeds to grow your own nutritious vegetables, grains, and herbs. Start your home garden journey with quality seeds for bountiful harvests.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                  />
                  <button className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors">
                    <Heart className="h-6 w-6" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <span className="text-sm text-green-600 font-semibold">{product.category}</span>
                    <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                    <p className="text-gray-600">{product.description}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-700">
                      ₱{convertToPHP(product.price)}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleBuyNow(product)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {products.length > 6 && (
            <div className="text-center mt-12">
              <button
                onClick={() => setShowAllProducts(!showAllProducts)}
                className="bg-green-700 text-white px-8 py-3 rounded-lg hover:bg-green-800 transition-colors flex items-center mx-auto"
              >
                {showAllProducts ? 'Show Less' : 'See More'}
                <ChevronDown className={`w-5 h-5 ml-2 transform transition-transform ${showAllProducts ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HomePage; 