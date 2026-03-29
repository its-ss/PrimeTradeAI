import { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UserRow {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  _count: { tasks: number };
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user?.role !== 'ADMIN') { navigate('/dashboard'); return; }
    api.get('/admin/users?limit=50')
      .then(({ data }) => setUsers(data.data))
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleToggleStatus = async (id: string) => {
    try {
      const { data } = await api.patch(`/admin/users/${id}/toggle-status`);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isActive: data.data.isActive } : u));
      flash(data.message);
    } catch { setError('Failed to update user status'); }
  };

  const handleRoleChange = async (id: string, role: 'USER' | 'ADMIN') => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u));
      flash('Role updated');
    } catch { setError('Failed to update role'); }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <h1 className="page-title">Users</h1>
          </div>
          {msg && <div className="alert alert-success">{msg}</div>}
          {error && <div className="alert alert-error">{error}</div>}
          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Tasks</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td><strong>{u.username}</strong></td>
                        <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                        <td>
                          <span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span>
                        </td>
                        <td>{u._count.tasks}</td>
                        <td>
                          <span style={{ color: u.isActive ? 'var(--success)' : 'var(--danger)', fontWeight: 600, fontSize: '.8rem' }}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ display: 'flex', gap: '.5rem' }}>
                          <select
                            className="form-select"
                            style={{ width: 'auto', padding: '.25rem .5rem', fontSize: '.8rem' }}
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as 'USER' | 'ADMIN')}
                            disabled={u.id === user?.id}
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          <button
                            className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-ghost'}`}
                            onClick={() => handleToggleStatus(u.id)}
                            disabled={u.id === user?.id}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
