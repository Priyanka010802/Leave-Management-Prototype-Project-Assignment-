import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import { StoreContext } from '../store/StoreContext';
import { withRouter } from '../utils/withRouter';

class Navbar extends Component {
  static contextType = StoreContext;

  handleRoleSwitch = (e) => {
    const store = this.context;
    const newRole = e.target.value;

    let targetUser = null;
    if (newRole === 'Employee') {
      targetUser = store.employees.find(u => u.role === 'Employee') || { id: 'e1', name: 'Priyanka', role: 'Employee' };
    } else if (newRole === 'Manager') {
      targetUser = store.employees.find(u => u.role === 'Manager') || { id: 'm1', name: 'Manager', role: 'Manager' };
    } else if (newRole === 'Admin') {
      targetUser = store.employees.find(u => u.role === 'Admin') || { id: 'a1', name: 'Admin', role: 'Admin' };
    }

    if (targetUser) {
      store.setCurrentUser(targetUser);
      const targetPath = newRole === 'Employee' ? '/apply-leave' : newRole === 'Manager' ? '/team-leaves' : '/dashboard';
      this.props.router.navigate(targetPath);
    }
  };

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
          <div style={styles.brandContainer}>
            <div style={styles.logoGroup}>
              {/* <div style={styles.logoDot}></div> */}
              {/* <div style={styles.logoLine}></div> */}
            </div>
            <div style={styles.brand}>Leave Management  <span style={{ fontWeight: '400', opacity: 0.6 }}>PROTOTYPE</span></div>
          </div>
        </nav >
      );
    }

    return (
      <nav style={styles.nav} className="nav-mobile">
        <div style={styles.brandContainer}>
          <div style={styles.logoGroup}>
            {/* <div style={styles.logoDot}></div> */}
            {/* <div style={styles.logoLine}></div> */}
          </div>
          <div style={styles.brand}>Sembark <span style={{ fontWeight: '400', opacity: 0.6 }}>LEAVE</span></div>
        </div>

        <div style={styles.links} className="nav-links-mobile">
          {currentUser.role === 'Employee' && (
            <>
              <Link to="/apply-leave" style={styles.link} className="nav-link-hover"> Apply Leave </Link>
              <Link to="/my-leaves" style={styles.link} className="nav-link-hover"> My Leaves</Link>
              <div style={styles.balanceTag}>
                <span style={styles.balanceLabel}>Leave Balance</span>
                <span style={styles.balanceValue}>{store.currentBalance} d</span>
              </div>
            </>
          )}
          {currentUser.role === 'Manager' && (
            <Link to="/team-leaves" style={styles.link} className="nav-link-hover">Team Leaves</Link>
          )}
          {currentUser.role === 'Admin' && (
            <Link to="/dashboard" style={styles.link} className="nav-link-hover">Dashboard</Link>
          )}
        </div>

        <div style={styles.userSection} className="user-section-mobile">
          <div style={styles.switcherGroup}>
            <div style={styles.switcherLabel}>Simulate Role</div>
            <select
              value={currentUser.role}
              onChange={this.handleRoleSwitch}
              style={styles.roleSelect}
            >
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Administrator</option>
            </select>
          </div>

          <div style={styles.userInfo}>
            <div style={styles.userBadge}>
              {currentUser.name.charAt(0)}
            </div>
            <div style={styles.userMeta}>
              <span style={styles.userName}>{currentUser.name}</span>
              <span style={styles.userRole}>{currentUser.role.toUpperCase()}</span>
            </div>
          </div>
          <button
            onClick={this.handleLogout}
            style={styles.logoutBtn}
            className="btn-logout-hover btn-hover-scale"
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
    padding: '0 5vw',
    height: '80px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #f1f5f9',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxSizing: 'border-box',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  logoDot: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    backgroundColor: '#0f172a'
  },
  logoLine: {
    width: '24px',
    height: '18px',
    borderRadius: '4px',
    backgroundColor: '#3b82f6'
  },
  brand: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: '-1.2px',
    margin: 0,
    userSelect: 'none'
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px'
  },
  link: {
    color: '#64748b',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '14px',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    letterSpacing: '-0.3px',
    textTransform: 'uppercase'
  },
  balanceTag: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 16px',
    backgroundColor: '#eff6ff',
    borderRadius: '10px',
    border: '1px solid #dbeafe'
  },
  balanceLabel: {
    fontSize: '9px',
    fontWeight: '900',
    color: '#3b82f6',
    letterSpacing: '1px',
    marginBottom: '1px'
  },
  balanceValue: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#1e3a8a'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    paddingLeft: '24px',
    borderLeft: '1px solid #f1f5f9'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  userBadge: {
    width: '38px',
    height: '38px',
    borderRadius: '14px',
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
    fontSize: '18px',
    border: '1px solid #e2e8f0'
  },
  userMeta: {
    display: 'flex',
    flexDirection: 'column'
  },
  userName: {
    fontWeight: '800',
    color: '#0f172a',
    fontSize: '14px',
    letterSpacing: '-0.3px'
  },
  userRole: {
    fontSize: '10px',
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: '0.8px',
    marginTop: '1px'
  },
  logoutBtn: {
    padding: '10px 20px',
    backgroundColor: '#ffffff',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '12px',
    transition: 'all 0.2s',
    letterSpacing: '0.5px'
  },
  switcherGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingRight: '20px',
    borderRight: '1px solid #f1f5f9'
  },
  switcherLabel: {
    fontSize: '9px',
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  roleSelect: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '4px 8px',
    outline: 'none',
    cursor: 'pointer'
  }
};

export default withRouter(observer(Navbar));
