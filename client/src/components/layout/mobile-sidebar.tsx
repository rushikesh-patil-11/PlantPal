import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Home, Leaf, Lightbulb, Menu, Settings } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    name: 'My Plants',
    href: '/plants',
    icon: Leaf,
  },
  {
    name: 'AI Recommendations',
    href: '/ai-recommendations',
    icon: Lightbulb,
  },
  // Add other navigation items here if needed
];

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const [location] = useLocation();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0 pt-8 w-72 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center space-x-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">PlantPal</span>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} onClick={onClose}>
                <Button
                  variant={location === item.href ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start text-base py-3 h-auto',
                    location === item.href && 'font-semibold'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>
        </ScrollArea>
        {/* Optional: Footer or user info at the bottom of mobile sidebar */}
        {/* <div className="p-4 border-t mt-auto">
          <Button variant="outline" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div> */}
      </SheetContent>
    </Sheet>
  );
}
