import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../../store/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: 'https://grocery-sub.onrender.com/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
      window.location.href = '/login';
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Product'],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.category && filters.category !== 'All') params.append('category', filters.category);
        if (filters.season) params.append('season', filters.season);
        if (filters.inStock) params.append('inStock', 'true');
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);
        if (filters.q) params.append('q', filters.q);
        
        return `/products?${params.toString()}`;
      },
      providesTags: (result) =>
        result && result.products
          ? [
              ...result.products.map(({ _id }) => ({ type: 'Product', id: _id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
    }),
    verifyPayment: builder.mutation({
      query: (paymentData) => ({
        url: '/orders/verify-payment',
        method: 'POST',
        body: paymentData,
      }),
    }),
    getProfile: builder.query({
      query: () => '/auth/me',
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/auth/me',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const { 
  useGetProductsQuery, 
  useGetProductByIdQuery, 
  useCreateOrderMutation,
  useVerifyPaymentMutation,
  useGetProfileQuery,
  useUpdateProfileMutation
} = apiSlice;
