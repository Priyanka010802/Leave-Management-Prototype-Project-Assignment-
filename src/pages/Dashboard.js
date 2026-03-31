import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { StoreContext } from '../store/StoreContext';
import api from '../utils/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as ChartTitle, Tooltip, Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend
);

class Dashboard extends Component {
  static contextType = StoreContext;

  state = {
    leaves: [],
    loading: true
  };

  async componentDidMount() {
    try {
      const resp = await api.get('/leaves');
      this.setState({ leaves: resp.body, loading: false });
    } catch (err) {
      this.setState({ loading: false });
    }
  }

  render() {
    const { leaves, loading } = this.state;

    if (loading) return <div style={styles.loadingContainer}><div style={styles.spinner}></div></div>;

    const total = leaves.length;
    let approved = 0, pending = 0, rejected = 0;
    const employeeData = {};

    leaves.forEach(l => {
      if (l.status === 'Approved') approved++;
      if (l.status === 'Pending') pending++;
      if (l.status === 'Rejected') rejected++;

      if (!employeeData[l.employee]) {
        employeeData[l.employee] = 0;
      }
      employeeData[l.employee]++;
    });

    const chartData = {
      labels: Object.keys(employeeData),
      datasets: [
        {
          label: 'Applications',
          data: Object.values(employeeData),
          backgroundColor: '#3b82f6',
          borderRadius: 6,
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8' } },
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
      }
    };

    return (
      <div className="container-responsive animate-fadeIn">
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.headerInfo}>
              <div style={styles.badge}>System Analytics</div>
              <h1 style={styles.title}>Admin Command Center</h1>
              <p style={styles.subtitle}>Real-time monitoring of personnel leave transitions.</p>
            </div>
            <div style={styles.headerActions}>
              <button style={styles.exportBtn}>Generate Report</button>
            </div>
          </div>

          <div style={styles.statsGrid} className="stats-grid-mobile">
            <div style={styles.statCard}>
              <div style={{...styles.statIcon, backgroundColor: '#eff6ff', color: '#2563eb'}}>Σ</div>
              <div style={styles.statInfo}>
                <span style={styles.statLabel}>Total Volume</span>
                <span style={styles.statValue}>{total}</span>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statIcon, backgroundColor: '#ecfdf5', color: '#10b981'}}>✓</div>
              <div style={styles.statInfo}>
                <span style={styles.statLabel}>Success Rate</span>
                <span style={styles.statValue}>{approved}</span>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statIcon, backgroundColor: '#fffbeb', color: '#f59e0b'}}>?</div>
              <div style={styles.statInfo}>
                <span style={styles.statLabel}>Await Review</span>
                <span style={styles.statValue}>{pending}</span>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statIcon, backgroundColor: '#fef2f2', color: '#ef4444'}}>✕</div>
              <div style={styles.statInfo}>
                <span style={styles.statLabel}>Declined</span>
                <span style={styles.statValue}>{rejected}</span>
              </div>
            </div>
          </div>

          <div style={styles.visualSection}>
            <div style={styles.chartTitleBox}>
              <h3 style={styles.sectionTitle}>Application Distribution by User</h3>
              <p style={styles.sectionSubtitle}>Top contributing employees this cycle</p>
            </div>
            <div style={styles.chartBox}>
              <Bar data={chartData} options={chartOptions} />
            </div>
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
    backgroundColor: '#f1f5f9',
    boxSizing: 'border-box'
  },
  loadingContainer: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  card: {
    width: '100%',
    maxWidth: '1200px',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 120px)',
    border: '1px solid #e2e8f0'
  },
  header: {
    padding: '40px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    borderRadius: '20px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '16px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 8px 0',
    letterSpacing: '-1px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    margin: 0
  },
  exportBtn: {
    padding: '12px 24px',
    backgroundColor: '#ffffff',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    color: '#0f172a',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  statsGrid: {
    padding: '40px',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
    backgroundColor: '#f8fafc'
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700'
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '600'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a'
  },
  visualSection: {
    flex: 1,
    padding: '40px',
    display: 'flex',
    flexDirection: 'column'
  },
  chartTitleBox: {
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 4px 0'
  },
  sectionSubtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0
  },
  chartBox: {
    flex: 1,
    minHeight: '300px'
  }
};

export default observer(Dashboard);
