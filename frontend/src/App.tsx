import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "./components/Login";
import TaskManagement from "./components/TaskManagement";
import UserManagement from "./components/UserManagement";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Toaster } from "./components/ui/toaster";
import { Auth } from "./store/auth";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

function App() {
  const { isAdmin } = Auth;
  const token = Auth.getToken();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {token ? (
          <div className="flex min-h-screen">
            <Sidebar
              isCollapsed={isSidebarCollapsed}
              toggleSidebar={toggleSidebar}
            />
            <div className="flex-1 flex flex-col">
              <Navbar toggleSidebar={toggleSidebar} />
              <main className={`flex-1 p-4  transition-all duration-300`}>
                <Routes>
                  <Route path="/tasks" element={<TaskManagement />} />
                  <Route
                    path="/users"
                    element={
                      isAdmin() ? <UserManagement /> : <Navigate to="/tasks" />
                    }
                  />
                  <Route
                    path="/settings"
                    element={<div>Settings Page (Placeholder)</div>}
                  />
                  <Route path="*" element={<Navigate to="/tasks" />} />
                </Routes>
              </main>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
