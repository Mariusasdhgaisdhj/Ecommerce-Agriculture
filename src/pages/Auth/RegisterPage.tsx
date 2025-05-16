import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, CheckCircle } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [registrationComplete, setRegistrationComplete] = useState(false);
  
  const { register, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    // Simple validation
    if (!name.trim()) {
      setFormError('Name is required');
      return;
    }
    
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }
    
    if (!password.trim()) {
      setFormError('Password is required');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    
    try {
      await register(name, email, password, phone, address);
      setRegistrationComplete(true);
    } catch (err) {
      // Error is handled by auth context
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-green-700 p-6 text-white">
            <h2 className="text-2xl font-bold">Create An Account</h2>
            <p className="mt-2">Join AgriGrow and start your gardening journey</p>
          </div>
          
          {registrationComplete ? (
            <div className="p-6 text-center">
              <div className="flex justify-center mb-6">
                <Mail className="h-16 w-16 text-green-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Check Your Email</h3>
              <p className="text-gray-600 mb-6">
                We've sent a verification email to <span className="font-medium">{email}</span>. 
                Please check your inbox and click on the verification link to complete your registration.
              </p>
              <div className="bg-green-50 p-4 rounded-lg mb-6 text-left">
                <h4 className="font-medium flex items-center text-green-800 mb-2">
                  <CheckCircle className="h-5 w-5 mr-2" /> 
                  Next Steps
                </h4>
                <ol className="list-decimal list-inside text-sm text-green-800 space-y-1">
                  <li>Check your email inbox</li>
                  <li>Open the email from AgriGrow</li>
                  <li>Click on the verification link</li>
                  <li>Once verified, you can log in to your account</li>
                </ol>
              </div>
              <div className="space-y-2">
                <p className="text-gray-500 text-sm">
                  Didn't receive an email?
                </p>
                <Link to="/resend-verification" className="text-green-700 hover:underline text-sm">
                  Resend Verification Email
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {(formError || error) && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {formError || error}
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="name" className="block text-gray-700 font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>
              
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
                <label htmlFor="phone" className="block text-gray-700 font-medium">
                  Phone Number (Optional)
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
              
              <div className="space-y-2">
                <label htmlFor="address" className="block text-gray-700 font-medium">
                  Address (Optional)
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                  placeholder="Your address"
                  rows={3}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="block text-gray-700 font-medium">
                  Password
                </label>
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
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-gray-700 font-medium">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-green-700 text-white font-medium py-3 rounded-lg hover:bg-green-800 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
              
              <div className="text-center text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-green-700 hover:underline">
                  Log In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage; 