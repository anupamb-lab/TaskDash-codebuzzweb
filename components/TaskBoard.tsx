"use client";

import { useEffect, useMemo, useState } from "react";
import type { Project, Task, Status } from "@/types";
import { TaskModal } from "./TaskModal";

interface Props {
  project?: Project;
}

const statusColumns: { id: Status; label: string }[] = [
  { id: "todo", label: "To do" },
  { id: "in_progress", label: "In progress" },
  { id: "done", label: "Done" }
];

export function TaskBoard({ project }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks when project changes
  useEffect(() => {
    if (project?.id) {
      fetchTasks();
    }
  }, [project?.id]);

  async function fetchTasks() {
    if (!project?.id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/projects/${project.id}/tasks`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }

  const projectTasks = useMemo(
    () => tasks.filter(t => t.projectId === project?.id),
    [tasks, project?.id]
  );

  const assignees = Array.from(
    new Set(projectTasks.map(t => t.assignee).filter(Boolean) as string[])
  );

  function applyFilters(list: Task[]) {
    return list.filter(task => {
      if (filterAssignee && task.assignee !== filterAssignee) return false;
      if (filterPriority && task.priority !== filterPriority) return false;
      return true;
    });
  }

  async function handleSaveTask(partial: Partial<Task>) {
    if (!project?.id) return;

    try {
      if (partial.id) {
        // Update existing task
        const res = await fetch(`/api/projects/${project.id}/tasks`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(partial),
        });

        if (!res.ok) throw new Error("Failed to update task");
        const updated = await res.json();

        setTasks(tasks.map(t => (t.id === partial.id ? updated : t)));
      } else {
        // Create new task
        const res = await fetch(`/api/projects/${project.id}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: partial.title || "",
            description: partial.description,
            status: partial.status || "todo",
            priority: partial.priority || "medium",
            assignee: partial.assignee,
            dueDate: partial.dueDate,
          }),
        });

        if (!res.ok) throw new Error("Failed to create task");
        const newTask = await res.json();

        setTasks([...tasks, newTask]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
      console.error("Error saving task:", err);
    }
  }

  async function handleDeleteTask(id: string) {
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/projects/${project?.id}/tasks`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to delete task");

      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      console.error("Error deleting task:", err);
    }
  }

  async function moveTask(id: string, newStatus: Status) {
    try {
      const res = await fetch(`/api/projects/${project?.id}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to move task");
      const updated = await res.json();

      setTasks(tasks.map(t => (t.id === id ? updated : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move task");
      console.error("Error moving task:", err);
    }
  }

  if (!project?.id) {
    return (
      <div className="mt-6 text-center text-sm text-slate-500">
        Select or create a project to start adding tasks.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-6 text-center text-sm text-slate-500">
        Loading tasks...
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {project.name}
          </h2>
          {project.description && (
            <p className="text-xs text-slate-500">{project.description}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterAssignee}
            onChange={e => setFilterAssignee(e.target.value)}
          >
            <option value="">All assignees</option>
            {assignees.map(name => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            onClick={() => {
              setEditingTask(undefined);
              setModalOpen(true);
            }}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
          >
            + New task
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {statusColumns.map(column => {
          const items = applyFilters(
            projectTasks.filter(t => t.status === column.id)
          );
          return (
            <div
              key={column.id}
              className="flex flex-col rounded-2xl bg-slate-50 border border-slate-200 min-h-[200px]"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  {column.label}
                </span>
                <span className="text-[10px] rounded-full bg-slate-200 px-2 py-0.5 text-slate-700">
                  {items.length}
                </span>
              </div>
              <div className="flex-1 space-y-2 p-2">
                {items.map(task => (
                  <article
                    key={task.id}
                    className="rounded-xl bg-white p-2 text-xs shadow-sm border border-slate-200 hover:shadow-md cursor-pointer"
                    onClick={() => {
                      setEditingTask(task);
                      setModalOpen(true);
                    }}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-medium text-slate-800 line-clamp-2">
                        {task.title}
                      </h3>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteTask(task.id);
                        }}
                        className="text-[10px] text-red-500 hover:text-red-600"
                      >
                        ✕
                      </button>
                    </div>
                    {task.description && (
                      <p className="mt-1 text-[11px] text-slate-500 line-clamp-3">
                        {task.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          task.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : task.priority === "medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {task.priority.toUpperCase()}
                      </span>
                      {task.assignee && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">
                          {task.assignee}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="text-[10px] text-slate-500">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex gap-1">
                      {statusColumns
                        .filter(s => s.id !== task.status)
                        .map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              moveTask(task.id, s.id);
                            }}
                            className="rounded-md border border-slate-200 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100"
                          >
                            Move to {s.label}
                          </button>
                        ))}
                    </div>
                  </article>
                ))}
                {items.length === 0 && (
                  <p className="px-2 py-4 text-[11px] text-slate-400 text-center">
                    No tasks here yet.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTask}
        initial={editingTask}
        projectId={project.id}
      />
    </div>
  );
}
