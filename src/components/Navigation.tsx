import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Anchor, 
  BarChart3, 
  FileText, 
  FilePlus,
  List,
  CheckCircle,
  ClipboardCheck,
  Package, 
  Ship, 
  User, 
  Users,
  Menu,
  X as CloseIcon,
  LogIn,
  LogOut,
  Warehouse,
  Settings,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  roles?: string[]; // If undefined, the route is public
  authRequired?: boolean; // If true, requires any authenticated user
  subItems?: NavItem[]; // Sub-navigation items
}

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Define all navigation items with role-based access
  const navItems: NavItem[] = [
    // Admin - Port Management
    {
      href: '/admin/port',
      label: 'Port Management',
      icon: Anchor,
      roles: ['admin'],
      subItems: [
        {
          href: '/admin/port/docks',
          label: 'Manage Docks',
          icon: Anchor,
          roles: ['admin']
        },
        {
          href: '/admin/port/ships',
          label: 'Manage Ships',
          icon: Ship,
          roles: ['admin']
        },
        {
          href: '/admin/port/settings',
          label: 'Port Settings',
          icon: Settings,
          roles: ['admin']
        }
      ]
    },
    // Public routes
    { href: '/', label: 'Home', icon: Anchor },
    { 
      href: '/berthing/current', 
      label: 'Current Berthings', 
      icon: Anchor,
      // Public route, no auth required
    },
    
    // Maritime Agent routes
    {
      href: '/berthing/new',
      label: 'New Berthing',
      icon: FilePlus,
      roles: ['maritime_agent'],
    },
    {
      href: '/berthing/my-requests',
      label: 'My Requests',
      icon: List,
      roles: ['maritime_agent'],
    },

    // Cargo Owner routes
    {
      href: '/cargo/my-cargo',
      label: 'My Cargo',
      icon: Package,
      roles: ['cargo_owner'],
    },

    // Customs Broker routes
    {
      href: '/customs/clearance',
      label: 'Customs Clearance',
      icon: CheckCircle,
      roles: ['customs_broker'],
    },

    // Admin routes
    {
      href: '/berthing/requests',
      label: 'Berthing Requests',
      icon: ClipboardCheck,
      roles: ['admin'],
    },
    {
      href: '/admin/users',
      label: 'User Management',
      icon: Users,
      roles: ['admin'],
    },
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      roles: ['admin', 'port_authority'],
    },

    // Any authenticated user
    {
      href: '/profile',
      label: 'My Profile',
      icon: User,
      authRequired: true,
    },
  ];

  // Filter navigation items based on user role and authentication
  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items.filter((item) => {
      // If user is admin, show all items
      if (user?.role === 'admin') {
        // Still filter sub-items for admin
        if (item.subItems) {
          item.subItems = filterNavItems(item.subItems);
        }
        return true;
      }
      
      // If auth is required but user is not authenticated, hide the item
      if (item.authRequired && !isAuthenticated) return false;
      
      // If no roles specified and no auth required, show to everyone
      if (!item.roles && !item.authRequired) return true;
      
      // If no user but item requires specific roles, hide
      if (!user) return false;
      
      // Check if user has any of the required roles
      const hasRole = item.roles?.includes(user.role);
      
      // If item has sub-items, filter them too
      if (item.subItems) {
        item.subItems = filterNavItems(item.subItems);
        // If no sub-items remain after filtering, hide the parent
        return hasRole && item.subItems.length > 0;
      }
      
      return hasRole;
    });
  };
  
  const filteredNavItems = filterNavItems(navItems);

  interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }
  
  // Helper function to check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const NavLink = ({ href, children, className = '', onClick }: NavLinkProps) => {
    const isActive = location.pathname === href;
    return (
      <Link
        to={href}
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-accent text-accent-foreground' : 'text-foreground/60 hover:text-foreground hover:bg-accent/50'} ${className}`}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 relative">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-wave rounded-lg">
                <Anchor className="w-6 h-6 text-white" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-foreground">PAK</h1>
                <p className="text-xs text-muted-foreground">Port Authority Kribi</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {filteredNavItems.map((item) => (
              item.subItems ? (
                <DropdownMenu key={item.href}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="px-3 py-2 text-sm font-medium hover:bg-accent/50">
                      {item.label}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {item.subItems.map((subItem) => (
                      <DropdownMenuItem key={subItem.href} asChild>
                        <Link to={subItem.href} className="w-full">
                          <subItem.icon className="mr-2 h-4 w-4" />
                          {subItem.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <NavLink 
                  key={item.href} 
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent/50"
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </NavLink>
              )
            ))}
          </nav>

          {/* User Account */}
          <div className="hidden md:flex items-center ml-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user?.name} />
                      <AvatarFallback>
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] flex flex-col">
                  <div className="flex-1 py-4">
                    <div className="flex items-center space-x-3 mb-8 px-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-wave rounded-lg">
                        <Anchor className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-bold">Kribi Port</span>
                    </div>
                    
                    <nav className="space-y-1 px-2">
                      {filteredNavItems.map((item) => (
                        <div key={item.href}>
                          {item.subItems ? (
                            <div className="space-y-1">
                              <div className="px-3 py-2 text-sm font-medium text-gray-500">
                                {item.label}
                              </div>
                              <div className="pl-4 space-y-1">
                                {item.subItems.map((subItem) => (
                                  <Link
                                    key={subItem.href}
                                    to={subItem.href}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                      location.pathname === subItem.href 
                                        ? 'bg-accent text-accent-foreground' 
                                        : 'hover:bg-accent/50'
                                    }`}
                                    onClick={() => setIsOpen(false)}
                                  >
                                    <subItem.icon className="h-4 w-4" />
                                    {subItem.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <Link
                              to={item.href}
                              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                location.pathname === item.href 
                                  ? 'bg-accent text-accent-foreground' 
                                  : 'hover:bg-accent/50'
                              }`}
                              onClick={() => setIsOpen(false)}
                            >
                              <item.icon className="h-5 w-5" />
                              {item.label}
                            </Link>
                          )}
                        </div>
                      ))}
                    </nav>
                  </div>
                  
                  <div className="border-t p-4">
                    {isAuthenticated ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" alt={user?.name} />
                            <AvatarFallback>
                              {user?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user?.name}</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            logout();
                            setIsOpen(false);
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          className="w-full"
                          onClick={() => {
                            navigate('/login');
                            setIsOpen(false);
                          }}
                        >
                          <LogIn className="mr-2 h-4 w-4" />
                          Login
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            navigate('/signup');
                            setIsOpen(false);
                          }}
                        >
                          Sign Up
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background shadow-lg z-50 p-4 space-y-1 border-t border-border">
          <ul>
            {filteredNavItems.map((item) => (
              <li key={item.href}>
                {item.subItems ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      {item.label}
                    </div>
                    <div className="pl-4 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          to={subItem.href}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-900 transition-all hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-700 ${
                            location.pathname === subItem.href ? 'bg-gray-100 dark:bg-gray-700' : ''
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <subItem.icon className="h-4 w-4" />
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-700 ${
                      location.pathname === item.href ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          {isAuthenticated && (
            <div className="pt-2 mt-2 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navigation;