import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { StoreContext } from '../store/StoreContext';
import api from '../utils/api';

class ApplyLeave extends Component {
  static contextType = StoreContext;

  state = {
    startDate: '',
    endDate: '',
    reason: '',
    error: '',
    success: '',
    submitting: false
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value, error: '', success: '' });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ error: '', success: '', submitting: true });

    const store = this.context;
    const { startDate, endDate, reason } = this.state;

    if (!startDate || !endDate || !reason) {
      this.setState({ error: 'All fields are required', submitting: false });
      return;
    }

    try {
      let serverDate = new Date();
      try {
        const serverTimeResp = await api.get('/server-time');
        if (serverTimeResp.body?.currentTime) {
          serverDate = new Date(serverTimeResp.body.currentTime);
        }
      } catch (innerErr) {
        console.warn('Failed to fetch server time, falling back to client time:', innerErr.message);
      }
      
      const start = new Date(startDate);
      const end = new Date(endDate);

      serverDate.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        this.setState({ error: 'Please enter valid dates.', submitting: false });
        return;
      }

      if (start < serverDate) {
        this.setState({ error: 'Cannot apply leave in the past.', submitting: false });
        return;
      }

      if (end < start) {
        this.setState({ error: 'End date must be greater than or equal to start date.', submitting: false });
        return;
      }

      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays > store.currentBalance) {
        this.setState({ error: `Not enough leave balance. You only have ${store.currentBalance} days left.`, submitting: false });
        return;
      }

      const leaveData = {
        employeeId: store.currentUser.id,
        employee: store.currentUser.name,
        startDate,
        endDate,
        reason,
        status: 'Pending',
        days: diffDays
      };

      await api.post('/leaves', { json: leaveData });

      store.deductLeaveDays(diffDays);

      this.setState({
        success: 'Leave applied successfully!',
        startDate: '',
        endDate: '',
        reason: '',
        submitting: false
      });

    } catch (err) {
      console.error('Submission error:', err);
      this.setState({ 
        error: err.message || 'Failed to apply leave. Please ensure the backend is running.', 
        submitting: false 
      });
    }
  };

  render() {
    const store = this.context;

    if (!store.currentUser) return null;

    return (
      <div className="container-responsive">
        <div style={styles.card} className="animate-popIn card-responsive">
          <div style={styles.header}>
            <div style={styles.brandIcon}>
              <div style={styles.dot}></div>
              <div style={styles.dotLine}></div>
            </div>
            <h2 style={styles.title}>Apply for Leave</h2>
            <p style={styles.subtitle}>Submit your request for time-off.</p>
          </div>

          <div style={styles.messageArea}>
            {this.state.error && <div style={styles.error} className="animate-wobble">{this.state.error}</div>}
            {this.state.success && <div style={styles.success} className="animate-popIn">{this.state.success}</div>}
          </div>

          <form onSubmit={this.handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Employee Name</label>
              <input
                type="text"
                value={store.currentUser.name}
                disabled
                style={styles.inputDisabled}
              />
            </div>

            <div style={styles.row}>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={this.state.startDate}
                  onChange={this.handleChange}
                  style={styles.input}
                />
              </div>

              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={this.state.endDate}
                  onChange={this.handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Reason</label>
              <textarea
                name="reason"
                value={this.state.reason}
                onChange={this.handleChange}
                style={{ ...styles.input, height: '90px', resize: 'none' }}
                placeholder="Reason for leave"
              />
            </div>

            <button
              type="submit"
              className={this.state.submitting ? "" : "btn-hover-scale animate-pulse-blue"}
              style={this.state.submitting ? styles.buttonDisabled : styles.button}
              disabled={this.state.submitting}
            >
              {this.state.submitting ? 'Authenticating Submission...' : 'Submit Leave Request'}
            </button>
          </form>
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box'
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 'clamp(20px, 5vw, 40px)',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '480px',
    border: '1px solid #e2e8f0',
    maxHeight: 'calc(100vh - 120px)',
    overflowY: 'auto'
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  messageArea: {
    minHeight: '60px'
  },
  brandIcon: {
    display: 'flex',
    justifyContent: 'center',
    gap: '6px',
    marginBottom: '15px'
  },
  dot: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    backgroundColor: '#059669'
  },
  dotLine: {
    width: '30px',
    height: '18px',
    borderRadius: '4px',
    backgroundColor: '#334155'
  },
  title: {
    marginTop: 0,
    marginBottom: '8px',
    color: '#0f172a',
    fontSize: '1.6rem',
    fontWeight: '800'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '0.95rem',
    margin: 0
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  row: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  input: {
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    fontSize: '1rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: '#f8fafc',
    color: '#1e293b'
  },
  inputDisabled: {
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    fontSize: '1rem',
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
    cursor: 'not-allowed',
    fontWeight: '500'
  },
  button: {
    padding: '16px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.05rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '15px',
    transition: 'transform 0.1s, box-shadow 0.2s',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
  },
  buttonDisabled: {
    padding: '16px',
    backgroundColor: '#94a3b8',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.05rem',
    fontWeight: '700',
    cursor: 'not-allowed',
    marginTop: '15px'
  },
  error: {
    padding: '14px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    borderRadius: '10px',
    borderLeft: '4px solid #ef4444',
    marginBottom: '20px',
    fontSize: '0.95rem',
    fontWeight: '500'
  },
  success: {
    padding: '14px',
    backgroundColor: '#f0fdf4',
    color: '#15803d',
    borderRadius: '10px',
    borderLeft: '4px solid #22c55e',
    marginBottom: '20px',
    fontSize: '0.95rem',
    fontWeight: '500'
  }
};

export default observer(ApplyLeave);
