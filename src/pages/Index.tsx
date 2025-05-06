
import { useState, useEffect } from "react";
import { Check, Plus, Trash2, LogOut, Filter, Pencil, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getTasks, createTask, updateTask, deleteTask, Task } from "@/services/taskService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PriorityBadge from "@/components/PriorityBadge";
import CategoryBadge from "@/components/CategoryBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const Index = () => {
  const [newTask, setNewTask] = useState("");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [taskCategory, setTaskCategory] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editPriority, setEditPriority] = useState<"low" | "medium" | "high">("medium");
  const [editCategory, setEditCategory] = useState<string>("");
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  // Get unique categories for filter dropdown
  const uniqueCategories = Array.from(new Set(tasks.map(task => task.category).filter(Boolean)));

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: ({ title, priority, category }: { 
      title: string; 
      priority: "low" | "medium" | "high";
      category: string | null;
    }) => 
      createTask(title, priority, category ? category : null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task added successfully");
    },
    onError: (error) => {
      console.error("Error adding task:", error);
      toast.error("Failed to add task");
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { 
      id: string; 
      updates: { 
        completed?: boolean; 
        title?: string; 
        priority?: "low" | "medium" | "high";
        category?: string | null;
      } 
    }) => 
      updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    },
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTask.trim()) {
      toast.error("Task cannot be empty");
      return;
    }
    
    createTaskMutation.mutate({ 
      title: newTask.trim(),
      priority: taskPriority,
      category: taskCategory.trim() || null
    });
    
    setNewTask("");
    setTaskCategory("");
  };

  const handleToggleTask = (id: string, completed: boolean) => {
    updateTaskMutation.mutate({ id, updates: { completed: !completed } });
  };

  const handleDeleteTask = (id: string) => {
    deleteTaskMutation.mutate(id);
  };

  const openEditDialog = (task: Task) => {
    setEditTask(task);
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditCategory(task.category || "");
  };

  const handleUpdateTask = () => {
    if (editTask) {
      const trimmedTitle = editTitle.trim();
      
      if (!trimmedTitle) {
        toast.error("Task name cannot be empty");
        return;
      }
      
      updateTaskMutation.mutate({ 
        id: editTask.id, 
        updates: { 
          title: trimmedTitle,
          priority: editPriority,
          category: editCategory.trim() || null
        } 
      });
      
      setEditTask(null);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    // Status filter (all, active, completed)
    const statusMatch = 
      filter === "all" ? true : 
      filter === "active" ? !task.completed : 
      task.completed;
      
    // Priority filter
    const priorityMatch = 
      priorityFilter === "all" ? true : 
      task.priority === priorityFilter;
    
    // Category filter
    const categoryMatch = 
      categoryFilter === "all" ? true :
      task.category === categoryFilter;
      
    return statusMatch && priorityMatch && categoryMatch;
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-4">
          <h2 className="text-lg font-semibold text-red-600">Error loading tasks</h2>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="shadow-lg">
          <CardHeader className="bg-primary text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">TaskHiveMind</CardTitle>
              {user && (
                <Button variant="ghost" onClick={signOut} className="text-white hover:bg-primary-dark">
                  <LogOut className="mr-2" size={18} />
                  Logout
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleAddTask} className="flex flex-col gap-3 mb-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a new task..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={createTaskMutation.isPending}>
                  <Plus className="mr-2" size={18} />
                  Add Task
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 w-16">Priority:</span>
                  <Select
                    value={taskPriority}
                    onValueChange={(value: "low" | "medium" | "high") => setTaskPriority(value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 w-16">Category:</span>
                  <Input
                    placeholder="Add category (optional)"
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </form>

            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  onClick={() => setFilter("all")}
                  size="sm"
                  className={filter === "all" ? "border-2 border-primary" : ""}
                >
                  All
                </Button>
                <Button
                  variant={filter === "active" ? "default" : "outline"}
                  onClick={() => setFilter("active")}
                  size="sm"
                  className={filter === "active" ? "border-2 border-primary" : ""}
                >
                  Active
                </Button>
                <Button
                  variant={filter === "completed" ? "default" : "outline"}
                  onClick={() => setFilter("completed")}
                  size="sm"
                  className={filter === "completed" ? "border-2 border-primary" : ""}
                >
                  Completed
                </Button>
              </div>

              <div className="flex items-center gap-2 md:ml-auto">
                <span className="text-sm font-medium text-gray-700">Priority:</span>
                <Button
                  variant={priorityFilter === "all" ? "default" : "outline"}
                  onClick={() => setPriorityFilter("all")}
                  size="sm"
                  className={priorityFilter === "all" ? "border-2 border-primary" : ""}
                >
                  All
                </Button>
                <Button
                  variant={priorityFilter === "high" ? "default" : "outline"}
                  onClick={() => setPriorityFilter("high")}
                  size="sm"
                  className={`${priorityFilter === "high" ? "border-2 border-primary" : ""} bg-red-500 hover:bg-red-600 text-white`}
                >
                  High
                </Button>
                <Button
                  variant={priorityFilter === "medium" ? "default" : "outline"}
                  onClick={() => setPriorityFilter("medium")}
                  size="sm"
                  className={`${priorityFilter === "medium" ? "border-2 border-primary" : ""} bg-orange-400 hover:bg-orange-500 text-white`}
                >
                  Medium
                </Button>
                <Button
                  variant={priorityFilter === "low" ? "default" : "outline"}
                  onClick={() => setPriorityFilter("low")}
                  size="sm"
                  className={`${priorityFilter === "low" ? "border-2 border-primary" : ""} bg-green-500 hover:bg-green-600 text-white`}
                >
                  Low
                </Button>
              </div>
            </div>
            
            {/* Category filter */}
            {uniqueCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 items-center">
                <span className="text-sm font-medium text-gray-700">Category:</span>
                <Button
                  variant={categoryFilter === "all" ? "default" : "outline"}
                  onClick={() => setCategoryFilter("all")}
                  size="sm"
                  className={categoryFilter === "all" ? "border-2 border-primary" : ""}
                >
                  All
                </Button>
                {uniqueCategories.map((category) => (
                  <Button
                    key={category}
                    variant={categoryFilter === category ? "default" : "outline"}
                    onClick={() => setCategoryFilter(category || "all")}
                    size="sm"
                    className={`${
                      categoryFilter === category ? "border-2 border-primary" : ""
                    } bg-blue-500 hover:bg-blue-600 text-white`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading tasks...</p>
                </div>
              ) : filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                        id={`task-${task.id}`}
                      />
                      <label
                        htmlFor={`task-${task.id}`}
                        className={`cursor-pointer ${
                          task.completed ? "line-through text-gray-400" : ""
                        }`}
                      >
                        {task.title}
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {task.category && <CategoryBadge category={task.category} />}
                      <PriorityBadge priority={task.priority as "low" | "medium" | "high"} className="ml-1" />
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(task as Task)}
                        className="h-8 w-8"
                        title="Edit task"
                      >
                        <Pencil className="h-4 w-4 text-gray-500 hover:text-blue-500" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={deleteTaskMutation.isPending}
                        className="h-8 w-8"
                        title="Delete task"
                      >
                        <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No tasks found. Add a new task to get started!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={editTask !== null} onOpenChange={(open) => !open && setEditTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Task Name</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Task name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <Select
                  value={editPriority}
                  onValueChange={(value: "low" | "medium" | "high") => 
                    setEditPriority(value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Input
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  placeholder="Category (optional)"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTask(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTask}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
