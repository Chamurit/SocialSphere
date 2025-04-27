import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { TaskModal } from "@/components/modals/task-modal";
import { Project, Task } from "@shared/schema";
import { TaskItem } from "@/components/tasks/task-item";
import { Button } from "@/components/ui/button";
import { PlusIcon, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function TasksPage() {
  const [location, setLocation] = useLocation();
  const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const projectIdParam = search.get('projectId');
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>(projectIdParam || "all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Update URL when project filter changes
  useEffect(() => {
    if (projectFilter === "all") {
      setLocation("/tasks", { replace: true });
    } else {
      setLocation(`/tasks?projectId=${projectFilter}`, { replace: true });
    }
  }, [projectFilter, setLocation]);

  // Fetch projects
  const { 
    data: projects = [], 
    isLoading: projectsLoading,
  } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Fetch tasks, potentially filtered by project
  const { 
    data: tasks = [], 
    isLoading: tasksLoading,
    error: tasksError,
  } = useQuery<Task[]>({
    queryKey: ['/api/tasks', projectFilter !== "all" ? { projectId: projectFilter } : null],
  });

  const isLoading = projectsLoading || tasksLoading;

  const handleAddTask = () => {
    setSelectedTask(undefined);
    setShowTaskModal(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // Get the filtered tasks
  const getFilteredTasks = () => {
    return tasks.filter(task => {
      // Filter by status
      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  // Find project details for each task
  const getProjectForTask = (taskProjectId: number) => {
    return projects.find(p => p.id === taskProjectId);
  };

  // Sort tasks: incomplete first, then by due date, then by creation date
  const sortedTasks = [...getFilteredTasks()].sort((a, b) => {
    // Completed tasks at the bottom
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Sort by due date if available
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    // Tasks with due dates come before tasks without
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    
    // Finally sort by creation date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (tasksError) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                  Error loading tasks
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {tasksError instanceof Error ? tasksError.message : "An unexpected error occurred"}
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
                  Tasks
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage all your tasks across projects.
                </p>
              </div>
              <div className="mt-4 flex md:ml-4 md:mt-0">
                <Button onClick={handleAddTask} disabled={projects.length === 0}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </div>
            </div>

            <Card className="mb-6">
              <CardHeader className="p-4">
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <div className="w-40">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-48">
                      <Select value={projectFilter} onValueChange={setProjectFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by project" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Projects</SelectItem>
                          {projects.map(project => (
                            <SelectItem key={project.id} value={project.id.toString()}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {isLoading ? (
              <Card>
                <CardContent className="p-0">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </CardContent>
              </Card>
            ) : projects.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects created</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  You need to create a project before you can add tasks.
                </p>
                <Button onClick={() => setLocation("/projects")}>
                  Go to Projects
                </Button>
              </div>
            ) : sortedTasks.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedTasks.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        project={getProjectForTask(task.projectId)}
                        onEdit={handleEditTask}
                        showProject={projectFilter === "all"}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchQuery || statusFilter !== "all" || projectFilter !== "all" 
                    ? "Try changing your filters to see more tasks."
                    : "Create your first task to get started."}
                </p>
                <Button onClick={handleAddTask}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          open={showTaskModal}
          onOpenChange={setShowTaskModal}
          task={selectedTask}
          projects={projects}
          projectId={projectFilter !== "all" ? parseInt(projectFilter) : undefined}
        />
      )}
    </div>
  );
}
