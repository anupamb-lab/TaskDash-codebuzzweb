"use client";

import { useState } from "react";
import type { Project } from "@/types";
import { ProjectList } from "@/components/ProjectList";
import { TaskBoard } from "@/components/TaskBoard";

export default function HomePage() {
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();

  return (
    <div className="space-y-6">
      <ProjectList
        onSelectProject={project =>
          setSelectedProject(project.id ? project : undefined)
        }
        selectedProjectId={selectedProject?.id}
      />
      <TaskBoard project={selectedProject} />
    </div>
  );
}
