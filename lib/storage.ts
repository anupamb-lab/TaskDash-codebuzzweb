"use client";

import type { Project, Task } from "@/types";

const PROJECT_KEY = "monday-lite-projects";
const TASK_KEY = "monday-lite-tasks";

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function loadProjects(): Project[] {
  if (typeof window === "undefined") return [];
  return safeParse<Project[]>(localStorage.getItem(PROJECT_KEY), []);
}

export function saveProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROJECT_KEY, JSON.stringify(projects));
}

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  return safeParse<Task[]>(localStorage.getItem(TASK_KEY), []);
}

export function saveTasks(tasks: Task[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
}
