import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { observer } from 'mobx-react';
import { StoreContext } from '../store/StoreContext';

class ProtectedRoute extends Component {
  static contextType = StoreContext;

  render() {
    const store = this.context;
    const { children, allowedRoles } = this.props;

    if (!store.currentUser) {
      return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(store.currentUser.role)) {
      return <Navigate to="/" replace />;
    }

    return children;
  }
}

export default observer(ProtectedRoute);
