import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { StoreContext } from '../store/StoreContext';
import { withRouter } from '../utils/withRouter';
import api from '../utils/api';

class Login extends Component {
  static contextType = StoreContext;

  state = {
    role: 'Employee',
    username: '',
    password: '',
    hasError: false,
    animating: false
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value, hasError: false });
  };

  handleLogin = (e) => {
    e.preventDefault();
    const { role, username, password } = this.state;
    const store = this.context;

    if (!username || !password) {
      this.setState({ hasError: true });
      return;
    }

    this.setState({ animating: true });

    setTimeout(async () => {
      let userFound = null;
      try {
        if (role === 'Manager') {
          if (username === 'manager' && password === 'manager@123') {
            userFound = store.employees.find(e => e.role === 'Manager') || { id: 'm1', name: 'Manager', role: 'Manager' };
          }
        } else if (role === 'Admin') {
          if (username === 'admin' && password === 'admin@123') {
            userFound = store.employees.find(e => e.role === 'Admin') || { id: 'a1', name: 'Admin', role: 'Admin' };
          }
        } else {
          if (password === '123456') {
            // Re-fetch employees to ensure we have the latest list from server
            const resp = await api.get('/employees');
            const allEmployees = resp.body || [];
            
            userFound = allEmployees.find(e => 
              e.name.toLowerCase() === username.trim().toLowerCase() && 
              e.role === 'Employee'
            );

            if (!userFound) {
              userFound = { id: Date.now().toString(), name: username.trim(), role: 'Employee' };
              await api.post('/employees', { json: userFound });
            }
          }
        }
      } catch (err) {
        console.error('Login auth error:', err);
      }

      if (userFound) {
        store.setCurrentUser(userFound);
        const target = role === 'Manager' ? '/team-leaves' : role === 'Admin' ? '/dashboard' : '/apply-leave';
        this.props.router.navigate(target);
      } else {
        this.setState({ hasError: true, animating: false });
      }
    }, 600);
  };

  render() {
    const { role, username, password, hasError, animating } = this.state;

    return (
      <div style={styles.page} className="animate-fadeIn login-container">
        <div style={styles.brandingPanel} className="branding-panel">
          <div style={styles.brandingContent}>
            <div style={styles.brandIcon}>
              <div style={styles.dot}></div>
              <div style={styles.dotLine}></div>
            </div>
            <h1 style={styles.brandTitle}>Sembark <span style={{ fontWeight: 300 }}>Portal</span></h1>
            <p style={styles.brandSubtitle}>Intelligence in Leave Management.</p>

            <div style={styles.featureBox}>
              <div style={styles.featureItem}>
                <div style={styles.featureDot}></div>
                <span>Role-based Access Control</span>
              </div>
              <div style={styles.featureItem}>
                <div style={styles.featureDot}></div>
                <span>Real-time Leave Synchronization</span>
              </div>
              <div style={styles.featureItem}>
                <div style={styles.featureDot}></div>
                <span>Automated Approval Workflows</span>
              </div>
            </div>
          </div>

          <div style={styles.brandingFooter}>
            &copy; 2026 Sembark Tech Pvt Ltd
          </div>
        </div>

        <div style={styles.formPanel} className="form-panel">
          <div style={animating ? { ...styles.card, opacity: 0.5, transform: 'scale(0.98)' } : styles.card} className={hasError ? "animate-wobble" : "animate-popIn"}>
            <div style={styles.formHeader}>
              <h2 style={styles.title}>Welcome Back</h2>
              <p style={styles.subtitle}>Select your identity to continue.</p>
            </div>

            <form onSubmit={this.handleLogin} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Workspace Role</label>
                <div style={styles.selectWrapper}>
                  <select name="role" value={role} onChange={this.handleChange} style={styles.select}>
                    <option value="Employee">Employee Access</option>
                    <option value="Manager">Manager Portal</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Identifier</label>
                <input
                  type="text"
                  name="username"
                  value={username}
                  onChange={this.handleChange}
                  style={hasError ? { ...styles.input, borderColor: '#ef4444' } : styles.input}
                  placeholder={role === 'Employee' ? " Employee Name" : "Username"}
                  autoComplete="off"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Secure Key</label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={this.handleChange}
                  style={hasError ? { ...styles.input, borderColor: '#ef4444' } : styles.input}
                  placeholder="••••••••"
                />
                {hasError && <span style={styles.errorText}>Invalid credentials provided.</span>}
                {role !== 'Employee' && !hasError && (
                  <span style={styles.hintText}>Hint: {role.toLowerCase()}/{role.toLowerCase()}@123</span>
                )}
              </div>

              <button type="submit" disabled={animating} style={animating ? styles.buttonDisabled : styles.button}>
                {animating ? 'Authenticating...' : 'Sign In to Workspace'}
              </button>
            </form>

            <div style={styles.footerLinks}>
              <span>Trouble signing in?</span>
              <a href="#!" style={styles.link}>Contact Support</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  page: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    backgroundColor: '#ffffff',
    overflow: 'auto'
  },
  brandingPanel: {
    flex: '1.4',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    padding: '80px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    color: '#ffffff',
    position: 'relative',
    overflow: 'hidden'
  },
  brandingContent: {
    zIndex: 2
  },
  brandIcon: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '40px'
  },
  dot: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    backgroundColor: '#3b82f6'
  },
  dotLine: {
    width: '40px',
    height: '24px',
    borderRadius: '6px',
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  brandTitle: {
    fontSize: '56px',
    fontWeight: '800',
    margin: '0 0 16px 0',
    letterSpacing: '-2px',
    color: '#3b82f6'
  },
  brandSubtitle: {
    fontSize: '20px',
    color: '#94a3b8',
    marginBottom: '60px',
    fontWeight: '400'
  },
  featureBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    fontSize: '16px',
    color: '#cbd5e1'
  },
  featureDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6'
  },
  brandingFooter: {
    fontSize: '14px',
    color: '#475569',
    zIndex: 2
  },
  formPanel: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: '40px'
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    transition: 'all 0.3s ease'
  },
  formHeader: {
    marginBottom: '48px'
  },
  title: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 12px 0',
    letterSpacing: '-1px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  input: {
    padding: '16px',
    borderRadius: '12px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: 'inherit'
  },
  selectWrapper: {
    position: 'relative'
  },
  select: {
    padding: '16px',
    borderRadius: '12px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    fontSize: '16px',
    outline: 'none',
    width: '100%',
    cursor: 'pointer',
    appearance: 'none',
    fontFamily: 'inherit'
  },
  button: {
    padding: '18px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
    transition: 'all 0.2s'
  },
  buttonDisabled: {
    padding: '18px',
    backgroundColor: '#94a3b8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'not-allowed',
    boxShadow: 'none'
  },
  errorText: {
    fontSize: '13px',
    color: '#ef4444',
    fontWeight: '500',
    marginTop: '4px'
  },
  hintText: {
    fontSize: '12px',
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'right'
  },
  footerLinks: {
    marginTop: '40px',
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#64748b'
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '600'
  }
};

export default withRouter(observer(Login));
