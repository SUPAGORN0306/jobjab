import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, BarChart3, Briefcase, Download, Inbox, Target, Zap,
  PieChart as PieIcon, Sparkles, Trophy, Users, TrendingUp,
  CircleDot, CheckCircle2, XCircle, Clock, ArrowRight,
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart, PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import {
  fetchEmployerAnalytics, exportEmployerAnalytics, fetchAnalyticsWidgets,
} from '../api';
import { getJobLogoClass, getJobLogoColor } from '../utils/jobLogo';
import usePageTitle from '../hooks/usePageTitle';
import useCountUp from '../hooks/useCountUp';
import EmptyState from '../components/EmptyState';
import { AnalyticsGridSkeleton, ChartSkeleton } from '../components/EmployerSkeleton';
import { EmployerHero } from '../components/employer';
import { toast } from 'sonner';
import '../styles/employer/EmployerAnalytics.css';

// ─── Constants ───
const STATUS_META = {
  applied:   { label: 'Applied',   color: '#38bdf8', Icon: CircleDot },
  reviewing: { label: 'Reviewing', color: '#f472b6', Icon: Clock },
  interview: { label: 'Interview', color: '#34d399', Icon: CheckCircle2 },
  rejected:  { label: 'Rejected',  color: '#94a3b8', Icon: XCircle },
};

const PERIOD_OPTIONS = [
  { value: '7',  short: '7D'  },
  { value: '30', short: '30D' },
  { value: '90', short: '90D' },
];

const JOB_ABBR = {
  'Computer Vision Engineer': 'CV Eng',
  'AI Product Manager': 'AI PM',
  'Quant Researcher': 'Quant',
  'Data Scientist': 'DS',
  'Data Analyst': 'DA',
  'ML Engineer': 'ML Eng',
  'AI Researcher': 'AI Res',
  'NLP Engineer': 'NLP',
};

// ─── Helpers ───
function timeAgo(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return 'now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  return `${Math.floor(sec / 86400)}d`;
}

// ─── Components ───
function PlainTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="ax-tip">
      <div className="ax-tip-label">{label}</div>
      <div className="ax-tip-value">
        {payload[0].value}{unit && <span className="ax-tip-unit"> {unit}</span>}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail, color = 'yellow' }) {
  const numeric = typeof value === 'number' ? value : 0;
  const animated = useCountUp(numeric, 600);
  const zero = numeric === 0;
  return (
    <div className={`ax-stat ${zero ? 'is-zero' : ''}`}>
      <div className={`ax-stat-icon ${color}`}>
        <Icon size={18} strokeWidth={2.2} />
      </div>
      <div className="ax-stat-body">
        <span className="ax-stat-label">{label}</span>
        <span className="ax-stat-value">{animated}</span>
        {detail && <span className="ax-stat-detail">{detail}</span>}
      </div>
    </div>
  );
}

function EmptyChart({ icon: Icon = Inbox, title, description, actionLabel, onAction }) {
  return (
    <div className="ax-empty">
      <div className="ax-empty-icon"><Icon size={20} strokeWidth={1.6} /></div>
      <h4 className="ax-empty-title">{title}</h4>
      {description && <p className="ax-empty-desc">{description}</p>}
      {actionLabel && onAction && (
        <button className="ax-empty-btn" onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  );
}

// ─── Main ───
export default function EmployerAnalytics() {
  usePageTitle('Analytics', { description: 'Insights and performance metrics' });
  const navigate = useNavigate();

  const [data, setData]           = useState(null);
  const [widgets, setWidgets]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState(null);
  const [period, setPeriod]       = useState('30');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (!data) setLoading(true);
        else setRefreshing(true);

        const [analyticsData, widgetsData] = await Promise.all([
          fetchEmployerAnalytics({ period }),
          fetchAnalyticsWidgets({ period }),
        ]);

        if (!cancelled) {
          setData(analyticsData);
          setWidgets(widgetsData);
          setError(null);
        }
      } catch (err) {
        console.error('Analytics fetch error:', err);
        if (!cancelled) setError(err.message || 'Failed to load analytics');
      } finally {
        if (!cancelled) { setLoading(false); setRefreshing(false); }
      }
    };
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const derived = useMemo(() => {
    if (!data) return null;
    const summary  = data.summary || {};
    const timeline = data.applicants_by_date || [];
    const pieRaw   = data.applicants_by_status || [];
    const topJobs  = data.top_jobs || [];

    const pie = pieRaw
      .filter((s) => STATUS_META[s.status])
      .map((s) => ({
        name: STATUS_META[s.status].label,
        value: s.count,
        status: s.status,
        color: STATUS_META[s.status].color,
      }));

    const bar = topJobs.map((j) => ({
      name: JOB_ABBR[j.job_title] || (j.job_title?.slice(0, 8) || 'Unknown'),
      fullName: j.job_title,
      applicants: j.applicants,
      color: getJobLogoColor(j.job_title),
    }));

    const totalApps = summary.total_applicants || 0;
    const interviewRate = totalApps
      ? Math.round(((summary.interviews || 0) / totalApps) * 100)
      : 0;

    return {
      summary, timeline, pie, bar, topJobs, interviewRate,
      hasTimeline: timeline.some((d) => d.count > 0),
      hasPie: pie.some((p) => p.value > 0),
      hasBar: bar.some((b) => b.applicants > 0),
      hasAny: totalApps > 0,
    };
  }, [data]);

  const goToJobs = () => navigate('/employer/jobs');
  const goToApplicants = (jobId) =>
    navigate(jobId ? `/employer/jobs/${jobId}/applicants` : '/employer/applicants');

  const handleExport = async () => {
    try {
      toast.loading('Preparing export...', { id: 'export' });
      const exportData = await exportEmployerAnalytics({ period });

      const rows = [
        ['JobJab Analytics Export'],
        ['Period', `Last ${period} days`],
        ['Generated', exportData.generated_at],
        [],
        ['SUMMARY'],
        ['Metric', 'Value'],
        ['Total Jobs', exportData.summary.total_jobs],
        ['Active Jobs', exportData.summary.active_jobs],
        ['Total Applicants', exportData.summary.total_applicants],
        ['Response Rate', `${exportData.summary.response_rate}%`],
        ['Interview Rate', `${exportData.summary.interview_rate}%`],
        ['Interviews', exportData.summary.interviews],
        ['Rejected', exportData.summary.rejected],
        [],
        ['APPLICANTS'],
        ['Name', 'Email', 'Phone', 'Location', 'Job Applied', 'Company',
         'Status', 'Applied Date', 'Match Score', 'Matched Skills', 'Resume'],
        ...exportData.applicants.map((a) => [
          `"${(a.full_name || '').replace(/"/g, '""')}"`,
          `"${(a.email || '').replace(/"/g, '""')}"`,
          `"${(a.phone || '').replace(/"/g, '""')}"`,
          `"${(a.location || '').replace(/"/g, '""')}"`,
          `"${(a.job_title || '').replace(/"/g, '""')}"`,
          `"${(a.company_name || '').replace(/"/g, '""')}"`,
          a.status || '',
          a.applied_date ? a.applied_date.slice(0, 10) : '',
          `${a.match_score}%`,
          `"${(a.matched_skills || '').replace(/"/g, '""')}"`,
          a.resume_url ? `"${a.resume_url}"` : 'No resume',
        ]),
        [],
        ['TOP JOBS'],
        ['Job Title', 'Company', 'Applicants', 'Status'],
        ...exportData.top_jobs.map((j) => [
          `"${(j.job_title || '').replace(/"/g, '""')}"`,
          `"${(j.company_name || '').replace(/"/g, '""')}"`,
          j.applicants,
          j.status || 'active',
        ]),
      ];

      const csv = '\uFEFF' + rows.map((r) => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jobjab-analytics-${period}d-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported: ${exportData.applicants.length} applicants`, { id: 'export' });
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Export failed', { id: 'export' });
    }
  };

  if (loading) {
    return (
      <div className="employer-container ax-page">
        <EmployerHero variant="analytics" tag="ANALYTICS" tagIcon={BarChart3}
          title="Insights & Performance" subtitle="Loading analytics..." />
        <AnalyticsGridSkeleton count={4} />
        <ChartSkeleton height={240} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="employer-container ax-page">
        <EmployerHero variant="analytics" tag="ANALYTICS" tagIcon={BarChart3}
          title="Insights & Performance"
          subtitle={<span style={{ color: '#fca5a5' }}>Error: {error}</span>} />
      </div>
    );
  }

  if (!data || data.summary.total_jobs === 0) {
    return (
      <div className="employer-container ax-page">
        <EmployerHero variant="analytics" tag="ANALYTICS" tagIcon={BarChart3}
          title="Insights & Performance" subtitle="Real-time view of your hiring pipeline" />
        <EmptyState icon={BarChart3} title="No data yet"
          description="Post your first job to start seeing analytics"
          actionLabel="Post a Job"
          onAction={() => navigate('/employer/dashboard')} />
      </div>
    );
  }

  const {
    summary, timeline, pie, bar, topJobs, interviewRate,
    hasTimeline, hasPie, hasBar, hasAny,
  } = derived;

  const funnel = widgets?.funnel || [];
  const topMatches = widgets?.top_matches || [];
  const activity = widgets?.recent_activity || [];
  const funnelMax = Math.max(...funnel.map((f) => f.count), 1);

  return (
    <div className={`employer-container ax-page ${refreshing ? 'is-refreshing' : ''}`}>
      {/* HERO */}
      <EmployerHero
        variant="analytics" tag="ANALYTICS" tagIcon={BarChart3}
        title="Insights & Performance"
        subtitle="Real-time view of your hiring pipeline"
        actions={
          <>
            <div className="ax-segmented" role="tablist">
              {PERIOD_OPTIONS.map((o) => (
                <button key={o.value} type="button" role="tab"
                  aria-selected={period === o.value}
                  className={`ax-segmented-btn ${period === o.value ? 'is-active' : ''}`}
                  onClick={() => setPeriod(o.value)}>
                  {o.short}
                </button>
              ))}
            </div>
            <button className="ax-export" onClick={handleExport}>
              <Download size={13} strokeWidth={2.5} />
              Export
            </button>
          </>
        }
      />

      {/* STATS */}
      <section className="ax-stats">
        <StatCard icon={Briefcase} color="yellow" label="Total Jobs"
          value={summary.total_jobs} detail={`${summary.active_jobs} active`} />
        <StatCard icon={Users} color="mint" label="Applicants"
          value={summary.total_applicants} detail={`Last ${period} days`} />
        <StatCard icon={Zap} color="blue" label="Response Rate"
          value={summary.response_rate} detail="Reviewing + interview" />
        <StatCard icon={Activity} color="purple" label="Interview Rate"
          value={interviewRate} detail={`${summary.interviews || 0} interviews`} />
      </section>

      {/* BENTO — 3 col × 2 row */}
      <div className="ax-bento">
        {/* ROW 1: Timeline | Pie | Top Matches */}
        <section className="ax-card ax-bento-timeline">
          <header className="ax-card-header">
            <div>
              <h3 className="ax-card-title">
                <Activity size={14} strokeWidth={2.5} />
                Applications Over Time
              </h3>
              <p className="ax-card-sub">Last {period} days</p>
            </div>
          </header>
          <div className="ax-chart-body">
            {hasTimeline ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="axGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f0d154" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f0d154" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="#697382" fontSize={10}
                    tickLine={false} axisLine={false}
                    tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    minTickGap={30} />
                  <YAxis stroke="#697382" fontSize={10} tickLine={false} axisLine={false}
                    allowDecimals={false} width={28} />
                  <Tooltip content={<PlainTooltip unit="applications" />}
                    cursor={{ stroke: 'rgba(240,209,84,0.3)', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="count" stroke="#f0d154" strokeWidth={2.5}
                    fill="url(#axGrad)" dot={false}
                    activeDot={{ r: 4, fill: '#f0d154', stroke: '#0b0f19', strokeWidth: 2 }}
                    animationDuration={600} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart icon={Activity} title="No applications"
                description={hasAny ? 'Try a longer range' : 'Applications will appear here'}
                actionLabel={period !== '90' ? 'View 90 days' : null}
                onAction={period !== '90' ? () => setPeriod('90') : null} />
            )}
          </div>
        </section>

        <section className="ax-card ax-bento-pie">
          <header className="ax-card-header">
            <h3 className="ax-card-title">
              <PieIcon size={14} strokeWidth={2.5} />
              By Status
            </h3>
          </header>
          <div className="ax-chart-body ax-bento-pie-body">
            {hasPie ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                  <Pie data={pie} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" innerRadius={34} outerRadius={52}
                    paddingAngle={3} stroke="none" animationDuration={600}>
                    {pie.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                  </Pie>
                  <Tooltip content={<PlainTooltip unit="applications" />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart icon={PieIcon} title="No data" description="Status appears once candidates apply" />
            )}
          </div>
          {hasPie && (
            <div className="ax-legend ax-legend-compact">
              {pie.map((entry) => (
                <div className="ax-legend-item" key={entry.status}>
                  <span className="ax-legend-dot" style={{ background: entry.color }} />
                  <span>{entry.name}</span>
                  <span className="ax-legend-count">{entry.value}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="ax-card ax-bento-matches">
          <header className="ax-card-header">
            <h3 className="ax-card-title">
              <Target size={14} strokeWidth={2.5} />
              Top Matches
            </h3>
          </header>
          <div className="ax-list-body">
            {topMatches.length > 0 ? (
              <div className="ax-matches">
                {topMatches.map((m) => (
                  <div key={m.id} className="ax-match-row">
                    <span
                      className="ax-match-score"
                      data-tier={m.match_score >= 80 ? 'high' : m.match_score >= 60 ? 'mid' : 'low'}
                    >
                      {m.match_score}%
                    </span>
                    <div className="ax-match-info">
                      <h4>{m.full_name}</h4>
                      <p>{m.job_title}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyChart icon={Target} title="No matches yet" description="Top applicants will appear here" />
            )}
          </div>
        </section>

        {/* ROW 2: Funnel | Top Jobs | Activity */}
        <section className="ax-card ax-bento-funnel">
          <header className="ax-card-header">
            <h3 className="ax-card-title">
              <TrendingUp size={14} strokeWidth={2.5} />
              Hiring Funnel
            </h3>
          </header>
          <div className="ax-list-body">
            {funnel.length > 0 && funnel[0].count > 0 ? (
              <div className="ax-funnel">
                {funnel.map((f) => (
                  <div key={f.stage} className="ax-funnel-row">
                    <span className="ax-funnel-stage">{f.stage}</span>
                    <div className="ax-funnel-track">
                      <div
                        className="ax-funnel-bar"
                        style={{
                          width: `${Math.max((f.count / funnelMax) * 100, 3)}%`,
                          background: f.color,
                        }}
                      />
                    </div>
                    <span className="ax-funnel-count">{f.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyChart icon={TrendingUp} title="No funnel data" description="Pipeline will appear here" />
            )}
          </div>
        </section>

        <section className="ax-card ax-bento-bar">
          <header className="ax-card-header">
            <h3 className="ax-card-title">
              <BarChart3 size={14} strokeWidth={2.5} />
              Top Jobs
            </h3>
          </header>
          <div className="ax-chart-body">
            {hasBar ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bar} layout="vertical"
                  margin={{ top: 2, right: 12, left: 0, bottom: 2 }}
                  barCategoryGap={4}>
                  <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="#697382" fontSize={10}
                    tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name"
                    width={58} tickLine={false} axisLine={false} interval={0}
                    tick={(props) => {
                      const { x, y, payload } = props;
                      return (
                        <text x={x} y={y} dy={3} textAnchor="end"
                          fill="#d3dae4" fontSize={10} style={{ whiteSpace: 'nowrap' }}>
                          {payload.value}
                        </text>
                      );
                    }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const item = payload[0].payload;
                      return (
                        <div className="ax-tip">
                          <div className="ax-tip-label">{item.fullName}</div>
                          <div className="ax-tip-value">
                            {item.applicants}<span className="ax-tip-unit"> applications</span>
                          </div>
                        </div>
                      );
                    }}
                    cursor={{ fill: 'rgba(240,209,84,0.05)' }} />
                  <Bar dataKey="applicants" radius={[0, 5, 5, 0]} maxBarSize={16} animationDuration={600}>
                    {bar.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart icon={Sparkles} title="No data to rank"
                description="Top jobs appear once candidates apply" />
            )}
          </div>
        </section>

        <section className="ax-card ax-bento-activity">
          <header className="ax-card-header">
            <h3 className="ax-card-title">
              <Activity size={14} strokeWidth={2.5} />
              Recent Activity
            </h3>
          </header>
          <div className="ax-list-body">
            {activity.length > 0 ? (
              <div className="ax-activity">
                {activity.slice(0, 5).map((a) => {
                  const meta = STATUS_META[a.status] || STATUS_META.applied;
                  const Icon = meta.Icon;
                  const ts = a.updated_at || a.applied_date;
                  return (
                    <div key={a.id} className="ax-activity-row">
                      <div className="ax-activity-icon" style={{ color: meta.color }}>
                        <Icon size={11} strokeWidth={2.5} />
                      </div>
                      <div className="ax-activity-info">
                        <h4>{a.full_name}</h4>
                        <p>{a.job_title} · {meta.label}</p>
                      </div>
                      <span className="ax-activity-time">{timeAgo(ts)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyChart icon={Activity} title="No recent activity" description="New applications will appear here" />
            )}
          </div>
        </section>
      </div>

      {/* TABLE */}
      {topJobs.length > 0 && (
        <section className="ax-card ax-table-card">
          <header className="ax-card-header">
            <h3 className="ax-card-title">
              <Trophy size={14} strokeWidth={2.5} />
              Top Performing Jobs
            </h3>
            <button className="ax-card-link" onClick={goToJobs}>
              View all <ArrowRight size={12} />
            </button>
          </header>
          <div className="ax-table">
            <div className="ax-table-head">
              <span>#</span>
              <span>Job</span>
              <span className="ax-cell-right">Applicants</span>
              <span className="ax-cell-right">Status</span>
            </div>
            {topJobs.map((job, i) => {
              const rank = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'plain';
              const isActive = (job.status || 'active') === 'active';
              const zero = (job.applicants || 0) === 0;
              return (
                <button key={job.id} type="button" className="ax-table-row"
                  onClick={() => goToApplicants(job.id)}>
                  <span className={`ax-rank ${rank}`}>{i + 1}</span>
                  <div className="ax-row-job">
                    <div className={`ax-row-logo ${getJobLogoClass(job.job_title)}`}>
                      {job.job_title?.charAt(0)?.toUpperCase() || 'J'}
                    </div>
                    <div className="ax-row-info">
                      <h4>{job.job_title}</h4>
                      <p>{job.company_name}</p>
                    </div>
                  </div>
                  <span className={`ax-row-count ${zero ? 'is-zero' : ''}`}>{job.applicants}</span>
                  <span className={`ax-row-status ${isActive ? 'is-active' : 'is-paused'}`}>
                    {isActive ? 'Active' : 'Paused'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
