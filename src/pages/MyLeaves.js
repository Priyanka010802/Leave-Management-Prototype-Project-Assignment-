import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { StoreContext } from '../store/StoreContext';
import api from '../utils/api';

class MyLeaves extends Component {
  static contextType = StoreContext;

  state = {
    myLeaves: [],
    loading: true
  };

  componentDidMount() {
    this.fetchMyLeaves();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const store = this.context;
    if (store.currentUser && this.state.myLeaves.length > 0) {
      // Check if user switched
      if (store.currentUser.id !== this.state.myLeaves[0].employeeId) {
        this.fetchMyLeaves();
      }
    }
  }

  fetchMyLeaves = async () => {
    const store = this.context;
    if (!store.currentUser) return;

    this.setState({ loading: true });
    try {
      const resp = await api.get(`/leaves?employeeId=${store.currentUser.id}`);
      this.setState({ myLeaves: resp.body, loading: false });
    } catch (err) {
      console.error(err);
      this.setState({ loading: false });
    }
  };

  render() {
    const { myLeaves, loading } = this.state;

    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.logo}>
              <div style={styles.logoSquare}></div>
              <div style={{ ...styles.logoSquare, backgroundColor: '#475569' }}></div>
            </div>
            <h2 style={styles.title}>Personal Leave History</h2>
            <p style={styles.subtitle}>Review your submitted leave requests and their statuses.</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }} className="animate-pulse">Loading...</div>
          ) : myLeaves.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}></div>
              <p style={{ color: '#64748b' }}>You haven't applied for any leaves yet.</p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Dates</th>
                    <th style={styles.th}>Days</th>
                    <th style={styles.th}>Reason</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myLeaves.map((leave, i) => (
                    <tr key={leave.id} style={{ ...styles.tr, animationDelay: `${i * 0.05}s` }} className="table-row-animate">
                      <td style={styles.td}>
                        <div style={{ color: '#334155', fontWeight: '600' }}>{leave.startDate}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>to {leave.endDate}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.dayBadge}>{leave.days}d</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.reasonText}>{leave.reason}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: leave.status === 'Approved' ? '#dcfce7' : leave.status === 'Rejected' ? '#fee2e2' : '#fef9c3',
                          color: leave.status === 'Approved' ? '#166534' : leave.status === 'Rejected' ? '#991b1b' : '#854d0e',
                          border: `1px solid ${leave.status === 'Approved' ? '#bbf7d0' : leave.status === 'Rejected' ? '#fecaca' : '#fef08a'}`
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
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    padding: '24px',
    boxSizing: 'border-box'
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 'clamp(20px, 5vw, 32px)',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '1000px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '1px solid #f1f5f9',
    flexShrink: 0
  },
  logo: {
    display: 'flex',
    justifyContent: 'center',
    gap: '4px',
    marginBottom: '16px'
  },
  logoSquare: {
    width: '14px',
    height: '14px',
    borderRadius: '3px',
    backgroundColor: '#2563eb'
  },
  title: {
    marginTop: 0,
    marginBottom: '8px',
    color: '#0f172a',
    fontSize: '20px',
    fontWeight: '700',
    letterSpacing: '-0.3px'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '14px',
    margin: 0
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
    overflowY: 'auto',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    flex: 1
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '500px'
  },
  th: {
    textAlign: 'left',
    padding: '14px 16px',
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontWeight: '700',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #e2e8f0'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s'
  },
  td: {
    padding: '16px',
    color: '#334155',
    verticalAlign: 'middle'
  },
  reasonText: {
    maxWidth: '250px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '0.9rem',
    color: '#475569'
  },
  dayBadge: {
    backgroundColor: '#f1f5f9',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#334155',
    border: '1px solid #e2e8f0'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '700',
    display: 'inline-block',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
  }
};

export default observer(MyLeaves);
