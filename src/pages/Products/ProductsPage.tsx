import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Filter, X, ChevronDown } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { productAPI, categoryAPI } from '../../services/api';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
}

interface Category {
  _id: string;
  name: string;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });
  
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Sample categories if API fails
  const sampleCategories = [
    { _id: '1', name: 'Grains' },
    { _id: '2', name: 'Vegetables' },
    { _id: '3', name: 'Root Vegetables' },
    { _id: '4', name: 'Leafy Greens' },
    { _id: '5', name: 'Vine Crops' }
  ];

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAllCategories();
        setCategories(response.categories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Use sample categories if API fails
        setCategories(sampleCategories);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products based on search parameters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        let response;
        
        if (searchQuery) {
          response = await productAPI.searchProducts(searchQuery);
        } else if (categoryParam) {
          response = await productAPI.getProductsByCategory(categoryParam);
        } else {
          response = await productAPI.getAllProducts();
        }
        
        setProducts(response.products);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        // Set sample products if API fails
        setProducts(sampleProducts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryParam, searchQuery]);

  const convertToPHP = (priceInUSD: number) => {
    const exchangeRate = 58; // Example exchange rate
    return (priceInUSD * exchangeRate).toFixed(2);
  };

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

  const handleCategoryFilter = (categoryName: string) => {
    if (categoryParam === categoryName) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categoryName);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  // Filter products by price range
  const filteredProducts = products.filter(product => 
    product.price >= priceRange.min / 58 && product.price <= priceRange.max / 58
  );

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

  return (
    <Layout isAuthenticated={isAuthenticated}>
      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {categoryParam 
              ? `${categoryParam} Seeds` 
              : searchQuery 
                ? `Search Results for "${searchQuery}"` 
                : 'All Seeds'}
          </h1>
          
          {(categoryParam || searchQuery) && (
            <button 
              onClick={clearFilters}
              className="mt-2 flex items-center text-green-700 hover:text-green-900"
            >
              <X className="w-4 h-4 mr-1" />
              Clear filters
            </button>
          )}
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center text-green-700"
                >
                  <Filter className="w-5 h-5 mr-1" />
                  {showFilters ? 'Hide' : 'Show'}
                </button>
              </div>
              
              <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
                {/* Categories Filter */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Categories</h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <div key={category._id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`category-${category._id}`}
                          checked={categoryParam === category.name}
                          onChange={() => handleCategoryFilter(category.name)}
                          className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <label htmlFor={`category-${category._id}`} className="ml-2 text-gray-700">
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Price Range Filter */}
                <div>
                  <h3 className="font-medium mb-3">Price Range (in ₱)</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <span>to</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="lg:w-3/4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <div className="text-7xl mb-4">😕</div>
                <h3 className="text-2xl font-bold mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any products matching your criteria.
                </p>
                <button 
                  onClick={clearFilters}
                  className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform">
                    <Link to={`/products/${product._id}`}>
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
                    </Link>
                    <div className="p-6">
                      <Link to={`/products/${product._id}`}>
                        <div className="mb-4">
                          <span className="text-sm text-green-600 font-semibold">{product.category}</span>
                          <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                          <p className="text-gray-600 line-clamp-2">{product.description}</p>
                        </div>
                      </Link>
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
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage; 