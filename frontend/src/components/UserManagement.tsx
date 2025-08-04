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
import { useToast } from "./ui/use-toast";
import { Auth } from "../store/auth";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  User,
  UserInput,
} from "../services/users";
import { Pencil, Trash2 } from "lucide-react";

export default function UserManagement() {
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    is_staff: "false",
  });
  const [editingUser, setEditingUser] = useState<UserInput | null>(null);
  const token = Auth.getToken;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: !!token,
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setNewUser({ username: "", email: "", password: "", is_staff: "false" });
      toast("User created successfully", { title: "Success" });
    },
    onError: () => {
      toast("Failed to create user", {
        title: "Error",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: UserInput }) =>
      updateUser(id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
      toast("User updated successfully", { title: "Success" });
    },
    onError: () => {
      toast("Failed to update user", {
        title: "Error",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast("User deleted successfully", { title: "Success" });
    },
    onError: () => {
      toast("Failed to delete user", {
        title: "Error",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate({
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      is_staff: newUser.is_staff === "true",
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
          is_staff: editingUser.is_staff,
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
              <Input
                placeholder="Password"
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                required
              />
              {newUser?.is_staff && (
                <Select
                  value={newUser.is_staff}
                  onValueChange={(value) =>
                    setNewUser({ ...newUser, is_staff: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Regular User</SelectItem>
                    <SelectItem value="true">Admin</SelectItem>
                  </SelectContent>
                </Select>
              )}
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
                      {user.is_staff ? "Admin" : "Regular User"}
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
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                          </DialogHeader>
                          {editingUser && (
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
                                value={editingUser?.password || ""}
                                onChange={(e) =>
                                  setEditingUser({
                                    ...editingUser,
                                    password: e.target.value,
                                  })
                                }
                              />
                              <Select
                                value={editingUser.is_staff.toString()}
                                onValueChange={(value) =>
                                  setEditingUser({
                                    ...editingUser,
                                    is_staff: value === "true",
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="false">
                                    Regular User
                                  </SelectItem>
                                  <SelectItem value="true">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                type="submit"
                                disabled={updateUserMutation.isPending}
                              >
                                Update User
                              </Button>
                            </form>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="ml-2"
                        onClick={() => deleteUserMutation.mutate(user.id)}
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
