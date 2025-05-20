import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Home, Leaf, Lightbulb, Menu, Plus, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

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
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-background">
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2">
          <Leaf className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">PlantPal</h2>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={location === item.href ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  location === item.href && 'font-semibold'
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
