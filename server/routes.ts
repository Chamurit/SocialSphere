import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { projectValidationSchema, taskValidationSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Authentication check middleware
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Projects Routes
  app.get("/api/projects", isAuthenticated, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const projects = await storage.getProjectsByUserId(userId);
      res.json(projects);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/projects/:id", isAuthenticated, async (req, res, next) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user owns this project
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(project);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/projects", isAuthenticated, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      
      // Check if user already has 4 projects
      const projectCount = await storage.countProjectsByUserId(userId);
      if (projectCount >= 4) {
        return res.status(400).json({ message: "Maximum of 4 projects allowed" });
      }
      
      // Validate project data
      const projectData = projectValidationSchema.parse({
        ...req.body,
        userId
      });
      
      const newProject = await storage.createProject(projectData);
      res.status(201).json(newProject);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  app.put("/api/projects/:id", isAuthenticated, async (req, res, next) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user owns this project
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Validate project data
      const projectData = projectValidationSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const updatedProject = await storage.updateProject(projectId, projectData);
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  app.delete("/api/projects/:id", isAuthenticated, async (req, res, next) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user owns this project
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteProject(projectId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Tasks Routes
  app.get("/api/tasks", isAuthenticated, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      
      // If projectId is provided, get tasks for that project
      if (projectId) {
        const project = await storage.getProject(projectId);
        
        // Check if project exists and user owns it
        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }
        
        if (project.userId !== userId) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        const tasks = await storage.getTasksByProjectId(projectId);
        return res.json(tasks);
      }
      
      // Otherwise, get all tasks for the user
      const tasks = await storage.getTasksByUserId(userId);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/tasks/:id", isAuthenticated, async (req, res, next) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if user owns this task
      if (task.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(task);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/tasks", isAuthenticated, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      
      // Validate task data
      const taskData = taskValidationSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if project exists and user owns it
      const project = await storage.getProject(taskData.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const newTask = await storage.createTask(taskData);
      res.status(201).json(newTask);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  app.put("/api/tasks/:id", isAuthenticated, async (req, res, next) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if user owns this task
      if (task.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // If changing project, check if user owns the new project
      if (req.body.projectId && req.body.projectId !== task.projectId) {
        const project = await storage.getProject(req.body.projectId);
        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }
        
        if (project.userId !== req.user!.id) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      const updatedTask = await storage.updateTask(taskId, req.body);
      res.json(updatedTask);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/tasks/:id", isAuthenticated, async (req, res, next) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if user owns this task
      if (task.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteTask(taskId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/tasks/:id/complete", isAuthenticated, async (req, res, next) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if user owns this task
      if (task.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const completedTask = await storage.completeTask(taskId);
      res.json(completedTask);
    } catch (error) {
      next(error);
    }
  });

  // Stats endpoint
  app.get("/api/stats", isAuthenticated, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      
      // Get all projects and tasks for the user
      const projects = await storage.getProjectsByUserId(userId);
      const tasks = await storage.getTasksByUserId(userId);
      
      // Calculate stats
      const totalProjects = projects.length;
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.completed).length;
      const inProgressTasks = tasks.filter(task => !task.completed && task.status === "in-progress").length;
      
      res.json({
        totalProjects,
        totalTasks,
        completedTasks,
        inProgressTasks
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
