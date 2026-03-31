import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { StoreContext } from '../store/StoreContext';
import api from '../utils/api';

class MyLeaves extends Component {
  static contextType = StoreContext;

  state = {
    myLeaves: [],
    loading: true,
    error: ''
  };

  async componentDidMount() {
    this.fetchMyLeaves();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const store = this.context;
    if (store.currentUser && this.state.myLeaves.length > 0) {
      if (store.currentUser.id !== this.state.myLeaves[0].employeeId) {
        this.fetchMyLeaves();
      }
    }
  }

  fetchMyLeaves = async () => {
    const store = this.context;
    if (!store.currentUser) return;
    
    this.setState({ loading: true, error: '' });
    try {
      const resp = await api.get(`/leaves?employeeId=${store.currentUser.id}`);
      this.setState({ myLeaves: resp.body, loading: false });
    } catch (err) {
      this.setState({ 
        loading: false, 
        error: 'Connection to server failed. Please ensure the backend is running.' 
      });
    }
  };

  render() {
    const { myLeaves, loading, error } = this.state;

    return (
      <div className="container-responsive">
        <div style={styles.card} className="animate-popIn card-responsive">
          <div style={styles.header}>
            <div style={styles.brandIcon}>
              <div style={styles.dot}></div>
              <div style={styles.dotLine}></div>
            </div>
            <h1 style={styles.title}>Your Leave History</h1>
            <p style={styles.subtitle}>Track and manage your submitted requests.</p>
          </div>

          {loading ? (
            <div style={styles.stateContainer}>
              <div style={styles.loadingSpinner}></div>
              <p style={styles.stateText}>Syncing your records...</p>
            </div>
          ) : error ? (
            <div style={styles.stateContainer}>
              <p style={{...styles.stateText, color: '#ef4444'}}>{error}</p>
              <button onClick={this.fetchMyLeaves} style={styles.retryBtn}>Retry Connection</button>
            </div>
          ) : myLeaves.length === 0 ? (
            <div style={styles.stateContainer}>
              <p style={styles.stateText}>No records found in your repository.</p>
            </div>
          ) : (
            <div style={styles.tableWrapper} className="table-responsive">
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Reference Date</th>
                    <th style={styles.th}>Duration</th>
                    <th style={styles.th}>Days</th>
                    <th style={styles.th}>Subject / Reason</th>
                    <th style={styles.th}>Application Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myLeaves.map((leave, i) => (
                    <tr key={leave.id} style={styles.tr} className="table-row-animate">
                      <td style={styles.td}>
                        <div style={{fontWeight: '600', color: '#1e293b'}}>{leave.startDate}</div>
                      </td>
                      <td style={styles.td}>
                        <div style={{fontSize: '0.85rem', color: '#64748b'}}>
                          {leave.startDate} <span style={{color: '#cbd5e1'}}>→</span> {leave.endDate}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.dayBadge}>{leave.days} d</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.reasonText}>{leave.reason}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: leave.status === 'Approved' ? '#f0fdf4' : leave.status === 'Rejected' ? '#fef2f2' : '#fffbeb',
                          color: leave.status === 'Approved' ? '#166534' : leave.status === 'Rejected' ? '#991b1b' : '#92400e',
                          border: `1px solid ${leave.status === 'Approved' ? '#bbf7d0' : leave.status === 'Rejected' ? '#fecaca' : '#fde68a'}`
                        }}>
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
    padding: 'clamp(24px, 5vw, 40px)',
    borderRadius: '20px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    width: '100%',
    maxWidth: '1100px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 120px)'
  },
  header: {
    marginBottom: '32px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '24px',
    flexShrink: 0
  },
  brandIcon: {
    display: 'flex',
    gap: '6px',
    marginBottom: '16px'
  },
  dot: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    backgroundColor: '#3b82f6'
  },
  dotLine: {
    width: '28px',
    height: '16px',
    borderRadius: '4px',
    backgroundColor: '#e2e8f0'
  },
  title: {
    margin: '0 0 8px 0',
    color: '#0f172a',
    fontSize: '24px',
    fontWeight: '800',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '15px',
    margin: 0
  },
  stateContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    color: '#94a3b8'
  },
  stateText: {
    fontSize: '16px',
    fontWeight: '500'
  },
  loadingSpinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #f1f5f9',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  retryBtn: {
    padding: '10px 20px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#475569',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px'
  },
  tableWrapper: {
    width: '100%',
    overflow: 'auto',
    borderRadius: '12px',
    border: '1px solid #f1f5f9',
    flex: 1
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    minWidth: '700px'
  },
  th: {
    textAlign: 'left',
    padding: '16px 20px',
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontWeight: '700',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },
  tr: {
    transition: 'background-color 0.2s'
  },
  td: {
    padding: '18px 20px',
    borderBottom: '1px solid #f8fafc',
    color: '#334155',
    verticalAlign: 'middle'
  },
  dayBadge: {
    backgroundColor: '#f1f5f9',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#475569',
    border: '1px solid #e2e8f0'
  },
  reasonText: {
    maxWidth: '280px',
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.5',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  statusBadge: {
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '800',
    display: 'inline-block',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }
};

export default observer(MyLeaves);
