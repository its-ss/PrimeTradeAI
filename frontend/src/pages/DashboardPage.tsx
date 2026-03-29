import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks/useTasks';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, loading, fetchTasks } = useTasks();
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState<{ users?: { total: number }; tasks?: { total: number; byStatus: Record<string, number>; byPriority: Record<string, number> } } | null>(null);

  useEffect(() => {
    fetchTasks({ limit: 50 });
  }, [fetchTasks]);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    setStatsLoading(true);
    import('../services/api').then(({ default: api }) =>
      api.get('/admin/stats').then(({ data }) => {
        setStats(data.data);
        setStatsLoading(false);
      }).catch(() => setStatsLoading(false))
    );
  }, [user?.role]);

  const taskCounts = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'TODO').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    done: tasks.filter((t) => t.status === 'DONE').length,
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <h1 className="page-title">Dashboard</h1>
          </div>

          <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
            Welcome back, <strong>{user?.username}</strong>! Here's your overview.
          </p>

          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : (
            <div className="stats-grid">
              <div className="card stat-card">
                <div className="stat-label">My Tasks</div>
                <div className="stat-value">{taskCounts.total}</div>
              </div>
              <div className="card stat-card">
                <div className="stat-label">To Do</div>
                <div className="stat-value">{taskCounts.todo}</div>
              </div>
              <div className="card stat-card">
                <div className="stat-label">In Progress</div>
                <div className="stat-value">{taskCounts.inProgress}</div>
              </div>
              <div className="card stat-card">
                <div className="stat-label">Done</div>
                <div className="stat-value">{taskCounts.done}</div>
              </div>
            </div>
          )}

          {user?.role === 'ADMIN' && (
            <div style={{ marginTop: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
                Platform Overview (Admin)
              </h2>
              {statsLoading ? (
                <div className="spinner-wrap"><div className="spinner" /></div>
              ) : stats ? (
                <div className="stats-grid">
                  <div className="card stat-card">
                    <div className="stat-label">Total Users</div>
                    <div className="stat-value">{stats.users?.total ?? 0}</div>
                  </div>
                  <div className="card stat-card">
                    <div className="stat-label">Total Tasks</div>
                    <div className="stat-value">{stats.tasks?.total ?? 0}</div>
                  </div>
                  {stats.tasks && Object.entries(stats.tasks.byStatus).map(([s, count]) => (
                    <div className="card stat-card" key={s}>
                      <div className="stat-label">{s.replace('_', ' ')}</div>
                      <div className="stat-value">{count}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
