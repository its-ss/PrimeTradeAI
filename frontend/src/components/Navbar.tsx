import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <span className="navbar-brand">⚡ PrimeTrade AI</span>
      <div className="navbar-actions">
        <span className="navbar-user">
          {user?.username}{' '}
          <span className={`badge badge-${user?.role.toLowerCase()}`}>{user?.role}</span>
        </span>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
