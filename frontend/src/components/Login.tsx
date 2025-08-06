import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { useToast } from "./ui/use-toast";
import { Auth } from "../store/auth";
import { login, getCurrentUser } from "../services/auth";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const { setToken, setUsername, setRole } = Auth;
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { access, refresh } = await login(username, password);
      setToken(access, refresh);
      setUsername(username);
      const user = await getCurrentUser();

      console.log(user);
      setRole(user?.role?.name);

      toast("Logged in successfully", {
        success: { message: "Logged in successfully" },
      });
      setTimeout(
        () =>
          (window.location.href =
            user.role?.name === "admin" ? "/users" : "/tasks"),
        1000
      );
    } catch (error) {
      console.error("Login failed:", error);
      toast("Invalid credentials", {
        error: { message: "", variant: "destructive" },
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Task Manager</CardTitle>
          <CardDescription>Sign in to manage your tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
