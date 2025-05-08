import AsyncStorage from '@react-native-async-storage/async-storage';
import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import authReducer from './reducers/authReducer';

const appReducer = combineReducers({
  authReducer,
});

const rootReducer = (state: any, action: any) => {
  let reduxState = state;
  if (action.type === 'LOGOUT') {
    if (state) {
      for (let [key, value] of Object.entries(reduxState)) {
        if (key === 'staticReducer') {
          reduxState[key] = value;
        } else {
          reduxState[key] = undefined;
        }
      }
      state = reduxState;
    }
  }
  return appReducer(state, action);
};
const persistConfig = {
  key: 'TITAN_STORAGE',
  storage: AsyncStorage,
  whitelist: ['userReducer', 'helperReducer', 'staticReducer', 'traderReducer'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});
export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
