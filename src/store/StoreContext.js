import React, { Component } from 'react';
import { store } from './RootStore';

export const StoreContext = React.createContext(store);

export class StoreProvider extends Component {
  render() {
    return (
      <StoreContext.Provider value={store}>
        {this.props.children}
      </StoreContext.Provider>
    );
  }
}
