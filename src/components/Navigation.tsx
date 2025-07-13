import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Anchor, Menu, Ship, Users, Package, FileText, BarChart3, LogIn, LogOut, User } from 'lucide-react';
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

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
    auth: boolean;
  }

  const navItems: NavItem[] = [
    { href: '/', label: 'Home', icon: Anchor, auth: false },
    { href: '/ships', label: 'Ships', icon: Ship, auth: true },
    { href: '/berthing', label: 'Berthing', icon: FileText, auth: true },
    { href: '/cargo', label: 'Cargo', icon: Package, auth: true },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3, auth: true },
    { href: '/users', label: 'Users', icon: Users, auth: true },
  ].filter((item) => !item.auth || (item.auth && isAuthenticated));

  interface NavLinkProps {
    href: string;
    label: string;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
    mobile?: boolean;
  }

  const NavLink: React.FC<NavLinkProps> = ({ href, label, icon: Icon, mobile = false }) => {
    const isActive = location.pathname === href;
    const baseClasses = mobile 
      ? "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors" 
      : "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium";
    
    const activeClasses = isActive 
      ? "bg-primary text-primary-foreground" 
      : "text-foreground hover:bg-secondary";

    return (
      <Link 
        to={href} 
        className={`${baseClasses} ${activeClasses}`}
        onClick={() => mobile && setIsOpen(false)}
      >
        <Icon size={mobile ? 20 : 16} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-wave rounded-lg">
              <Anchor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">PAK</h1>
              <p className="text-xs text-muted-foreground">Port Authority Kribi</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </div>

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
                <div className="flex-1">
                  <nav className="grid gap-6 text-lg font-medium">
                    <div className="flex items-center space-x-3 mb-8">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-wave rounded-lg">
                        <Anchor className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-bold">Kribi Port</span>
                    </div>
                    {navItems.map((item) => (
                      <NavLink
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        mobile
                      />
                    ))}
                  </nav>
                </div>
                <div className="border-t pt-4">
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 px-4 py-2">
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
                        variant="ghost"
                        className="w-full justify-start"
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
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        navigate('/login');
                        setIsOpen(false);
                      }}
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;