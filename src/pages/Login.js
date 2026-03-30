import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { StoreContext } from '../store/StoreContext';
import { withRouter } from '../utils/withRouter';

class Login extends Component {
  static contextType = StoreContext;

  state = {
    role: 'Employee',
    username: '',
    password: '',
    hasError: false
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value, hasError: false });
  };

  handleLogin = (e) => {
    e.preventDefault();
    const { role, username, password } = this.state;
    const store = this.context;

    if (!username || !password) {
      alert("Please enter username and password!");
      this.setState({ hasError: true });
      return;
    }

    if (role === 'Manager') {
      if (username !== 'manager' || password !== 'manager@123') {
        alert("Invalid Manager Credentials (use manager/manager@123)");
        this.setState({ hasError: true });
        return;
      }
      let managerUser = store.employees.find(e => e.role === 'Manager') || { id: 'm1', name: ' Manager', role: 'Manager' };
      store.setCurrentUser(managerUser);
      this.props.router.navigate('/team-leaves');
    } else if (role === 'Admin') {
      if (username !== 'admin' || password !== 'admin@123') {
        alert("Invalid Admin Credentials (use admin/admin@123)");
        this.setState({ hasError: true });
        return;
      }
      let adminUser = store.employees.find(e => e.role === 'Admin') || { id: 'a1', name: ' Admin', role: 'Admin' };
      store.setCurrentUser(adminUser);
      this.props.router.navigate('/dashboard');
    } else {
      // Employee
      if (password !== '123456') {
        alert("Invalid Employee Password.");
        this.setState({ hasError: true });
        return;
      }
      let empUser = store.employees.find(e => e.name.toLowerCase() === username.toLowerCase() && e.role === 'Employee');
      if (!empUser) {
        empUser = {
          id: Date.now().toString(),
          name: username,
          role: 'Employee'
        };
        store.employees.push(empUser);
      }
      store.setCurrentUser(empUser);
      this.props.router.navigate('/apply-leave');
    }
  };

  render() {
    const { role, username, password, hasError } = this.state;
    return (
      <div style={styles.page} className="login-container">
        
        <div style={styles.brandingPanel} className="branding-panel">
          <div style={styles.brandingContent}>
            <div style={styles.logoGroup}>
              <div style={styles.logoSquare}></div>
              <div style={{...styles.logoSquare, backgroundColor: 'rgba(255,255,255,0.4)'}}></div>
            </div>
            <h1 className="animate-popIn" style={styles.brandTitle}>Sembark</h1>
            <div className="slidewording-container">
               <p style={styles.slideText}>Streamline your workspace.</p>
               <p style={{...styles.slideText, animationDelay: '3s'}}>Effortless leave management.</p>
               <p style={{...styles.slideText, animationDelay: '6s'}}>Built for modern teams.</p>
            </div>
          </div>
          <div style={styles.brandingFooter}>
            © 2026 Sembark Tech Pvt Ltd
          </div>
        </div>

      
        <div style={styles.formPanel} className="form-panel">
          <div style={styles.card} className={hasError ? "animate-wobble" : "animate-popIn"}>
            <div style={styles.header}>
              <h2 style={styles.title}>Access Portal</h2>
              <p style={styles.subtitle}>Sign in to manage your professional presence</p>
            </div>

            <form onSubmit={this.handleLogin} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Identity Profile</label>
                <select name="role" value={role} onChange={this.handleChange} style={styles.input}>
                  <option value="Employee">Team Member (Employee)</option>
                  <option value="Manager">Department Lead (Manager)</option>
                  <option value="Admin">System Administrator (Admin)</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Username</label>
                <input
                  type="text"
                  name="username"
                  value={username}
                  onChange={this.handleChange}
                  style={styles.input}
                  placeholder={role === 'Employee' ? "Your full name" : "e.g., manager"}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Access Key</label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={this.handleChange}
                  style={styles.input}
                  placeholder="••••••••"
                />
                {role !== 'Employee' && (
                  <small style={styles.hint}>Internal hint: {role.toLowerCase()}@123</small>
                )}
              </div>

              <button type="submit" style={styles.button}>Secure Sign In</button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  page: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    backgroundColor: '#ffffff',
    overflow: 'hidden'
  },
  brandingPanel: {
    flex: '1.2',
    backgroundColor: '#1e293b',
    backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '60px',
    color: '#ffffff',
    position: 'relative',
    overflow: 'hidden'
  },
  brandingContent: {
    marginTop: '10vh'
  },
  logoGroup: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px'
  },
  logoSquare: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#3b82f6'
  },
  brandTitle: {
    fontSize: '48px',
    fontWeight: '800',
    margin: '0 0 16px 0',
    letterSpacing: '-2px'
  },
  slideText: {
    fontSize: '20px',
    color: '#94a3b8',
    margin: 0,
    position: 'absolute',
    opacity: 0,
    animation: 'slideUp 9s infinite linear'
  },
  brandingFooter: {
    fontSize: '14px',
    color: '#475569'
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
    maxWidth: '420px',
    backgroundColor: 'transparent'
  },
  header: {
    marginBottom: '40px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 8px 0',
    letterSpacing: '-1px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    margin: 0
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  input: {
    padding: '16px',
    borderRadius: '12px',
    border: '1.5px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    width: '100%',
    boxSizing: 'border-box'
  },
  hint: {
    marginTop: '6px',
    fontSize: '12px',
    color: '#94a3b8',
    textAlign: 'right',
    fontStyle: 'italic'
  },
  button: {
    marginTop: '12px',
    padding: '16px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    width: '100%',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -1px rgba(37, 99, 235, 0.1)'
  }
};

export default withRouter(observer(Login));
