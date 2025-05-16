import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

interface Product {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isLoading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, token } = useAuth();

  // Calculate derived state
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Initialize cart from localStorage or fetch from API if authenticated
  useEffect(() => {
    const fetchCart = async () => {
      if (isAuthenticated && token) {
        try {
          setIsLoading(true);
          const response = await axios.get('/api/v1/cart', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data?.cart?.items) {
            setCartItems(response.data.cart.items);
          }
        } catch (err: any) {
          console.error('Error fetching cart:', err);
          // If API fails, use local storage even for authenticated users
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            setCartItems(JSON.parse(savedCart));
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        // Use local storage for non-authenticated users
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      }
    };

    fetchCart();
  }, [isAuthenticated, token]);

  // Save cart to localStorage whenever it changes (for all users as backup)
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const syncWithServer = async (updatedItems: CartItem[]) => {
    if (isAuthenticated && token) {
      try {
        await axios.put('/api/v1/cart', { items: updatedItems }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Error syncing cart with server:', err);
        // Continue with local storage functionality
      }
    }
  };

  const addToCart = async (product: Product) => {
    setError(null);
    
    // Check if product already exists in cart
    const existingItem = cartItems.find(item => item._id === product._id);
    
    let updatedCart: CartItem[];
    
    if (existingItem) {
      // Increase quantity if product already in cart
      updatedCart = cartItems.map(item => 
        item._id === product._id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      );
      toast.success(`${product.name} quantity updated in cart`);
    } else {
      // Add new product to cart
      updatedCart = [...cartItems, { ...product, quantity: 1 }];
      toast.success(`${product.name} added to cart`);
    }
    
    setCartItems(updatedCart);
    
    // Sync with server if authenticated
    if (isAuthenticated) {
      await syncWithServer(updatedCart);
    }
  };

  const removeFromCart = async (productId: string) => {
    setError(null);
    
    // Find the item to be removed (for toast message)
    const itemToRemove = cartItems.find(item => item._id === productId);
    
    const updatedCart = cartItems.filter(item => item._id !== productId);
    setCartItems(updatedCart);
    
    if (itemToRemove) {
      toast.success(`${itemToRemove.name} removed from cart`);
    }
    
    // Sync with server if authenticated
    if (isAuthenticated) {
      await syncWithServer(updatedCart);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    setError(null);
    
    if (quantity < 1) {
      return removeFromCart(productId);
    }
    
    const updatedCart = cartItems.map(item => 
      item._id === productId ? { ...item, quantity } : item
    );
    
    setCartItems(updatedCart);
    
    // Find the updated item (for toast message)
    const updatedItem = updatedCart.find(item => item._id === productId);
    if (updatedItem) {
      toast.success(`${updatedItem.name} quantity updated to ${quantity}`);
    }
    
    // Sync with server if authenticated
    if (isAuthenticated) {
      await syncWithServer(updatedCart);
    }
  };

  const clearCart = async () => {
    setError(null);
    setCartItems([]);
    toast.success('Cart cleared');
    
    // Sync with server if authenticated
    if (isAuthenticated) {
      await syncWithServer([]);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isLoading,
        error
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext; 