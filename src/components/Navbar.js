import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import { StoreContext } from '../store/StoreContext';
import { withRouter } from '../utils/withRouter';

class Navbar extends Component {
  static contextType = StoreContext;

  handleLogout = () => {
    const store = this.context;
    store.logout();
    this.props.router.navigate('/');
  };

  render() {
    const store = this.context;
    const { currentUser } = store;

    if (!currentUser) {
      return (
        <nav style={styles.nav}>
          <div style={styles.brand}>LeaveMS Prototype</div>
        </nav>
      );
    }

    return (
      <nav style={styles.nav} className="nav-mobile">
        <div style={styles.brandContainer}>
          <div style={styles.logo}>
            {/* <div style={styles.logoSquare}></div> */}
            {/* <div style={{...styles.logoSquare, backgroundColor: '#475569'}}></div> */}
          </div>
          <div style={styles.brand}>LeaveMS Portal</div>
        </div>

        <div style={styles.links} className="nav-links-mobile">
          {currentUser.role === 'Employee' && (
            <>
              <Link to="/apply-leave" style={styles.link}>Apply Leave</Link>
              <Link to="/my-leaves" style={styles.link}>History</Link>
              <span style={styles.balanceBadge}>Balance: {store.currentBalance} d</span>
            </>
          )}
          {currentUser.role === 'Manager' && (
            <Link to="/team-leaves" style={styles.link}>Manage Team</Link>
          )}
          {currentUser.role === 'Admin' && (
            <Link to="/dashboard" style={styles.link}>System Dashboard</Link>
          )}
        </div>
        <div style={styles.userSection} className="user-section-mobile">
          <span style={styles.userName}>{currentUser.name}</span>
          <button
            onClick={this.handleLogout}
            className="btn-red-active"
            style={styles.logoutBtn}
          >
            Sign Out
          </button>
        </div>
      </nav>
    );
  }
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 40px',
    height: '72px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxSizing: 'border-box'
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logo: {
    display: 'flex',
    gap: '4px'
  },
  logoSquare: {
    width: '12px',
    height: '12px',
    borderRadius: '3px',
    backgroundColor: '#2563eb'
  },
  brand: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.4px',
    margin: 0
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px'
  },
  link: {
    color: '#475569',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'color 0.2s',
  },
  balanceBadge: {
    backgroundColor: '#f8fafc',
    color: '#1e293b',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    border: '1px solid #e2e8f0'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    paddingLeft: '24px',
    borderLeft: '1px solid #e2e8f0',
    height: '32px'
  },
  userName: {
    fontWeight: '600',
    color: '#334155',
    fontSize: '14px'
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '13px',
    transition: 'all 0.2s',
  }
};

export default withRouter(observer(Navbar));
