import { createSlice } from '@reduxjs/toolkit';
import * as _ from 'lodash';
import { signout, updateAddress } from '../actions/index';

// const cartObj = {
//   items: [
//     {
//       id: 1,
//       product: {},
//       quantity: 1,
//     },
//   ],
//   totalValue: 232,
//   shippingType: 'Standard', //Standard|Express
//   shippingValue: 10,
//   shippingAddress: {
//     fullName: 'John Doe',
//     streetLine1: 'abc street',
//     streetLine2: 'block xyz',
//     city: 'New York',
//     state: 'NY',
//     country: 'United States',
//     countryCode: 'US',
//     zip: '10001',
//   },
//   orderId: "",
//   checkoutSessionId: null, //null|string
// };

const initialState = {
  items: [],
  totalValue: 0,
  shippingType: 'Standard',
  shippingValue: parseInt(process.env.REACT_APP_STANDARD_SHIPPING_COST),
  shippingAddress: {
    fullName: '',
    streetLine1: '',
    streetLine2: '',
    city: '',
    state: '',
    country: '',
    countryCode: '',
    zip: '',
  },
  orderId: '',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItemToCart: {
      reducer(state, action) {
        state.items.push(action.payload);
        state.totalValue = state.items.reduce((sum, item) => {
          return sum + item.product.price * item.quantity;
        }, 0);
      },
      prepare(product, quantity) {
        return {
          payload: {
            id: product.id,
            product,
            quantity,
          },
        };
      },
    },
    initialiseCartFromDB(state, action) {
      state.items.push(...action.payload);
      state.items = Object.values(Array.from(_(state.items).groupBy('id'))).map((x) => ({
        id: x[0].id,
        product: x[0].product,
        quantity: x.length,
      }));
      state.totalValue = state.items.reduce((sum, item) => {
        return sum + item.product.price * item.quantity;
      }, 0);
    },
    updateQuantityInCart: {
      reducer(state, action) {
        const index = state.items.findIndex((s) => s.id === action.payload.id);
        state.items[index] = action.payload;
        state.totalValue = state.items.reduce((sum, item) => {
          return sum + item.product.price * item.quantity;
        }, 0);
      },
      prepare(product, quantity) {
        return {
          payload: {
            id: product.id,
            product,
            quantity,
          },
        };
      },
    },
    removeItemFromCart(state, action) {
      const index = state.items.findIndex((s) => s.id === action.payload.id);
      state.items.splice(index, 1);
      state.totalValue = state.items.reduce((sum, item) => {
        return sum + item.product.price * item.quantity;
      }, 0);
    },
    updateShipping(state, action) {
      state.shippingType = action.payload;
      state.shippingValue =
        action.payload === 'Standard'
          ? parseInt(process.env.REACT_APP_STANDARD_SHIPPING_COST)
          : parseInt(process.env.REACT_APP_EXPRESS_SHIPPING_COST);
    },
    updateOrderId(state, action) {
      state.orderId = action.payload;
    },
    resetCart: () => initialState,
  },
  extraReducers(builder) {
    builder.addCase(signout, () => initialState);
    builder.addCase(updateAddress, (state, action) => {
      state.shippingAddress = action.payload;
    });
  },
});

export const {
  addItemToCart,
  initialiseCartFromDB,
  removeItemFromCart,
  updateQuantityInCart,
  updateShipping,
  updateOrderId,
  resetCart,
} = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
