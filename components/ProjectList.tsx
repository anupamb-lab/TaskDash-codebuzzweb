"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/types";

interface Props {
  onSelectProject: (project: Project) => void;
  selectedProjectId?: string;
}

export function ProjectList({ onSelectProject, selectedProjectId }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Select first project if none selected
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      onSelectProject(projects[0]);
    }
  }, [projects, selectedProjectId, onSelectProject]);

  async function fetchProjects() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to create project");
      const newProject = await res.json();

      setProjects([...projects, newProject]);
      setName("");
      setDescription("");
      onSelectProject(newProject);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      console.error("Error creating project:", err);
    }
  }

  async function handleDeleteProject(id: string) {
    const confirmed = window.confirm("Delete this project and all its tasks?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete project");

      const remainingProjects = projects.filter(p => p.id !== id);
      setProjects(remainingProjects);

      if (remainingProjects.length > 0) {
        onSelectProject(remainingProjects[0]);
      } else {
        onSelectProject({
          id: "",
          name: "",
          createdAt: "",
          description: ""
        } as Project);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
      console.error("Error deleting project:", err);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <span className="text-xs text-slate-500">
          {projects.length} project{projects.length === 1 ? "" : "s"}
        </span>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-slate-500">Loading projects...</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-3">
          {projects.map(project => {
            const tasks = Array.isArray(project.tasks) ? project.tasks : [];
            const openTasks = tasks.filter(
              t => t.status !== "done"
            ).length;
            return (
              <button
                key={project.id}
                onClick={() => onSelectProject(project)}
                className={`flex flex-col items-start rounded-xl border p-3 text-left shadow-sm transition hover:shadow-md bg-white ${
                  selectedProjectId === project.id
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-slate-200"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <h2 className="font-semibold truncate max-w-[10rem]">
                    {project.name}
                  </h2>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
                {project.description && (
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-400">
                  {openTasks} open task{openTasks === 1 ? "" : "s"}
                </p>
              </button>
            );
          })}

          <form
            onSubmit={handleCreateProject}
            className="flex flex-col gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3"
          >
            <span className="text-sm font-medium text-slate-700">
              New project
            </span>
            <input
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Project name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <textarea
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description (optional)"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <button
              type="submit"
              className="mt-1 inline-flex items-center justify-center rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
            >
              Add project
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
