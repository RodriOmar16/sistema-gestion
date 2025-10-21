import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,  
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarMenuAction
} from '@/components/ui/sidebar';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
  const page = usePage<{ url: string }>();

  function renderItem(item: NavItem) {
    const isActive = page.url.startsWith(
      typeof item.href === 'string'? 
      item.href : (typeof item.href === 'object' && 'url' in item.href ? 
                   item.href.url : '')
    );
    
    const [isOpen, setIsOpen] = useState(true); // por grupo
    const hasChildren = item.children && item.children.length > 0;

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={{ children: item.title }}
        >
          <Link href={item.href} prefetch preserveState preserveScroll>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
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
                        href={typeof child.href === 'string' ? child.href : '#'}
                        isActive={typeof child.href === 'string' && page.url.startsWith(child.href)}
                      >
                        {child.icon && <child.icon />}
                        <span>{child.title}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              )}
            </>
          )
        }

        {/* Renderizar hijos si existen 
        {item.children && item.children.length > 0 && (
          <SidebarMenu className="ml-4">
            {item.children.map(renderItem)}
          </SidebarMenu>
        )}*/}
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