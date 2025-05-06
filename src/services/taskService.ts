
import { supabase } from "@/integrations/supabase/client";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  created_at: Date;
  priority: "low" | "medium" | "high";
  category: string | null;
}

export const getTasks = async () => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
  
  // Convert string dates to Date objects
  const tasksWithDates = data?.map(task => ({
    ...task,
    created_at: new Date(task.created_at)
  })) || [];
  
  return tasksWithDates;
};

export const createTask = async (title: string, priority: "low" | "medium" | "high" = "medium", category: string | null = null) => {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({ 
      title,
      user_id: user.id,
      priority,
      category
    })
    .select("*")
    .single();
  
  if (error) {
    console.error("Error creating task:", error);
    throw error;
  }
  
  return {
    ...data,
    created_at: new Date(data.created_at)
  };
};

export const updateTask = async (id: string, updates: { 
  completed?: boolean, 
  title?: string, 
  priority?: "low" | "medium" | "high",
  category?: string | null
}) => {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();
  
  if (error) {
    console.error("Error updating task:", error);
    throw error;
  }
  
  return {
    ...data,
    created_at: new Date(data.created_at)
  };
};

export const deleteTask = async (id: string) => {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
  
  return true;
};
