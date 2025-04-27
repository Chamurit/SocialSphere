import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ProjectModal } from "@/components/modals/project-modal";
import { TaskModal } from "@/components/modals/task-modal";
import { Project, Task } from "@shared/schema";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ProjectCard } from "@/components/dashboard/project-card";
import { TaskItem } from "@/components/tasks/task-item";
import { Button } from "@/components/ui/button";
import { PlusIcon, Folder, CheckSquare, CheckCircle, Clock } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();

  // Fetch projects
  const { 
    data: projects = [], 
    isLoading: projectsLoading 
  } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Fetch tasks
  const { 
    data: tasks = [], 
    isLoading: tasksLoading 
  } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  // Fetch stats
  const { 
    data: stats, 
    isLoading: statsLoading 
  } = useQuery<{
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
  }>({
    queryKey: ['/api/stats'],
  });

  const handleAddProject = () => {
    setSelectedProject(undefined);
    setShowProjectModal(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleAddTask = () => {
    setSelectedTask(undefined);
    setShowTaskModal(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // Get recent projects (up to 3)
  const recentProjects = [...projects].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }).slice(0, 3);

  // Get recent incomplete tasks (up to 5)
  const recentTasks = [...tasks]
    .filter(task => !task.completed)
    .sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 5);

  // Find project details for each task
  const getProjectForTask = (taskProjectId: number) => {
    return projects.find(p => p.id === taskProjectId);
  };

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
                  Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Welcome back! Here's an overview of your projects and tasks.
                </p>
              </div>
              <div className="mt-4 flex md:ml-4 md:mt-0 space-x-3">
                <Button onClick={handleAddTask}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Task
                </Button>
                <Button onClick={handleAddProject}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              {statsLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))
              ) : (
                <>
                  <StatsCard
                    title="Total Projects"
                    value={stats?.totalProjects || 0}
                    icon={Folder}
                  />
                  <StatsCard
                    title="Total Tasks"
                    value={stats?.totalTasks || 0}
                    icon={CheckSquare}
                  />
                  <StatsCard
                    title="Completed Tasks"
                    value={stats?.completedTasks || 0}
                    icon={CheckCircle}
                    iconColor="text-green-500"
                  />
                  <StatsCard
                    title="In Progress"
                    value={stats?.inProgressTasks || 0}
                    icon={Clock}
                    iconColor="text-yellow-500"
                  />
                </>
              )}
            </div>

            {/* Recent Projects */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  Recent Projects
                </h2>
                <Link href="/projects">
                  <Button variant="link" size="sm">
                    View all projects
                  </Button>
                </Link>
              </div>
              {projectsLoading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-60 rounded-lg" />
                  ))}
                </div>
              ) : recentProjects.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {recentProjects.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      tasks={tasks.filter(task => task.projectId === project.id)}
                      onEdit={handleEditProject}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center">
                  <h3 className="text-gray-900 dark:text-white font-medium mb-2">No projects yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Create your first project to get started.
                  </p>
                  <Button onClick={handleAddProject}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </div>
              )}
            </div>

            {/* Recent Tasks */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  Recent Tasks
                </h2>
                <Link href="/tasks">
                  <Button variant="link" size="sm">
                    View all tasks
                  </Button>
                </Link>
              </div>
              {tasksLoading ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentTasks.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentTasks.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        project={getProjectForTask(task.projectId)}
                        onEdit={handleEditTask}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center">
                  <h3 className="text-gray-900 dark:text-white font-medium mb-2">No tasks yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Create your first task to get started.
                  </p>
                  <Button onClick={handleAddTask}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showProjectModal && (
        <ProjectModal
          open={showProjectModal}
          onOpenChange={setShowProjectModal}
          project={selectedProject}
        />
      )}

      {showTaskModal && (
        <TaskModal
          open={showTaskModal}
          onOpenChange={setShowTaskModal}
          task={selectedTask}
          projects={projects}
        />
      )}
    </div>
  );
}
