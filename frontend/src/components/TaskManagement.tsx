import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useToast } from "./ui/use-toast";
import { Auth } from "../store/auth";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  Task,
  TaskInput,
} from "../services/tasks";
import { getUsers } from "../services/users";
import { Pencil, Trash2 } from "lucide-react";
import ReconnectingWebSocket from "reconnecting-websocket";

export default function TaskManagement() {
  const [newTask, setNewTask] = useState<TaskInput>({
    title: "",
    description: "",
    due_date: "",
    priority: "MEDIUM",
    assigned_to_id: null,
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    priority: "all",
    status: "all",
    search: "",
  });
  const token = Auth.getToken();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
    enabled: !!token,
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: !!token,
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setNewTask({
        title: "",
        description: "",
        due_date: "",
        priority: "MEDIUM",
        assigned_to_id: null,
      });
      toast("Task created successfully", { title: "Success" });
    },
    onError: () => {
      toast("Failed to create task", {
        title: "Error",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, taskData }: { id: number; taskData: TaskInput }) =>
      updateTask(id, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setEditingTask(null);
      toast("Task updated successfully", { title: "Success" });
    },
    onError: () => {
      toast("Failed to update task", {
        title: "Error",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast("Task deleted successfully", { title: "Success" });
    },
    onError: () => {
      toast("Failed to delete task", {
        title: "Error",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const ws = new ReconnectingWebSocket(`ws://backend:8000/ws/tasks/`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "task_update") {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        toast(`Task ${data.task_id} was ${data.action}`, {
          title: `Task ${data.action}`,
        });
      }
    };
    return () => ws.close();
  }, [queryClient, toast]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate(newTask);
  };

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      updateTaskMutation.mutate({
        id: editingTask.id,
        taskData: {
          title: editingTask.title,
          description: editingTask.description,
          due_date: editingTask.due_date,
          priority: editingTask.priority,
          status: editingTask.status,
          assigned_to_id: editingTask.assigned_to?.id || null,
        },
      });
    }
  };

  const filteredTasks = tasks?.filter(
    (task) =>
      task.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      (filters.priority === "all" || task.priority === filters.priority) &&
      (filters.status === "all" || task.status === filters.status)
  );

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Input
                placeholder="Title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                required
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
                required
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
              <Select
                value={newTask.assigned_to_id?.toString() || "none"}
                onValueChange={(value) =>
                  setNewTask({
                    ...newTask,
                    assigned_to_id: value === "none" ? null : parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign to" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={createTaskMutation.isPending}>
              Create Task
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
            <Select
              value={filters.priority}
              onValueChange={(value) =>
                setFilters({ ...filters, priority: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["tasks"] })
              }
            >
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
            <p>Loading tasks...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks?.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>
                      {new Date(task.due_date).toLocaleString()}
                    </TableCell>
                    <TableCell>{task.priority}</TableCell>
                    <TableCell>{task.status}</TableCell>
                    <TableCell>
                      {task.assigned_to?.username || "Unassigned"}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingTask(task)}
                          >
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Task</DialogTitle>
                          </DialogHeader>
                          {editingTask && (
                            <form
                              onSubmit={handleUpdateTask}
                              className="space-y-4"
                            >
                              <Input
                                placeholder="Title"
                                value={editingTask.title}
                                onChange={(e) =>
                                  setEditingTask({
                                    ...editingTask,
                                    title: e.target.value,
                                  })
                                }
                                required
                              />
                              <Input
                                placeholder="Description"
                                value={editingTask.description}
                                onChange={(e) =>
                                  setEditingTask({
                                    ...editingTask,
                                    description: e.target.value,
                                  })
                                }
                              />
                              <Input
                                type="datetime-local"
                                value={editingTask.due_date}
                                onChange={(e) =>
                                  setEditingTask({
                                    ...editingTask,
                                    due_date: e.target.value,
                                  })
                                }
                                required
                              />
                              <Select
                                value={editingTask.priority}
                                onValueChange={(value) =>
                                  setEditingTask({
                                    ...editingTask,
                                    priority: value,
                                  })
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
                              <Select
                                value={editingTask.status}
                                onValueChange={(value) =>
                                  setEditingTask({
                                    ...editingTask,
                                    status: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PENDING">
                                    Pending
                                  </SelectItem>
                                  <SelectItem value="IN_PROGRESS">
                                    In Progress
                                  </SelectItem>
                                  <SelectItem value="COMPLETED">
                                    Completed
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <Select
                                value={
                                  editingTask.assigned_to?.id?.toString() ||
                                  "none"
                                }
                                onValueChange={(value) =>
                                  setEditingTask({
                                    ...editingTask,
                                    assigned_to:
                                      value === "none"
                                        ? null
                                        : { id: parseInt(value), username: "" },
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Assign to" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">
                                    Unassigned
                                  </SelectItem>
                                  {users?.map((user) => (
                                    <SelectItem
                                      key={user.id}
                                      value={user.id.toString()}
                                    >
                                      {user.username}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                type="submit"
                                disabled={updateTaskMutation.isPending}
                              >
                                Update Task
                              </Button>
                            </form>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="ml-2"
                        onClick={() => deleteTaskMutation.mutate(task.id)}
                        disabled={deleteTaskMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
