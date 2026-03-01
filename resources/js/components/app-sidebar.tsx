import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
//import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import AppLogo from './app-logo';
import { useMenu } from '@/context/menuContext';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export function AppSidebar() {
	//data
	const mainNavItems = useMenu();

  const sidebarRef = useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = useState(0);

	useLayoutEffect(() => {
		const el = sidebarRef.current;
		console.log("el: ",el)
		if (!el) return;
		const saved = localStorage.getItem("sidebar-scroll");
		console.log("saved: ", saved)
		if (saved) el.scrollTop = parseInt(saved, 10);
	}, []);

	return (
			<Sidebar collapsible="icon" variant="inset">
					<SidebarHeader>
							<SidebarMenu>
									<SidebarMenuItem>
											<SidebarMenuButton size="lg" asChild>
													<Link href={/*dashboard()*/'/inicio'} prefetch
													  preserveState preserveScroll>
															<AppLogo />
													</Link>
											</SidebarMenuButton>
									</SidebarMenuItem>
							</SidebarMenu>
					</SidebarHeader>

					<SidebarContent
						ref={sidebarRef}
						onScroll={(e) => {
							const pos = (e.target as HTMLDivElement).scrollTop;
							setScrollPos(pos);
							localStorage.setItem("sidebar-scroll", pos.toString());
						}}
					>
							{mainNavItems.length === 0 ? 
									( <div className="p-4 text-sm text-muted">No hay opciones disponibles</div> ) 
									: ( <NavMain items={mainNavItems} />)
							}
					</SidebarContent>

					<SidebarFooter>
							{/*<NavFooter items={footerNavItems} className="mt-auto" />*/}
							<NavUser />
					</SidebarFooter>
			</Sidebar>
	);
}
