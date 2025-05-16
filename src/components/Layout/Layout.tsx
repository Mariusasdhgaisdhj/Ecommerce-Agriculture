import { ReactNode, useState } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  cartItemsCount?: number;
  isAuthenticated?: boolean;
}

const Layout = ({
  children,
  cartItemsCount = 0,
  isAuthenticated = false,
}: LayoutProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        cartItemsCount={cartItemsCount}
        isAuthenticated={isAuthenticated}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout; 