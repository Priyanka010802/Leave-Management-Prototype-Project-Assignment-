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
    employeesList: [],
    error: '',
    processingId: null
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
    } catch (err) {}
  };

  fetchLeavesFromUrl = async () => {
    this.setState({ loading: true, error: '' });
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
      this.setState({ 
        loading: false, 
        error: 'Network synchronization failed. Please verify server connectivity.' 
      });
    }
  };

  handleFilterChange = (e) => {
    const { name, value } = e.target;
    const query = new URLSearchParams(this.props.router.location.search);
    if (value) query.set(name, value);
    else query.delete(name);
    this.props.router.navigate(`?${query.toString()}`);
  };

  handleAction = async (leaveId, actionStatus) => {
    this.setState({ processingId: leaveId });
    try {
      const leave = this.state.teamLeaves.find(l => l.id === leaveId);
      if (!leave) return;

      const updatedLeave = { ...leave, status: actionStatus };
      await api.put(`/leaves/${leaveId}`, { json: updatedLeave });

      // Artificial delay for smooth animation transition
      setTimeout(() => {
        this.fetchLeavesFromUrl();
        this.setState({ processingId: null });
      }, 600);
    } catch (err) {
      console.error(err);
      this.setState({ processingId: null });
      this.fetchLeavesFromUrl();
    }
  };

  render() {
    const { teamLeaves, loading, error, processingId } = this.state;
    const query = new URLSearchParams(this.props.router.location.search);
    const employeeFilter = query.get('employee') || '';
    const statusFilter = query.get('status') || '';

    return (
      <div className="container-responsive">
        <div style={styles.card} className="animate-popIn card-responsive">
          <div style={styles.header}>
            <div style={styles.headerContent}>
              <div style={styles.headerTitleGroup}>
                <div style={styles.brandBadge}>Management</div>
                <h2 style={styles.title}>Team Leave Requests</h2>
                <p style={styles.subtitle}>Administrative control for application processing.</p>
              </div>
              <div style={styles.filters}>
                <input
                  type="text"
                  name="employee"
                  placeholder="Seach by name..."
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
                  <option value="Pending">Pending Only</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          <div style={styles.content}>
            {loading ? (
              <div style={styles.loadingArea}>
                <div style={styles.spinner}></div>
              </div>
            ) : error ? (
              <div style={styles.errorArea}>{error}</div>
            ) : teamLeaves.length === 0 ? (
              <div style={styles.emptyArea}>No records found matching your filters.</div>
            ) : (
              <div style={styles.tableWrapper} className="table-responsive">
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Employee Identity</th>
                      <th style={styles.th}>Schedule</th>
                      <th style={styles.th}>Days</th>
                      <th style={styles.th}>Justification</th>
                      <th style={styles.th}>Current Status</th>
                      <th style={styles.th}>Resolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamLeaves.map((leave) => (
                      <tr key={leave.id} style={processingId === leave.id ? styles.trProcessing : styles.tr} className={processingId === leave.id ? "animate-shimmer table-row-animate" : "table-row-animate"}>
                        <td style={styles.td}>
                          <div style={styles.empName}>{leave.employee}</div>
                          <div style={styles.empId}>ID: #{leave.employeeId || 'N/A'}</div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.dateRange}>{leave.startDate}</div>
                          <div style={{fontSize: '11px', color: '#94a3b8'}}>to {leave.endDate}</div>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.dayBadge}>{leave.days} d</span>
                        </td>
                        <td style={styles.td}>
                          <div title={leave.reason} style={styles.reasonText}>{leave.reason}</div>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: leave.status === 'Approved' ? '#ecfdf5' : leave.status === 'Rejected' ? '#fef2f2' : '#fffbeb',
                            color: leave.status === 'Approved' ? '#059669' : leave.status === 'Rejected' ? '#dc2626' : '#d97706',
                          }}>
                            {leave.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {leave.status === 'Pending' ? (
                            <div style={styles.actions}>
                              <button 
                                onClick={() => this.handleAction(leave.id, 'Approved')} 
                                style={styles.approveBtn}
                                className="btn-hover-scale"
                                disabled={processingId !== null}
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => this.handleAction(leave.id, 'Rejected')} 
                                style={styles.rejectBtn}
                                className="btn-hover-scale"
                                disabled={processingId !== null}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={styles.resolvedLabel}>Archive Verified</span>
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
    width: '100%',
    maxWidth: '1200px',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 120px)',
    border: '1px solid #e2e8f0'
  },
  header: {
    padding: '32px',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#ffffff'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px',
    flexWrap: 'wrap'
  },
  headerTitleGroup: {
    flex: '1'
  },
  brandBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    fontSize: '11px',
    fontWeight: '800',
    borderRadius: '20px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '12px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 4px 0',
    letterSpacing: '-1px'
  },
  subtitle: {
    fontSize: '15px',
    color: '#64748b',
    margin: 0
  },
  filters: {
    display: 'flex',
    gap: '12px'
  },
  input: {
    padding: '12px 18px',
    borderRadius: '12px',
    border: '1.5px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    width: '240px',
    fontFamily: 'inherit'
  },
  select: {
    padding: '12px 18px',
    borderRadius: '12px',
    border: '1.5px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    width: '180px',
    fontFamily: 'inherit',
    cursor: 'pointer'
  },
  content: {
    flex: 1,
    padding: '0 32px 32px 32px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  loadingArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f1f5f9',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  tableWrapper: {
    flex: 1,
    overflow: 'auto',
    borderRadius: '16px',
    border: '1px solid #f1f5f9'
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0
  },
  th: {
    padding: '20px',
    textAlign: 'left',
    backgroundColor: '#f8fafc',
    fontSize: '12px',
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },
  tr: {
    transition: 'background-color 0.2s'
  },
  trProcessing: {
    backgroundColor: '#f8fafc',
    opacity: 0.6,
    transition: 'all 0.4s'
  },
  td: {
    padding: '20px',
    borderBottom: '1px solid #f8fafc',
    verticalAlign: 'middle'
  },
  empName: {
    fontWeight: '700',
    color: '#1e293b',
    fontSize: '15px'
  },
  empId: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '2px'
  },
  dateRange: {
    fontWeight: '600',
    color: '#334155',
    fontSize: '14px'
  },
  dayBadge: {
    padding: '4px 10px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#475569'
  },
  reasonText: {
    fontSize: '14px',
    color: '#64748b',
    maxWidth: '220px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  statusBadge: {
    padding: '6px 14px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  actions: {
    display: 'flex',
    gap: '10px'
  },
  approveBtn: {
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  rejectBtn: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  resolvedLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    fontStyle: 'italic',
    fontWeight: '500'
  },
  errorArea: {
    padding: '40px',
    textAlign: 'center',
    color: '#ef4444',
    fontWeight: '600'
  },
  emptyArea: {
    padding: '60px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '16px'
  }
};

export default withRouter(observer(TeamLeaves));
