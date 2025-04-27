import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  emailNotifications: boolean("email_notifications").default(true),
  darkMode: boolean("dark_mode").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  emailNotifications: true,
  darkMode: true,
});

// Project schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("planning"),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  dueDate: timestamp("due_date"),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  status: true,
  userId: true,
  dueDate: true,
});

// Task schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("todo"),
  userId: integer("user_id").notNull(),
  projectId: integer("project_id").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  dueDate: timestamp("due_date"),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  status: true,
  userId: true,
  projectId: true,
  completed: true,
  dueDate: true,
});

// Create validation schemas
export const projectValidationSchema = insertProjectSchema.extend({
  name: z.string().min(1, "Project name is required").max(100, "Project name is too long"),
  description: z.string().max(500, "Description is too long").optional().nullable(),
  dueDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
});

export const taskValidationSchema = insertTaskSchema.extend({
  title: z.string().min(1, "Task title is required").max(100, "Task title is too long"),
  description: z.string().max(500, "Description is too long").optional().nullable(),
  projectId: z.number().min(1, "Project is required"),
  dueDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type ProjectValidation = z.infer<typeof projectValidationSchema>;
export type TaskValidation = z.infer<typeof taskValidationSchema>;
