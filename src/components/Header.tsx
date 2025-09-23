import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Search, Bell, User } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const Header = () => {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 shadow-soft">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="hidden md:flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs, candidates..."
            className="w-80 bg-background/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full" />
        </Button>
        
        <Button variant="ghost" size="sm">
          <User className="h-4 w-4" />
          <span className="ml-2 hidden sm:inline">Admin</span>
        </Button>
      </div>
    </header>
  );
};