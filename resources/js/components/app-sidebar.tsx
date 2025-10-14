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
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
  LayoutGrid,
  List,
  Image,
  ShoppingBasket,
  Settings,
	FolderKanban,
	ShoppingCart,
	Contact,
	CircleDollarSign,
	Logs,
	SquareChartGantt,
	FolderTree,
	Network,
	User
} from 'lucide-react';
import AppLogo from './app-logo';
import { useEffect, useState } from 'react';
import axios from 'axios';

/*const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Proyectos',
        href: '/projects',
        icon: List,
    },
    {
        title: 'Banners',
        href: '/banners',
        icon: Image,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];
*/
const iconMap: Record<string, any> = {
  LayoutGrid,  List,  Image,  ShoppingBasket,  Settings,	FolderKanban,	ShoppingCart,
	Contact,	CircleDollarSign,	Logs,	SquareChartGantt,	FolderTree,	Network,	User
};

export function AppSidebar() {
	//data
	const [mainNavItems, setMainNavItems] = useState<NavItem[]>([]);

	//funcitons
	function construirMenuJerarquico(items: any[]): NavItem[] {
		const mapa: Record<number, NavItem> = {};
		const raiz: NavItem[] = [];

		items.forEach(item => {
			const nodo: NavItem = {
				title: item.nombre,
				href: item.ruta_url || '#',
				icon: iconMap[item.icono] || LayoutGrid,
				children: [],
			};
			mapa[item.menu_id] = nodo;
		});

		items.forEach(item => {
			const nodo = mapa[item.menu_id];
			if (item.padre && mapa[item.padre]) {
				mapa[item.padre].children?.push(nodo);
			} else {
				raiz.push(nodo);
			}
		});

		return raiz;
	}

	useEffect(() => {
		axios.get('/menu-usuario').then(res => {
			console.log("res.data: ", res.data)
			const jerarquico = construirMenuJerarquico(res.data);
			setMainNavItems(jerarquico);
		});
	}, []);

	return (
			<Sidebar collapsible="icon" variant="inset">
					<SidebarHeader>
							<SidebarMenu>
									<SidebarMenuItem>
											<SidebarMenuButton size="lg" asChild>
													<Link href={dashboard()} prefetch>
															<AppLogo />
													</Link>
											</SidebarMenuButton>
									</SidebarMenuItem>
							</SidebarMenu>
					</SidebarHeader>

					<SidebarContent>
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
