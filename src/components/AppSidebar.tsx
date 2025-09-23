import { NavLink, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  Home,
  Building2
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const navigation = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'Jobs', url: '/jobs', icon: Briefcase },
  { title: 'Candidates', url: '/candidates', icon: Users },
  { title: 'Assessments', url: '/assessments', icon: ClipboardList },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
];

const bottomNavigation = [
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const baseClasses = "w-full justify-start transition-smooth hover:bg-secondary/80";
    return isActive(path) 
      ? `${baseClasses} bg-primary text-primary-foreground shadow-soft` 
      : `${baseClasses} text-muted-foreground hover:text-foreground`;
  };

  return (
    <Sidebar className={`border-r border-border bg-card/30 backdrop-blur-sm ${collapsed ? 'w-14' : 'w-64'}`}>
      <SidebarContent className="p-4">
        {/* Logo */}
        <div className="mb-8 px-2">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
                TalentFlow
              </span>
            </div>
          ) : (
            <Building2 className="h-8 w-8 text-primary mx-auto" />
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-0">
                    <NavLink
                      to={item.url}
                      className={getNavClasses(item.url)}
                    >
                      <item.icon className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} />
                      {!collapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
                      {isActive(item.url) && !collapsed && (
                        <div className="ml-auto w-1 h-6 bg-primary-foreground/30 rounded-full" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Navigation */}
        <div className="mt-auto">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {bottomNavigation.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="p-0">
                      <NavLink
                        to={item.url}
                        className={getNavClasses(item.url)}
                      >
                        <item.icon className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} />
                        {!collapsed && (
                          <span className="font-medium">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}