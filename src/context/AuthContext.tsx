import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast'; // Assuming you have react-hot-toast installed

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: number;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string, address?: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerificationEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Mock users for demonstration
const mockUsers: Record<string, User & { password: string, verificationToken?: string }> = {
  'test@example.com': {
    _id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 0,
    isVerified: true
  }
};

// Mock verification tokens
const mockVerificationTokens: Record<string, { email: string, expires: Date }> = {};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      // Set default auth header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      let userData: User;
      let authToken: string;
      
      try {
        // First try the real API
        const response = await axios.post('/api/v1/auth/login', {
          email,
          password
        });
        
        userData = response.data.user;
        authToken = response.data.token;
        
        // Check if email is verified
        if (!userData.isVerified) {
          throw new Error('Please verify your email address before logging in. Check your inbox for a verification link.');
        }
      } catch (apiError) {
        console.log('API login failed, using mock login');
        
        // Fallback to mock login
        const mockUser = mockUsers[email];
        if (!mockUser || mockUser.password !== password) {
          throw new Error('Invalid email or password');
        }
        
        // Check if mock user is verified
        if (mockUser.isVerified === false) {
          throw new Error('Please verify your email address before logging in. Check your inbox for a verification link.');
        }
        
        // Create a mock user without the password
        const { password: _, ...userWithoutPassword } = mockUser;
        userData = userWithoutPassword;
        authToken = 'mock-jwt-token-' + Date.now();
        
        // Show a toast notification that we're using mock auth
        toast.success('Logged in with mock account');
      }
      
      if (userData && authToken) {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', authToken);
        
        // Set default auth header for all requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        
        setUser(userData);
        setToken(authToken);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string, address?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      let verificationToken: string;
      
      try {
        // First try the real API
        const response = await axios.post('/api/v1/auth/register', {
          name,
          email,
          password,
          phone,
          address
        });
        
        verificationToken = response.data.verificationToken;
        
        // Show success message without auto login
        toast.success('Registration successful! Please verify your email to continue.');
      } catch (apiError) {
        console.log('API register failed, using mock register');
        
        // Check if email is already used
        if (mockUsers[email]) {
          throw new Error('Email is already registered');
        }
        
        // Create verification token
        verificationToken = 'mock-verification-' + Date.now();
        
        // Create new mock user (unverified)
        const newUser = {
          _id: 'mock-' + Date.now(),
          name,
          email,
          password,
          phone,
          address,
          role: 0,
          isVerified: false,
          verificationToken
        };
        
        // Add to mock users
        mockUsers[email] = newUser;
        
        // Store verification token
        mockVerificationTokens[verificationToken] = {
          email,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
        };
        
        // Send mock verification email (just log it)
        console.log(`[MOCK] Verification link sent to ${email}: /verify-email?token=${verificationToken}`);
        
        // Show a toast notification
        toast.success('Registration successful! Please check your email to verify your account.');
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      try {
        // First try the real API
        await axios.post('/api/v1/auth/verify-email', { token });
        return true;
      } catch (apiError) {
        console.log('API verify email failed, using mock verification');
        
        // Check if token exists and is valid
        const tokenData = mockVerificationTokens[token];
        if (!tokenData) {
          throw new Error('Invalid or expired verification token');
        }
        
        // Check if token is expired
        if (new Date() > tokenData.expires) {
          throw new Error('Verification token has expired');
        }
        
        // Get the user by email
        const user = mockUsers[tokenData.email];
        if (!user) {
          throw new Error('User not found');
        }
        
        // Mark user as verified
        user.isVerified = true;
        
        // Remove used token
        delete mockVerificationTokens[token];
        
        // Show success message
        toast.success('Email verification successful! You can now log in.');
        
        return true;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify email. Please try again.');
      console.error('Email verification error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const resendVerificationEmail = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      try {
        // First try the real API
        await axios.post('/api/v1/auth/resend-verification', { email });
        toast.success('Verification email sent! Please check your inbox.');
      } catch (apiError) {
        console.log('API resend verification failed, using mock resend');
        
        // Check if user exists
        const user = mockUsers[email];
        if (!user) {
          throw new Error('Email not found');
        }
        
        // Check if already verified
        if (user.isVerified) {
          throw new Error('Email is already verified');
        }
        
        // Create new verification token
        const verificationToken = 'mock-verification-' + Date.now();
        user.verificationToken = verificationToken;
        
        // Store verification token
        mockVerificationTokens[verificationToken] = {
          email,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
        };
        
        // Send mock verification email (just log it)
        console.log(`[MOCK] Verification link resent to ${email}: /verify-email?token=${verificationToken}`);
        
        // Show success message
        toast.success('Verification email sent! Please check your inbox.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email. Please try again.');
      console.error('Resend verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully');
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      let updatedUser: User;
      
      try {
        // First try the real API
        const response = await axios.put('/api/v1/auth/profile', userData);
        updatedUser = response.data.user;
      } catch (apiError) {
        console.log('API update profile failed, using mock update');
        
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Update the current user with new data
        updatedUser = { ...user, ...userData };
        
        // If this user is in mockUsers, update that too
        if (mockUsers[user.email]) {
          mockUsers[user.email] = { ...mockUsers[user.email], ...userData };
        }
        
        toast.success('Profile updated with mock data');
      }
      
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.');
      console.error('Profile update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        error,
        login,
        register,
        logout,
        updateUserProfile,
        verifyEmail,
        resendVerificationEmail
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 