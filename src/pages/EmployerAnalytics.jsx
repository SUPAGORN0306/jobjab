import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Briefcase,
  Users,
  TrendingUp,
  CheckCircle,
  Download,
  Trophy,
  PieChart as PieIcon,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { fetchEmployerAnalytics } from '../api';
import { getJobLogoClass } from '../utils/jobLogo';
import usePageTitle from '../hooks/usePageTitle';
import EmptyState from '../components/EmptyState';
import '../styles/employer/EmployerAnalytics.css';

// ============================================
// CONSTANTS
// ============================================

const STATUS_COLORS = {
  applied: '#38bdf8',
  reviewing: '#f472b6',
  interview: '#34d399',
  rejected: '#94a3b8',
  in_review: '#f472b6',
  closed: '#94a3b8',
};

const PERIOD_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

// ============================================
// CUSTOM TOOLTIP
// ============================================

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="analytics-tooltip">
      <p className="analytics-tooltip-label">{label}</p>
      <p className="analytics-tooltip-value">{payload[0].value} applications</p>
    </div>
  );
}

// ============================================
// STAT CARD
// ============================================

function StatCard({ icon: Icon, label, value, trend, color = 'yellow' }) {
  const TrendIcon = trend?.direction === 'up' ? ArrowUp
                  : trend?.direction === 'down' ? ArrowDown
                  : Minus;

  const trendClass = trend?.direction || 'stable';

  return (
    <div className="analytics-stat-card">
      <div className={`analytics-stat-icon ${color}`}>
        <Icon size={22} />
      </div>
      <div className="analytics-stat-content">
        <span className="analytics-stat-value">{value}</span>
        <span className="analytics-stat-label">{label}</span>
        {trend && (
          <span className={`analytics-stat-trend ${trendClass}`}>
            <TrendIcon size={12} />
            {trend.text}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function EmployerAnalytics() {
  usePageTitle('Analytics', { description: 'Insights and performance metrics' });

  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await fetchEmployerAnalytics();
        setData(result);
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <div className="employer-container">
        <div className="analytics-hero">
          <div className="analytics-hero-content">
            <span className="analytics-hero-tag">
              <BarChart3 size={14} />
              ANALYTICS
            </span>
            <h1>Insights & Performance</h1>
            <p className="analytics-hero-subtitle">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR
  // ============================================
  if (error) {
    return (
      <div className="employer-container">
        <div className="analytics-hero">
          <div className="analytics-hero-content">
            <span className="analytics-hero-tag">
              <BarChart3 size={14} />
              ANALYTICS
            </span>
            <h1>Insights & Performance</h1>
            <p className="analytics-hero-subtitle" style={{ color: '#fca5a5' }}>
              Error: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // EMPTY STATE
  // ============================================
  if (!data || data.summary.total_jobs === 0) {
    return (
      <div className="employer-container">
        <div className="analytics-hero">
          <div className="analytics-hero-content">
            <span className="analytics-hero-tag">
              <BarChart3 size={14} />
              ANALYTICS
            </span>
            <h1>Insights & Performance</h1>
            <p className="analytics-hero-subtitle">
              Real-time view of your hiring pipeline
            </p>
          </div>
        </div>

        <EmptyState
          icon={BarChart3}
          title="No data yet"
          description="Post your first job to start seeing analytics"
          actionLabel="Post a Job"
          onAction={() => navigate('/employer/dashboard')}
        />
      </div>
    );
  }

  // ============================================
  // PREPARE CHART DATA
  // ============================================

  // Line chart — filter by period
  const periodDays = parseInt(period, 10);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - periodDays);

  const filteredByDate = (data.applicants_by_date || []).filter((d) => {
    return new Date(d.date) >= cutoffDate;
  });

  // ถ้าน้อยกว่า 2 points → ไม่แสดง line
  const hasLineData = filteredByDate.length >= 2;

  // Pie chart
  const pieData = (data.applicants_by_status || []).map((s) => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1).replace('_', ' '),
    value: s.count,
    status: s.status,
  }));

  // Bar chart — top jobs
  const barData = (data.top_jobs || []).map((j) => ({
    name: j.job_title,
    applicants: j.applicants,
    company: j.company_name,
  }));

  // ============================================
  // HANDLERS
  // ============================================

  const handleExport = () => {
    // Simple CSV export
    const rows = [
      ['Job Title', 'Company', 'Applicants'],
      ...(data.top_jobs || []).map((j) => [j.job_title, j.company_name, j.applicants]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRowClick = (jobId) => {
    navigate(`/employer/jobs/${jobId}/applicants`);
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="employer-container">
      {/* ============ HERO ============ */}
      <section className="analytics-hero">
        <div className="analytics-hero-content">
          <span className="analytics-hero-tag">
            <BarChart3 size={14} />
            ANALYTICS
          </span>
          <h1>Insights & Performance</h1>
          <p className="analytics-hero-subtitle">
            Real-time view of your hiring pipeline
          </p>

          <div className="analytics-hero-actions">
            <select
              className="analytics-period-select"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              {PERIOD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <button className="analytics-export-btn" onClick={handleExport}>
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>
      </section>

      {/* ============ STAT CARDS ============ */}
      <section className="analytics-stats-grid">
        <StatCard
          icon={Briefcase}
          label="Total Jobs"
          value={data.summary.total_jobs}
          color="yellow"
        />
        <StatCard
          icon={Users}
          label="Total Applicants"
          value={data.summary.total_applicants}
          color="mint"
        />
        <StatCard
          icon={TrendingUp}
          label="Active Jobs"
          value={data.summary.active_jobs}
          color="blue"
        />
        <StatCard
          icon={CheckCircle}
          label="Response Rate"
          value={`${data.summary.response_rate}%`}
          color="purple"
        />
      </section>

      {/* ============ LINE CHART ============ */}
      {hasLineData && (
        <section className="analytics-chart-section">
          <div className="analytics-chart-header">
            <div>
              <h3 className="analytics-chart-title">
                <Activity size={18} />
                Applications Over Time
              </h3>
              <p className="analytics-chart-subtitle">
                Last {period} days
              </p>
            </div>
          </div>

          <div className="analytics-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredByDate}>
                <defs>
                  <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f0d154" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f0d154" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255, 255, 255, 0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#8c9bae"
                  fontSize={11}
                  tickFormatter={(d) => {
                    const date = new Date(d);
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                />
                <YAxis
                  stroke="#8c9bae"
                  fontSize={11}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#f0d154"
                  strokeWidth={3}
                  fill="url(#colorApplications)"
                  dot={{ fill: '#f0d154', r: 4 }}
                  activeDot={{ r: 6, fill: '#f0d154', stroke: '#1a1f2e', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* ============ PIE + BAR ============ */}
      <div className="analytics-chart-2col">
        {/* PIE */}
        <section className="analytics-chart-section">
          <div className="analytics-chart-header">
            <h3 className="analytics-chart-title">
              <PieIcon size={18} />
              Applications by Status
            </h3>
          </div>

          <div className="analytics-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  stroke="none"
                >
                  {pieData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={STATUS_COLORS[entry.status] || '#8c9bae'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1a1f2e',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 12,
                    fontSize: '0.78rem',
                  }}
                  labelStyle={{ color: '#8c9bae' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="analytics-pie-legend">
            {pieData.map((entry, i) => (
              <div className="analytics-pie-legend-item" key={i}>
                <span
                  className="analytics-pie-legend-dot"
                  style={{ background: STATUS_COLORS[entry.status] || '#8c9bae' }}
                />
                {entry.name}
                <span className="analytics-pie-legend-count">{entry.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* BAR */}
        <section className="analytics-chart-section">
          <div className="analytics-chart-header">
            <h3 className="analytics-chart-title">
              <BarChart3 size={18} />
              Top 5 Jobs
            </h3>
          </div>

          <div className="analytics-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ left: 20, right: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255, 255, 255, 0.05)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="#8c9bae"
                  fontSize={11}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#8c9bae"
                  fontSize={11}
                  width={100}
                  tick={{ fill: '#d3dae4' }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1a1f2e',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 12,
                    fontSize: '0.78rem',
                  }}
                  labelStyle={{ color: '#8c9bae' }}
                />
                <Bar
                  dataKey="applicants"
                  fill="#f0d154"
                  radius={[0, 8, 8, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* ============ TOP JOBS TABLE ============ */}
      {data.top_jobs && data.top_jobs.length > 0 && (
        <section className="analytics-chart-section">
          <div className="analytics-chart-header">
            <h3 className="analytics-chart-title">
              <Trophy size={18} />
              Top Performing Jobs
            </h3>
          </div>

          <div className="analytics-table">
            <div className="analytics-table-header">
              <span>#</span>
              <span>Job Title</span>
              <span style={{ textAlign: 'right' }}>Applicants</span>
              <span>Status</span>
            </div>

            {data.top_jobs.map((job, i) => {
              const rankClass =
                i === 0 ? 'gold'
                : i === 1 ? 'silver'
                : i === 2 ? 'bronze'
                : 'grey';

              return (
                <div
                  className="analytics-table-row"
                  key={job.id}
                  onClick={() => handleRowClick(job.id)}
                >
                  <span className={`analytics-rank-badge ${rankClass}`}>
                    {i + 1}
                  </span>

                  <div className="analytics-table-title">
                    <div className={`analytics-table-logo ${getJobLogoClass(job.job_title)}`}>
                      {job.job_title?.charAt(0) || 'J'}
                    </div>
                    <div className="analytics-table-info">
                      <h4>{job.job_title}</h4>
                      <p>{job.company_name}</p>
                    </div>
                  </div>

                  <span className="analytics-table-count">{job.applicants}</span>
                  <span className="analytics-table-status">Active</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
