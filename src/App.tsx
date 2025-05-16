import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages
import HomePage from './pages/Home/HomePage';
import ProductsPage from './pages/Products/ProductsPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import VerifyEmailPage from './pages/Auth/VerifyEmailPage';
import ResendVerificationPage from './pages/Auth/ResendVerificationPage';
import CartPage from './pages/Cart/CartPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import ForumPage from './pages/Forum/ForumPage';
import ProfilePage from './pages/Profile/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/resend-verification" element={<ResendVerificationPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;