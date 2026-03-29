import { Task } from '../hooks/useTasks';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const statusLabel: Record<Task['status'], string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

const statusClass: Record<Task['status'], string> = {
  TODO: 'badge-todo',
  IN_PROGRESS: 'badge-in-progress',
  DONE: 'badge-done',
};

const priorityClass: Record<Task['priority'], string> = {
  LOW: 'badge-low',
  MEDIUM: 'badge-medium',
  HIGH: 'badge-high',
};

export default function TaskCard({ task, onEdit, onDelete }: Props) {
  return (
    <div className="card task-card">
      <div className="task-card-header">
        <span className="task-title">{task.title}</span>
        <span className={`badge ${statusClass[task.status]}`}>{statusLabel[task.status]}</span>
      </div>
      {task.description && <p className="task-description">{task.description}</p>}
      <div className="task-meta">
        <span className={`badge ${priorityClass[task.priority]}`}>{task.priority}</span>
        {task.dueDate && (
          <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>
            Due {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
      <div className="task-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
