import axios from 'axios';

// Set base URL for API requests - use relative path in production for same-domain API
const isProduction = import.meta.env.PROD;
axios.defaults.baseURL = isProduction ? '/api' : import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Set default headers
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Add token to requests if available
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Products API
export const productAPI = {
  getAllProducts: async (params?: { 
    search?: string, 
    category?: string, 
    page?: number, 
    limit?: number 
  }) => {
    try {
      const response = await axios.get('/api/v1/product/all-products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  getProductById: async (id: string) => {
    try {
      const response = await axios.get(`/api/v1/product/get-product/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      throw error;
    }
  },

  getProductsByCategory: async (category: string) => {
    try {
      const response = await axios.get(`/api/v1/product/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching products in category ${category}:`, error);
      throw error;
    }
  },

  searchProducts: async (keyword: string) => {
    try {
      const response = await axios.get(`/api/v1/product/search/${keyword}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching products with keyword ${keyword}:`, error);
      throw error;
    }
  },
  
  createProduct: async (productData: FormData) => {
    try {
      const response = await axios.post('/api/v1/product/create-product', productData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },
  
  getUserProducts: async () => {
    try {
      const response = await axios.get('/api/v1/product/user-products');
      return response.data;
    } catch (error) {
      console.error('Error fetching user products:', error);
      throw error;
    }
  }
};

// Categories API
export const categoryAPI = {
  getAllCategories: async () => {
    try {
      const response = await axios.get('/api/v1/category/all-categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
};

// Order API
export const orderAPI = {
  createOrder: async (orderData: {
    cartItems: { product: string, quantity: number, price: number }[],
    paymentMethod: string,
    shippingAddress: string,
    nonce?: string
  }) => {
    try {
      const response = await axios.post('/api/v1/order/create', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  getOrdersByUser: async () => {
    try {
      const response = await axios.get('/api/v1/order/orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  getOrderById: async (id: string) => {
    try {
      const response = await axios.get(`/api/v1/order/order/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order with ID ${id}:`, error);
      throw error;
    }
  }
};

// Forum API
export const forumAPI = {
  getAllPosts: async () => {
    try {
      const response = await axios.get('/api/v1/forum/posts');
      return response.data;
    } catch (error) {
      console.error('Error fetching forum posts:', error);
      throw error;
    }
  },

  getPostById: async (id: string) => {
    try {
      const response = await axios.get(`/api/v1/forum/post/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching post with ID ${id}:`, error);
      throw error;
    }
  },

  createPost: async (postData: { title: string, content: string, category?: string }) => {
    try {
      const response = await axios.post('/api/v1/forum/create-post', postData);
      return response.data;
    } catch (error) {
      console.error('Error creating forum post:', error);
      throw error;
    }
  },

  addComment: async (postId: string, commentData: { content: string }) => {
    try {
      const response = await axios.post(`/api/v1/forum/post/${postId}/comment`, commentData);
      return response.data;
    } catch (error) {
      console.error('Error adding comment to post:', error);
      throw error;
    }
  }
};

// Export a default API object with all services
const api = {
  product: productAPI,
  category: categoryAPI,
  order: orderAPI,
  forum: forumAPI
};

export default api; 