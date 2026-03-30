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

    if (loading) return <div style={styles.container}>Loading...</div>;

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
          label: 'Applied Leaves',
          data: Object.values(employeeData),
          backgroundColor: [
            'rgba(37, 99, 235, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: '#0f172a'
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      animation: {
        duration: 2000,
        easing: 'easeOutQuart'
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          padding: 12,
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 13 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { display: false },
          ticks: { stepSize: 1, color: '#64748b' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#64748b' }
        }
      }
    };

    return (
      <div style={styles.container}>
        <div style={styles.card} className="animate-popIn">
          <div style={styles.header}>
            <div style={styles.logo}>
              {/* <div style={styles.logoSquare}></div> */}
              {/* <div style={{...styles.logoSquare, backgroundColor: '#475569'}}></div> */}
            </div>
            <div style={styles.headerText}>
              <h2 style={styles.title}>System Overview</h2>
              <p style={styles.subtitle}>Administrative control panel for leave management.</p>
            </div>
          </div>

          <div style={styles.statsGrid} className="stats-grid-mobile">
            <div style={{ ...styles.statCard, border: '1px solid #e2e8f0' }}>
              <h3 style={styles.statTitle}>Total Applications</h3>
              <p style={{ ...styles.statValue, color: '#0f172a' }}>{total}</p>
            </div>
            <div style={{ ...styles.statCard, border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4' }}>
              <h3 style={styles.statTitle}>Approved</h3>
              <p style={{ ...styles.statValue, color: '#166534' }}>{approved}</p>
            </div>
            <div style={{ ...styles.statCard, border: '1px solid #fde68a', backgroundColor: '#fffbeb' }}>
              <h3 style={styles.statTitle}>Pending</h3>
              <p style={{ ...styles.statValue, color: '#92400e' }}>{pending}</p>
            </div>
            <div style={{ ...styles.statCard, border: '1px solid #fecaca', backgroundColor: '#fef2f2' }}>
              <h3 style={styles.statTitle}>Rejected</h3>
              <p style={{ ...styles.statValue, color: '#991b1b' }}>{rejected}</p>
            </div>
          </div>

          <div style={styles.chartSection}>
            <h3 style={styles.sectionTitle}>Employee Leave Statistics</h3>
            <div style={styles.chartContainer}>
              <Bar
                data={chartData}
                options={{
                  ...chartOptions,
                  maintainAspectRatio: false
                }}
              />
            </div>
          </div>
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
    padding: 'clamp(24px, 5vw, 40px)',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    width: '100%',
    maxWidth: '1200px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '100%',
    overflowY: 'auto'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid #f1f5f9',
    flexShrink: 0
  },
  logo: {
    display: 'flex',
    gap: '4px'
  },
  logoSquare: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    backgroundColor: '#2563eb'
  },
  headerText: {
    display: 'flex',
    flexDirection: 'column'
  },
  title: {
    margin: '0 0 4px 0',
    color: '#0f172a',
    fontSize: '24px',
    fontWeight: '700',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '14px',
    margin: 0
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px',
    marginBottom: '48px'
  },
  statCard: {
    padding: '24px',
    borderRadius: '12px',
    textAlign: 'left',
    backgroundColor: '#ffffff'
  },
  statTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statValue: {
    margin: 0,
    fontSize: '32px',
    fontWeight: '700'
  },
  chartSection: {
    marginTop: '24px',
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '16px',
    flexShrink: 0
  },
  chartContainer: {
    padding: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden'
  }
};

export default observer(Dashboard);
