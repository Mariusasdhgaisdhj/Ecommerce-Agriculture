import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Send } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';

const ResendVerificationPage = () => {
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { resendVerificationEmail, isLoading, error } = useAuth();
  const location = useLocation();
  
  // Get email from URL params if available
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const emailParam = searchParams.get('email');
    
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccess(false);
    
    // Simple validation
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }
    
    try {
      await resendVerificationEmail(email);
      setSuccess(true);
    } catch (err) {
      // Error is handled by auth context
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-green-700 p-6 text-white">
            <h2 className="text-2xl font-bold">Resend Verification Email</h2>
            <p className="mt-2">Enter your email to receive a new verification link</p>
          </div>
          
          <div className="p-6">
            {success ? (
              <div className="text-center py-4">
                <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
                  Verification email sent successfully! Please check your inbox and follow the link to verify your account.
                </div>
                <Link to="/login" className="text-green-700 hover:underline">
                  Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {(formError || error) && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {formError || error}
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
                
                <button
                  type="submit"
                  className="w-full bg-green-700 text-white font-medium py-3 rounded-lg hover:bg-green-800 transition-colors flex items-center justify-center"
                  disabled={isLoading}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isLoading ? 'Sending...' : 'Send Verification Email'}
                </button>
                
                <div className="text-center text-gray-600">
                  <Link to="/login" className="text-green-700 hover:underline">
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResendVerificationPage; 