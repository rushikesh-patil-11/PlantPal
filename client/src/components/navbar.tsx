import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  Leaf, 
  Menu, 
  Bell, 
  Calendar, 
  Home, 
  FlowerIcon, 
  Lightbulb, 
  LogOut,
  User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Reminder } from "@shared/schema";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Get upcoming reminders (for notification badge)
  const { data: reminders } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders/upcoming"],
  });

  const dueReminders = reminders?.filter(r => !r.completed) || [];

  // Check if user has scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const firstName = user?.firstName || user?.username?.split(" ")[0] || "";
  const initials = firstName.charAt(0).toUpperCase() + (user?.lastName ? user.lastName.charAt(0).toUpperCase() : "");

  const navLinks = [
    { href: "/", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { href: "/plants", label: "My Plants", icon: <FlowerIcon className="h-5 w-5" /> },
    { href: "/calendar", label: "Calendar", icon: <Calendar className="h-5 w-5" /> },
    { href: "/ai-recommendations", label: "AI Recommendations", icon: <Lightbulb className="h-5 w-5" /> }
  ];

  return (
    <nav className={`bg-white shadow-sm sticky top-0 z-50 transition-shadow ${scrolled ? 'shadow-md' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center text-primary">
                <Leaf className="text-primary text-3xl mr-2" />
                <span className="font-nunito font-bold text-primary text-xl">PlantPal</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a className={`
                    ${location === link.href 
                      ? 'border-primary text-foreground' 
                      : 'border-transparent text-muted-foreground hover:border-secondary hover:text-foreground'} 
                    border-b-2 font-nunito font-medium px-1 pt-1 text-sm inline-flex items-center transition-colors
                  `}>
                    {link.label}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <div className="relative mr-4">
              <Link href="/calendar">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative text-muted-foreground hover:text-foreground"
                >
                  <Bell className="h-5 w-5" />
                  {dueReminders.length > 0 && (
                    <span className="notification-dot" />
                  )}
                </Button>
              </Link>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.firstName || user?.username}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <div className="flex w-full items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <div className="flex w-full items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      Settings
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logoutMutation.mutate()}
                  className="text-red-500 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden ml-3">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col h-full pt-6">
                    <div className="flex items-center mb-8">
                      <Leaf className="text-primary text-3xl mr-2" />
                      <span className="font-nunito font-bold text-primary text-xl">PlantPal</span>
                    </div>
                    <nav className="flex flex-col gap-4">
                      {navLinks.map((link) => (
                        <Link 
                          key={link.href} 
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div 
                            className={`
                              flex items-center py-2 px-3 rounded-md
                              ${location === link.href 
                                ? 'bg-primary/10 text-primary' 
                                : 'text-foreground hover:bg-muted/60'}
                            `}
                          >
                            {link.icon}
                            <span className="ml-3 font-medium">{link.label}</span>
                            {link.href === '/calendar' && dueReminders.length > 0 && (
                              <Badge variant="default" className="ml-auto">
                                {dueReminders.length}
                              </Badge>
                            )}
                          </div>
                        </Link>
                      ))}
                    </nav>
                    <div className="mt-auto pb-6">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                          logoutMutation.mutate();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
