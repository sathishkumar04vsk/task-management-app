import { useState } from "react";
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
import { Auth } from "../store/auth";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  User,
} from "../services/users";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function UserManagement() {
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role_id: "1",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const token = Auth.getToken;

  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: !!token,
  });

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const api = (await import("../services/api")).default();
      const response = await api.get("/roles/");
      return response.data;
    },
    enabled: !!token,
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setNewUser({ username: "", email: "", password: "", role_id: "1" });
      toast.success("User created successfully", {
        description: "User created successfully",
      });
    },
    onError: () => {
      toast.error("Failed to create user", {
        description: "Failed to create user",
        action: {
          label: "undo",
          onClick: () => console.log("undo"),
        },
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: User }) =>
      updateUser(id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
      toast.success("User updated successfully", {
        description: "User updated successfully",
      });
    },
    onError: () => {
      toast.error("Failed to update user", {
        description: "Failed to update user",
        action: {
          label: "undo",
          onClick: () => console.log("undo"),
        },
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully", {
        description: "User deleted successfully",
      });
    },
    onError: () => {
      toast.error("Failed to delete user", {
        description: "Failed to delete user",
        action: {
          label: "undo",
          onClick: () => console.log("undo"),
        },
      });
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate({
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      role_id: newUser.role_id,
    });
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id || 0,
        userData: {
          username: editingUser.username,
          email: editingUser.email,
          password: editingUser.password || "",
          role_id: editingUser.role?.id,
        },
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Username"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
                required
              />
              <Input
                placeholder="Email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                required
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Select
                value={newUser.role_id}
                onValueChange={(value) =>
                  setNewUser({ ...newUser, role_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((role: { id: number; name: string }) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={createUserMutation.isPending}>
              Create User
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading users...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.role?.name
                        ? user.role.name.charAt(0).toUpperCase() +
                          user.role.name.slice(1)
                        : "No Role"}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                          </Button>
                        </DialogTrigger>
                        {editingUser && (
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit User</DialogTitle>
                            </DialogHeader>

                            <form
                              onSubmit={handleUpdateUser}
                              className="space-y-4"
                            >
                              <Input
                                placeholder="Username"
                                value={editingUser.username}
                                onChange={(e) =>
                                  setEditingUser({
                                    ...editingUser,
                                    username: e.target.value,
                                  })
                                }
                                required
                              />
                              <Input
                                placeholder="Email"
                                type="email"
                                value={editingUser.email}
                                onChange={(e) =>
                                  setEditingUser({
                                    ...editingUser,
                                    email: e.target.value,
                                  })
                                }
                                required
                              />
                              <Input
                                placeholder="New Password (optional)"
                                type="password"
                                value={editingUser.password || ""}
                                onChange={(e) =>
                                  setEditingUser({
                                    ...editingUser,
                                    password: e.target.value,
                                  })
                                }
                              />
                              <Select
                                value={editingUser.role?.id?.toString() || ""}
                                onValueChange={(value) =>
                                  setEditingUser({
                                    ...editingUser,
                                    role: {
                                      id: value,
                                      name:
                                        roles?.find(
                                          (r: { id: number; name: string }) =>
                                            r.id === parseInt(value)
                                        )?.name || "",
                                    },
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {roles?.map(
                                    (role: { id: number; name: string }) => (
                                      <SelectItem
                                        key={role.id}
                                        value={role.id.toString()}
                                      >
                                        {role.name.charAt(0).toUpperCase() +
                                          role.name.slice(1)}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                              <Button
                                type="submit"
                                disabled={updateUserMutation.isPending}
                              >
                                Update User
                              </Button>
                            </form>
                          </DialogContent>
                        )}
                      </Dialog>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="ml-2"
                        onClick={() => deleteUserMutation.mutate(user?.id || 0)}
                        disabled={deleteUserMutation.isPending}
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
