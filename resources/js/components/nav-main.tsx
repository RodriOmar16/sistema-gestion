import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuAction,
} from '@/components/ui/sidebar';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
  const page = usePage<{ url: string }>();

  function renderItem(item: NavItem) {
    const isActive = page.url.startsWith(
      typeof item.href === 'string'
        ? item.href
        : (typeof item.href === 'object' && 'url' in item.href ? item.href.url : '')
    );

    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <SidebarMenuItem key={item.title}>
        {/* Botón principal con Link de Inertia */}
        <SidebarMenuButton
          asChild
          isActive={isActive}
          className={isActive ? "font-bold bg-gray-200 shadow-md" : ""}
          tooltip={{ children: item.title }}
        >
          <Link href={item.href} prefetch preserveState preserveScroll>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>

        {/* Submenús */}
        {hasChildren && (
          <>
            <SidebarMenuAction onClick={() => setIsOpen(prev => !prev)}>
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </SidebarMenuAction>
            {isOpen && (
              <SidebarMenuSub>
                {item.children?.map((child) => (
                  <SidebarMenuSubItem key={child.title}>
                    <SidebarMenuSubButton 
                      asChild
                      isActive={typeof child.href === 'string' && page.url.startsWith(child.href)}
                      className={(typeof child.href === 'string' && page.url.startsWith(child.href)) ? "font-bold bg-gray-200 shadow-md" : ""}
                    >
                      <Link href={child.href} prefetch preserveState preserveScroll>
                        {child.icon && <child.icon />}
                        <span>{child.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            )}
          </>
        )}
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupLabel>Menú</SidebarGroupLabel>
      <SidebarMenu>
        {items.map(renderItem)}
      </SidebarMenu>
    </SidebarGroup>
  );
}
