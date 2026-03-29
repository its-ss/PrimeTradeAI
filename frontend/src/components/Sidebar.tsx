import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className="sidebar">
      <ul className="sidebar-nav">
        <li>
          <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/tasks" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            My Tasks
          </NavLink>
        </li>
        {user?.role === 'ADMIN' && (
          <>
            <li>
              <NavLink to="/admin/users" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                Users
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/stats" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                Stats
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </aside>
  );
}
