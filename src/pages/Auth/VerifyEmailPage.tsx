import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';

const VerifyEmailPage = () => {
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyUserEmail = async () => {
      // Get the token from the URL
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');
      
      if (!token) {
        setVerificationStatus('error');
        setErrorMessage('Verification token is missing.');
        return;
      }
      
      try {
        const success = await verifyEmail(token);
        if (success) {
          setVerificationStatus('success');
        } else {
          setVerificationStatus('error');
          setErrorMessage('Could not verify your email. The token may be invalid or expired.');
        }
      } catch (err: any) {
        setVerificationStatus('error');
        setErrorMessage(err.message || 'An error occurred during verification.');
      }
    };
    
    verifyUserEmail();
  }, [verifyEmail, location.search]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-green-700 p-6 text-white">
            <h2 className="text-2xl font-bold">Email Verification</h2>
          </div>
          
          <div className="p-6 text-center">
            {verificationStatus === 'verifying' && (
              <>
                <div className="flex justify-center mb-6">
                  <Loader className="h-16 w-16 animate-spin text-green-700" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verifying Your Email</h3>
                <p className="text-gray-600">
                  Please wait while we verify your email address...
                </p>
              </>
            )}
            
            {verificationStatus === 'success' && (
              <>
                <div className="flex justify-center mb-6">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Email Verified Successfully!</h3>
                <p className="text-gray-600 mb-6">
                  Your email has been verified. You can now log in to your account.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition-colors"
                >
                  Log In Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </>
            )}
            
            {verificationStatus === 'error' && (
              <>
                <div className="flex justify-center mb-6">
                  <XCircle className="h-16 w-16 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verification Failed</h3>
                <p className="text-gray-600 mb-2">
                  {errorMessage || 'An error occurred during the verification process.'}
                </p>
                <div className="flex flex-col items-center mt-6 space-y-4">
                  <Link
                    to="/resend-verification"
                    className="text-green-700 hover:underline"
                  >
                    Resend Verification Email
                  </Link>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:underline"
                  >
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyEmailPage; 