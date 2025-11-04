import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { type NavItem } from '@/types';
import {
  LayoutGrid,  List,  Image,  ShoppingBasket,  Settings,  FolderKanban,  ShoppingCart,
  Contact,  CircleDollarSign,  Logs,  SquareChartGantt,  FolderTree,  Network,
  User, Route, SquareMenu, Calculator, CalendarClock, Banknote, Layers, ScrollText,
  Activity, CircleUser, EarthLock, ChartArea
} from 'lucide-react';
import { edit } from '@/routes/profile';

const MenuContext = createContext<NavItem[]>([]);

function construirMenuJerarquico(items: any[]): NavItem[] {
  const iconMap: Record<string, any> = {
    LayoutGrid, List, Image, ShoppingBasket, Settings, FolderKanban, ShoppingCart,
    Contact, CircleDollarSign, Logs, SquareChartGantt, FolderTree, Network, User, Route,
    SquareMenu, Calculator,CalendarClock, Banknote, Layers, ScrollText, Activity, CircleUser,
    EarthLock, ChartArea
    //para opcion menu
  };

  const mapa: Record<number, NavItem> = {};
  const raiz: NavItem[] = [];

  items.forEach(item => {
    const nodo: NavItem = {
      title: item.nombre,
      href: item.nombre === 'Configuraciones' ? edit() : item.ruta_url || '#',
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

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [menu, setMenu] = useState<NavItem[]>([]);

  useEffect(() => {
    const cached = localStorage.getItem('menu');
    if(cached){
      const parsed = JSON.parse(localStorage.getItem('menu-data') || '[]');
      const menuListo = construirMenuJerarquico(parsed);
      setMenu(menuListo);
      return;
    }

    axios.get('/menu-usuario').then(res => {
      localStorage.setItem('menu-data', JSON.stringify(res.data));
      
      const jerarquico = construirMenuJerarquico(res.data);
      setMenu(jerarquico);
      
      localStorage.setItem('menu', JSON.stringify(jerarquico));
    });
  }, []);

  return <MenuContext.Provider value={menu}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  return useContext(MenuContext);
}
