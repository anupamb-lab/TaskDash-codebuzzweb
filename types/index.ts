export type Status = "todo" | "in_progress" | "done";
export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  assignee?: string;
  dueDate?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  tasks?: Task[];
}
