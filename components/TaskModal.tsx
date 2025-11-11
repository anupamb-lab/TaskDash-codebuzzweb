"use client";

import { useEffect, useState } from "react";
import type { Priority, Status, Task } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  initial?: Task;
  projectId: string;
}

const statusOptions: { value: Status; label: string }[] = [
  { value: "todo", label: "Planned" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" }
];

const priorityOptions: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" }
];

export function TaskModal({ open, onClose, onSave, initial, projectId }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<Status>(initial?.status ?? "todo");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "medium");
  const [assignee, setAssignee] = useState(initial?.assignee ?? "");
  const [assigneeId, setAssigneeId] = useState<string | undefined>(
    // @ts-ignore
    (initial as any)?.assigneeId
  );
  const [users, setUsers] = useState<Array<{ id: string; name?: string; email?: string }>>([]);
  const [dueDate, setDueDate] = useState(
    initial?.dueDate ? initial.dueDate.slice(0, 10) : ""
  );

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    (async function load() {
      try {
        const res = await fetch('/api/users');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setUsers(data || []);
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [open]);

  // Keep internal form state in sync when opening the modal or when
  // the `initial` task prop changes (e.g. user clicks a task to edit).
  useEffect(() => {
    if (!open) {
      // reset to defaults when modal closed
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setAssignee("");
      setAssigneeId(undefined);
      setDueDate("");
      return;
    }

    // populate fields from `initial` when modal opens for editing
    setTitle(initial?.title ?? "");
    setDescription(initial?.description ?? "");
    setStatus(initial?.status ?? "todo");
    setPriority(initial?.priority ?? "medium");
    setAssignee(initial?.assignee ?? "");
    // @ts-ignore
    setAssigneeId((initial as any)?.assigneeId ?? undefined);
    setDueDate(initial?.dueDate ? initial.dueDate.slice(0, 10) : "");
  }, [initial, open]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: initial?.id,
      projectId,
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      assignee: assignee.trim() || undefined,
      // @ts-ignore allow sending assigneeId even if Task type doesn't include it
      assigneeId: assigneeId || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined
    } as any);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">
            {initial ? "Edit task" : "New task"}
          </h2>
          <button
            onClick={onClose}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-medium text-slate-600">Title</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">
              Description
            </label>
            <textarea
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">
                Status
              </label>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={status}
                onChange={e => setStatus(e.target.value as Status)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">
                Priority
              </label>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="text-xs font-medium text-slate-600">Assignee</label>
                <select
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={assigneeId || ""}
                  onChange={e => {
                    const val = e.target.value;
                    setAssigneeId(val || undefined);
                    const user = users.find(u => u.id === val);
                    if (user) setAssignee(user.name || user.email || '');
                  }}
                >
                  <option value="">Unassigned / choose by name</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name || u.email}</option>
                  ))}
                </select>
                <input
                  className="mt-2 w-full rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={assignee}
                  onChange={e => setAssignee(e.target.value)}
                  placeholder="Or type a name (legacy)"
                />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">
                Due date
              </label>
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
            >
              {initial ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
