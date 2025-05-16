import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, User } from 'lucide-react';

interface HeaderProps {
  cartItemsCount: number;
  isAuthenticated: boolean;
  setSearchQuery: (query: string) => void;
  searchQuery: string;
}

const Header = ({ cartItemsCount, isAuthenticated, setSearchQuery, searchQuery }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/products?search=${searchQuery}`);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/">
              <h1 className="text-3xl font-bold text-green-700">AgriGrow</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-green-700">Home</Link>
            <Link to="/products" className="text-gray-700 hover:text-green-700">Products</Link>
            <Link to="/forum" className="text-gray-700 hover:text-green-700">Forum</Link>
            
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </form>
            
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-600" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            
            {isAuthenticated ? (
              <Link to="/profile" className="text-gray-700 hover:text-green-700">
                <User className="h-6 w-6" />
              </Link>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-green-700">Login</Link>
                <Link to="/register" className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-green-700">Home</Link>
              <Link to="/products" className="text-gray-700 hover:text-green-700">Products</Link>
              <Link to="/forum" className="text-gray-700 hover:text-green-700">Forum</Link>
              
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </form>
              
              {isAuthenticated ? (
                <Link to="/profile" className="text-gray-700 hover:text-green-700">My Profile</Link>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link to="/login" className="text-gray-700 hover:text-green-700">Login</Link>
                  <Link to="/register" className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors text-center">Register</Link>
                </div>
              )}
              
              <Link to="/cart" className="text-gray-700 hover:text-green-700 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                <span>Cart</span>
                {cartItemsCount > 0 && (
                  <span className="ml-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header; 