"use client";

import { useEffect, useState } from 'react';

export default function TeamPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  async function fetchTeam() {
    try {
      setLoading(true);
      const res = await fetch('/api/team');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to fetch team data');
      }
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }

  async function handlePickTask(projectId: string, taskId: string) {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: 'in_progress' }),
      });
      if (!res.ok) throw new Error('Failed to pick task');
      // Refresh data
      await fetchTeam();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pick task');
    }
  }

  async function handleChangeStatus(projectId: string, taskId: string, status: string) {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      await fetchTeam();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  }

  if (loading) return <div className="p-8 text-sm text-slate-500">Loading Assigned tasks...</div>;
  if (error) return <div className="p-8 text-sm text-red-600">{error}</div>;

  // Flatten tasks by project to render a single table
  const rows = projects.flatMap(p =>
    (p.tasks || []).map((t: any) => ({ project: p, task: t }))
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Assigned to Me</h1>

      {rows.length === 0 ? (
        <div className="text-sm text-slate-500">No projects or tasks assigned to you yet.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Project</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Due</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {rows.map(({ project, task }: any) => (
                <tr key={task.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-700">{project.name}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{task.title}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 max-w-xl truncate">{task.description || '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>{(task.priority || 'medium').toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                        task.status === 'todo' ? 'bg-blue-100 text-blue-700' : task.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {task.status === 'todo' ? 'Planned' : task.status === 'in_progress' ? 'In Progress' : 'Done'}
                      </span>

                      {/* If task in progress, show selector to change status */}
                      {task.status === 'in_progress' && (
                        <select
                          className="ml-2 text-xs rounded border px-2 py-1"
                          value={task.status}
                          onChange={(e) => handleChangeStatus(project.id, task.id, e.target.value)}
                        >
                          <option value="todo">Planned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Completed</option>
                        </select>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex items-center justify-end gap-2">
                      {task.status === 'todo' ? (
                        <button
                          onClick={() => handlePickTask(project.id, task.id)}
                          className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                            Pick Task
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                      {/* required details quick-view */}
                      <button
                        onClick={() => alert(`Required details:\nTitle: ${task.title}\nProject: ${project.name}\nPriority: ${task.priority}\nDue: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}\nDescription: ${task.description || '—'}`)}
                        className="text-xs px-2 py-1 border rounded text-slate-700 hover:bg-slate-100"
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
