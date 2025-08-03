import { NavLink } from 'react-router-dom'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { ChevronLeft, ChevronRight, Users, List } from 'lucide-react'
import { useAuthStore } from '../store/auth'

interface SidebarProps {
  isCollapsed: boolean
  toggleSidebar: () => void
}

export default function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const { isAdmin } = useAuthStore()

  return (
    <Card className={`bg-white border-r border-gray-200 h-screen ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 flex flex-col`}>
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && <h2 className="text-lg font-semibold text-gray-900">Task Manager</h2>}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/tasks"
              className={({ isActive }) =>
                `flex items-center gap-2 p-2 rounded-md text-sm font-medium ${
                  isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <List className="h-5 w-5" />
              {!isCollapsed && <span>Tasks</span>}
            </NavLink>
          </li>
          {isAdmin && (
            <li>
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `flex items-center gap-2 p-2 rounded-md text-sm font-medium ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Users className="h-5 w-5" />
                {!isCollapsed && <span>Users</span>}
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </Card>
  )
}