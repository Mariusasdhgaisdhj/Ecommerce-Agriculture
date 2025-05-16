import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isVerificationError, setIsVerificationError] = useState(false);
  
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Check if error is related to email verification
    if (error && error.includes('verify your email')) {
      setIsVerificationError(true);
    } else {
      setIsVerificationError(false);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsVerificationError(false);
    
    // Simple validation
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }
    
    if (!password.trim()) {
      setFormError('Password is required');
      return;
    }
    
    try {
      await login(email, password);
      // The redirect will happen in the useEffect above when isAuthenticated changes
    } catch (err) {
      // Error is handled by auth context
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-green-700 p-6 text-white">
            <h2 className="text-2xl font-bold">Welcome Back!</h2>
            <p className="mt-2">Log in to your AgriGrow account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {(formError || error) && (
              <div className={`${isVerificationError ? 'bg-yellow-50 text-yellow-800' : 'bg-red-50 text-red-600'} p-4 rounded-lg text-sm`}>
                <p>{formError || error}</p>
                {isVerificationError && (
                  <div className="mt-2">
                    <Link to={`/resend-verification?email=${encodeURIComponent(email)}`} className="font-medium underline">
                      Click here to resend verification email
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-gray-700 font-medium">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                placeholder="example@email.com"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="password" className="block text-gray-700 font-medium">
                  Password
                </label>
                <Link to="/forgot-password" className="text-green-700 text-sm hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-green-700 text-white font-medium py-3 rounded-lg hover:bg-green-800 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
            
            <div className="text-center text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-green-700 hover:underline">
                Create an account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage; 