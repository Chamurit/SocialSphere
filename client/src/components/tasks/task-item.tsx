import { useState } from "react";
import { Task, Project } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Folder, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface TaskItemProps {
  task: Task;
  project?: Project;
  onEdit: (task: Task) => void;
  showProject?: boolean;
}

export function TaskItem({ task, project, onEdit, showProject = true }: TaskItemProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'todo':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">To Do</Badge>;
      case 'in-progress':
      case 'in progress':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleToggleComplete = async () => {
    try {
      setIsCompleting(true);
      if (task.completed) {
        await apiRequest("PUT", `/api/tasks/${task.id}`, { 
          completed: false,
          status: "todo"
        });
        toast({
          title: "Task reopened",
          description: "The task has been marked as incomplete.",
        });
      } else {
        await apiRequest("PUT", `/api/tasks/${task.id}`, { 
          completed: true,
          status: "completed",
          completedAt: new Date()
        });
        toast({
          title: "Task completed",
          description: "The task has been marked as complete.",
        });
      }
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    } catch (error) {
      toast({
        title: "Failed to update task",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await apiRequest("DELETE", `/api/tasks/${task.id}`);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: "Task deleted",
        description: "The task has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Failed to delete task",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  };

  return (
    <>
      <div className="group flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
        <div className="flex items-center flex-1 min-w-0">
          <Checkbox 
            checked={task.completed} 
            onCheckedChange={handleToggleComplete}
            disabled={isCompleting}
            className="h-4 w-4 mr-3 flex-shrink-0"
          />
          
          <div className="min-w-0 flex-1">
            <p className={cn(
              "text-sm font-medium",
              task.completed ? "text-gray-500 dark:text-gray-400 line-through" : "text-gray-900 dark:text-white"
            )}>
              {task.title}
            </p>
            
            {task.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                {task.description}
              </p>
            )}
            
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {showProject && project && (
                <div className="flex items-center">
                  <Folder className="h-3.5 w-3.5 mr-1" />
                  <span>{project.name}</span>
                </div>
              )}
              
              {task.dueDate && (
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>
                    {task.completed 
                      ? `Completed: ${format(new Date(task.completedAt!), "MMM d, yyyy")}`
                      : `Due: ${format(new Date(task.dueDate), "MMM d, yyyy")}`
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex-shrink-0 flex items-center gap-2">
          {getStatusBadge(task.status)}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteAlert(true)} 
                className="text-red-600 dark:text-red-400"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task "{task.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
