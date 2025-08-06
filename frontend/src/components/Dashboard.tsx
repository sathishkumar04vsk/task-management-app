import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Auth } from "../store/auth";
import ReconnectingWebSocket from "reconnecting-websocket";
import { toast } from "sonner";

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  status: string;
  assigned_to: { id: number; username: string } | null;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "MEDIUM",
  });
  const [filters, setFilters] = useState({
    priority: "",
    status: "",
    search: "",
  });
  const token = Auth.getToken();

  const { data: fetchedTasks, refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/tasks/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (fetchedTasks) setTasks(fetchedTasks);
  }, [fetchedTasks]);

  useEffect(() => {
    const ws = new ReconnectingWebSocket(`ws://localhost:8000/ws/tasks/`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "task_update") {
        refetch();
        toast.success(`Task ${data.task_id} was ${data.action}`, {
          description: `Task ${data.task_id} was ${data.action}`,
          action: {
            label: "undo",
            onClick: () => console.log("undo"),
          },
        });
      }
    };
    return () => ws.close();
  }, [refetch]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/tasks/`, newTask, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refetch();
      setNewTask({
        title: "",
        description: "",
        due_date: "",
        priority: "MEDIUM",
      });
      toast.success("Task created successfully", {
        description: "Task created successfully",
        action: {
          label: "undo",
          onClick: () => console.log("undo"),
        },
      });
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task", {
        description: "Failed to create task",
        action: {
          label: "undo",
          onClick: () => console.log("undo"),
        },
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <Input
              placeholder="Title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
            />
            <Input
              placeholder="Description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />
            <Input
              type="datetime-local"
              value={newTask.due_date}
              onChange={(e) =>
                setNewTask({ ...newTask, due_date: e.target.value })
              }
            />
            <Select
              value={newTask.priority}
              onValueChange={(value) =>
                setNewTask({ ...newTask, priority: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Create Task</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <Select
          value={filters.priority}
          onValueChange={(value) => setFilters({ ...filters, priority: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Button type="button" onClick={() => refetch()}>
          Apply Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks
          .filter(
            (task) =>
              task.title.toLowerCase().includes(filters.search.toLowerCase()) &&
              (!filters.priority || task.priority === filters.priority) &&
              (!filters.status || task.status === filters.status)
          )
          .map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <CardTitle>{task.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{task.description}</p>
                <p>Due: {new Date(task.due_date).toLocaleString()}</p>
                <p>Priority: {task.priority}</p>
                <p>Status: {task.status}</p>
                <p>Assigned to: {task.assigned_to?.username || "Unassigned"}</p>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
