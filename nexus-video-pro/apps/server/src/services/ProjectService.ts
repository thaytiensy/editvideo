import fs from 'fs';
import path from 'path';

export interface ProjectMetadata {
  id: string;
  title: string;
  fps: number;
  width: number;
  height: number;
  tracks: any[];
  updatedAt: string;
}

export class ProjectService {
  private projects: Map<string, ProjectMetadata> = new Map();

  async getProject(id: string): Promise<ProjectMetadata | null> {
    return this.projects.get(id) || null;
  }

  async saveProject(project: ProjectMetadata): Promise<void> {
    project.updatedAt = new Date().toISOString();
    this.projects.set(project.id, project);
  }

  async listProjects(): Promise<ProjectMetadata[]> {
    return Array.from(this.projects.values());
  }
}

export const projectService = new ProjectService();
