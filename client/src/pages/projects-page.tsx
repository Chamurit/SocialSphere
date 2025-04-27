import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ProjectModal } from "@/components/modals/project-modal";
import { Project, Task } from "@shared/schema";
import { ProjectCard } from "@/components/dashboard/project-card";
import { Button } from "@/components/ui/button";
import { PlusIcon, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function ProjectsPage() {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const { toast } = useToast();

  // Fetch projects
  const { 
    data: projects = [], 
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Fetch tasks (we need them to calculate progress for each project)
  const { 
    data: tasks = [], 
    isLoading: tasksLoading,
  } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  const isLoading = projectsLoading || tasksLoading;

  const handleAddProject = () => {
    if (projects.length >= 4) {
      toast({
        title: "Project limit reached",
        description: "You can only create up to 4 projects.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedProject(undefined);
    setShowProjectModal(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  // Filter tasks for each project
  const getTasksForProject = (projectId: number) => {
    return tasks.filter(task => task.projectId === projectId);
  };

  if (projectsError) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                  Error loading projects
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {projectsError instanceof Error ? projectsError.message : "An unexpected error occurred"}
                </p>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 md:flex md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
                  Projects
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage your active projects. You can create up to 4 projects.
                </p>
              </div>
              <div className="mt-4 flex md:ml-4 md:mt-0">
                <Button 
                  onClick={handleAddProject}
                  disabled={projects.length >= 4}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-60 rounded-lg" />
                ))}
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    tasks={getTasksForProject(project.id)}
                    onEdit={handleEditProject}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Create your first project to get started tracking your work.
                </p>
                <Button onClick={handleAddProject}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Project Modal */}
      {showProjectModal && (
        <ProjectModal
          open={showProjectModal}
          onOpenChange={setShowProjectModal}
          project={selectedProject}
        />
      )}
    </div>
  );
}
