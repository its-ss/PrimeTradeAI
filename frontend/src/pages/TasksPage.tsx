import { useEffect, useState, useCallback } from 'react';
import { useTasks, Task } from '../hooks/useTasks';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

export default function TasksPage() {
  const { tasks, meta, loading, error, fetchTasks, createTask, updateTask, deleteTask } = useTasks();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    fetchTasks({ page, search: search || undefined, status: status || undefined, priority: priority || undefined });
  }, [fetchTasks, page, search, status, priority]);

  useEffect(() => { load(); }, [load]);

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSave = async (data: Partial<Task>) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
      flash('Task updated successfully!');
    } else {
      await createTask(data);
      flash('Task created successfully!');
    }
    load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this task?')) return;
    await deleteTask(id);
    flash('Task deleted.');
    load();
  };

  const openCreate = () => { setEditingTask(null); setShowModal(true); };
  const openEdit = (task: Task) => { setEditingTask(task); setShowModal(true); };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <h1 className="page-title">My Tasks</h1>
            <button className="btn btn-primary" onClick={openCreate}>+ New Task</button>
          </div>

          {successMsg && <div className="alert alert-success">{successMsg}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          {/* Filters */}
          <div className="filters-bar">
            <input
              className="form-input"
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ width: 200 }}
            />
            <select className="form-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
            <select className="form-select" value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }}>
              <option value="">All priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <strong>No tasks found</strong>
              <p>Create a new task to get started!</p>
            </div>
          ) : (
            <div className="task-grid">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div style={{ display: 'flex', gap: '.5rem', marginTop: '1.5rem', justifyContent: 'center' }}>
              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                ← Prev
              </button>
              <span style={{ lineHeight: '2rem', fontSize: '.875rem' }}>
                Page {meta.page} of {meta.totalPages}
              </span>
              <button className="btn btn-ghost btn-sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
                Next →
              </button>
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <TaskModal
          task={editingTask}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
