import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { StoreContext } from '../store/StoreContext';
import { withRouter } from '../utils/withRouter';
import api from '../utils/api';

class TeamLeaves extends Component {
  static contextType = StoreContext;

  state = {
    teamLeaves: [],
    loading: true,
    employeesList: []
  };

  componentDidMount() {
    this.fetchEmployees();
    this.fetchLeavesFromUrl();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.router.location.search !== this.props.router.location.search) {
      this.fetchLeavesFromUrl();
    }
  }

  fetchEmployees = async () => {
    try {
      const resp = await api.get('/employees');
      this.setState({ employeesList: resp.body });
    } catch (err) { }
  };

  fetchLeavesFromUrl = async () => {
    this.setState({ loading: true });
    try {

      const query = new URLSearchParams(this.props.router.location.search);
      const employee = query.get('employee') || '';
      const status = query.get('status') || '';

      let url = '/leaves?';
      if (employee) url += `employee_like=${encodeURIComponent(employee)}&`;
      if (status) url += `status=${encodeURIComponent(status)}&`;

      const resp = await api.get(url);
      this.setState({ teamLeaves: resp.body, loading: false });
    } catch (err) {
      this.setState({ loading: false });
    }
  };

  handleFilterChange = (e) => {
    const { name, value } = e.target;
    const query = new URLSearchParams(this.props.router.location.search);

    if (value) {
      query.set(name, value);
    } else {
      query.delete(name);
    }

    this.props.router.navigate(`?${query.toString()}`);
  };

  handleAction = async (leaveId, actionStatus) => {
    try {
      const leaveIndex = this.state.teamLeaves.findIndex(l => l.id === leaveId);
      if (leaveIndex === -1) return;

      const leave = this.state.teamLeaves[leaveIndex];


      const newLeaves = [...this.state.teamLeaves];
      newLeaves[leaveIndex] = { ...leave, status: actionStatus, animating: true };
      this.setState({ teamLeaves: newLeaves });

      const updatedLeave = { ...leave, status: actionStatus };
      await api.put(`/leaves/${leaveId}`, { json: updatedLeave });

      setTimeout(() => {
        this.fetchLeavesFromUrl();
      }, 500);
    } catch (err) {
      console.error(err);
      this.fetchLeavesFromUrl();
    }
  };

  render() {
    const { teamLeaves, loading } = this.state;
    const query = new URLSearchParams(this.props.router.location.search);
    const employeeFilter = query.get('employee') || '';
    const statusFilter = query.get('status') || '';

    return (
      <div style={styles.container}>
        <div style={styles.card} className="animate-popIn">
          <div style={styles.header}>
            <div style={styles.logo}>
              {/* <div style={styles.logoSquare}></div> */}
              {/* <div style={{...styles.logoSquare, backgroundColor: '#475569'}}></div> */}
            </div>
            <h2 style={styles.title}>Team Requests</h2>
            <p style={styles.subtitle}>Review and manage employee leave applications.</p>
          </div>

          <div style={styles.filters}>
            <input
              type="text"
              name="employee"
              placeholder="Filter by Employee Name"
              value={employeeFilter}
              onChange={this.handleFilterChange}
              style={styles.input}
            />
            <select
              name="status"
              value={statusFilter}
              onChange={this.handleFilterChange}
              style={styles.select}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#64748b' }}>Loading records...</p>
          ) : teamLeaves.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No pending or historical records found.</p>
            </div>
          ) : (
            <div style={styles.tableWrapper} className="table-responsive">
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Employee</th>
                    <th style={styles.th}>Dates</th>
                    <th style={styles.th}>Days</th>
                    <th style={styles.th}>Reason</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamLeaves.map((leave, i) => (
                    <tr
                      key={leave.id}
                      style={leave.animating ? { ...styles.tr, ...styles.trAnimating } : styles.tr}
                    >
                      <td style={styles.td}>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{leave.employee}</div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ color: '#475569', fontSize: '0.9rem' }}>{leave.startDate}</div>
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
                      <td style={styles.td}>
                        {leave.status === 'Pending' && (
                          <div style={styles.actionButtons}>
                            <button
                              onClick={() => this.handleAction(leave.id, 'Approved')}
                              style={styles.btnApprove}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => this.handleAction(leave.id, 'Rejected')}
                              style={styles.btnReject}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {leave.status !== 'Pending' && (
                          <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>Resolved</span>
                        )}
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
    maxWidth: '1200px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    marginBottom: '24px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '20px',
    textAlign: 'center',
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
    marginBottom: '4px',
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
  filters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap',
    flexShrink: 0
  },
  input: {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    flex: '1',
    minWidth: '200px',
    fontSize: '0.95rem',
    outline: 'none',
    backgroundColor: '#f8fafc'
  },
  select: {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    minWidth: '180px',
    fontSize: '0.95rem',
    outline: 'none',
    backgroundColor: '#f8fafc'
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
    minWidth: '600px'
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
    transition: 'background-color 0.2s, transform 0.2s'
  },
  trAnimating: {
    transform: 'scale(1.01)',
    backgroundColor: '#f8fafc'
  },
  td: {
    padding: '16px',
    color: '#334155',
    verticalAlign: 'middle'
  },
  reasonText: {
    maxWidth: '200px',
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
  actionButtons: {
    display: 'flex',
    gap: '8px'
  },
  btnApprove: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.85rem',
    transition: 'background-color 0.2s, transform 0.1s',
    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
  },
  btnReject: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.85rem',
    transition: 'background-color 0.2s, transform 0.1s',
    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b'
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '10px'
  }
};

export default withRouter(observer(TeamLeaves));
