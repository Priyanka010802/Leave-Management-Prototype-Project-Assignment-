import React from 'react';
import { store } from './RootStore';

export const StoreContext = React.createContext(store);

export const StoreProvider = ({ children }) => {
  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
};
