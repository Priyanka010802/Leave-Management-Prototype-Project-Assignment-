import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { observer } from 'mobx-react';
import { StoreProvider } from './store/StoreContext';
import { store } from './store/RootStore';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import ApplyLeave from './pages/ApplyLeave';
import MyLeaves from './pages/MyLeaves';
import TeamLeaves from './pages/TeamLeaves';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

import './index.css';

class App extends Component {
  componentDidMount() {
    store.loadInitialData();
  }

  render() {
    return (
      <StoreProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="App">
            <Navbar />
            <div className="main-content">
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/apply-leave" element={
                  <ProtectedRoute allowedRoles={['Employee']}>
                    <ApplyLeave />
                  </ProtectedRoute>
                } />
                <Route path="/my-leaves" element={
                  <ProtectedRoute allowedRoles={['Employee']}>
                    <MyLeaves />
                  </ProtectedRoute>
                } />
                
                <Route path="/team-leaves" element={
                  <ProtectedRoute allowedRoles={['Manager', 'Admin']}>
                    <TeamLeaves />
                  </ProtectedRoute>
                } />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <Dashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </div>
        </Router>
      </StoreProvider>
    );
  }
}

export default observer(App);
