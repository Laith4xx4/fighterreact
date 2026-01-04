import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Dumbbell,
  Star,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  Home,
  BookOpen,
  ClipboardList,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const memberNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/member', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'My Bookings', href: '/member/bookings', icon: <Calendar className="h-5 w-5" /> },
  { label: 'Browse Sessions', href: '/member/sessions', icon: <Dumbbell className="h-5 w-5" /> },
  { label: 'My Progress', href: '/member/progress', icon: <TrendingUp className="h-5 w-5" /> },
  { label: 'My Reviews', href: '/member/reviews', icon: <Star className="h-5 w-5" /> },
];

const coachNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/coach', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'My Sessions', href: '/coach/sessions', icon: <Calendar className="h-5 w-5" /> },
  { label: 'Attendance', href: '/coach/attendance', icon: <UserCheck className="h-5 w-5" /> },
  { label: 'My Reviews', href: '/coach/reviews', icon: <Star className="h-5 w-5" /> },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Members', href: '/admin/members', icon: <Users className="h-5 w-5" /> },
  { label: 'Coaches', href: '/admin/coaches', icon: <Dumbbell className="h-5 w-5" /> },
  { label: 'Sessions', href: '/admin/sessions', icon: <Calendar className="h-5 w-5" /> },
  { label: 'Class Types', href: '/admin/class-types', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'Bookings', href: '/admin/bookings', icon: <ClipboardList className="h-5 w-5" /> },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'Member' | 'Coach' | 'Admin';
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = role === 'Admin' ? adminNavItems : role === 'Coach' ? coachNavItems : memberNavItems;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn(
      "flex flex-col h-full bg-card border-r border-border",
      mobile ? "w-full" : "w-64"
    )}>
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <img src="/savagelogo.ico" alt="The Savage Logo" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold text-foreground">The Savage</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => mobile && setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
              {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Back to Home */}
      <div className="p-4 border-t border-border">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Home className="h-5 w-5" />
          <span className="font-medium">Back to Home</span>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 fixed inset-y-0 left-0 z-50">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            {/* Mobile Menu */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <Sidebar mobile />
              </SheetContent>
            </Sheet>

            {/* Page Title */}
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-foreground">
                {role} Portal
              </h1>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 px-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profilePictureUrl} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user?.fullName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-foreground">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user?.role}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
