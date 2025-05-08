import {createSlice} from '@reduxjs/toolkit';

const staticReducer = createSlice({
  name: 'authReducer',
  initialState: {
    user: {} as any,
  },
  reducers: {
    setUser(state, action) {
      return {
        ...state,
        userCredential: action.payload,
      };
    },
  },
});

const {actions, reducer} = staticReducer;
export const {setUser} = actions;
const authReducer = reducer;
export default authReducer;
