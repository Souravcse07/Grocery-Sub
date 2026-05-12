import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const newItem = action.payload;
      const id = newItem._id || newItem.id;
      const existingItem = state.items.find(item => item.id === id);
      
      state.totalQuantity++;
      const rawPrice = newItem.price !== undefined ? newItem.price : newItem.pricePerUnit;
      // Parse price to ensure it's a number
      const price = typeof rawPrice === 'string' ? parseFloat(rawPrice.replace(/[^0-9.]/g, '')) : (rawPrice || 0);
      state.totalPrice += price;
      
      if (!existingItem) {
        state.items.push({
          id: id,
          name: newItem.name,
          price: price,
          quantity: 1,
          totalPrice: price,
          image: newItem.image
        });
      } else {
        existingItem.quantity++;
        existingItem.totalPrice += price;
      }
    },
    removeFromCart(state, action) {
      const id = action.payload;
      const existingItem = state.items.find(item => item.id === id);
      
      if (existingItem) {
        state.totalQuantity--;
        state.totalPrice -= existingItem.price;
        
        if (existingItem.quantity === 1) {
          state.items = state.items.filter(item => item.id !== id);
        } else {
          existingItem.quantity--;
          existingItem.totalPrice -= existingItem.price;
        }
      }
    },
    updateQuantity(state, action) {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find(item => item.id === id);
      if (existingItem && quantity > 0) {
        const qtyDiff = quantity - existingItem.quantity;
        existingItem.quantity = quantity;
        existingItem.totalPrice = existingItem.price * quantity;
        state.totalQuantity += qtyDiff;
        state.totalPrice += qtyDiff * existingItem.price;
      }
    },
    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
    }
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
