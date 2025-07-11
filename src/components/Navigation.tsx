import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Anchor, Menu, Ship, Users, Package, FileText, BarChart3 } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { href: '/', label: 'Home', icon: Anchor },
    { href: '/ships', label: 'Ships', icon: Ship },
    { href: '/berthing', label: 'Berthing', icon: FileText },
    { href: '/cargo', label: 'Cargo', icon: Package },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/users', label: 'Users', icon: Users },
  ];

  const NavLink = ({ href, label, icon: Icon, mobile = false }) => {
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
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" size="sm">Sign In</Button>
            <Button size="sm" className="bg-gradient-wave">Register</Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <NavLink key={item.href} {...item} mobile={true} />
                ))}
                <div className="pt-4 border-t border-border space-y-3">
                  <Button variant="ghost" className="w-full justify-start">Sign In</Button>
                  <Button className="w-full bg-gradient-wave">Register</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;