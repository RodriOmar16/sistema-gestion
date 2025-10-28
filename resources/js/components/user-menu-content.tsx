import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import { type User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { LogOut, Settings, RefreshCcw } from 'lucide-react';
import { resetLocalStorage } from '@/utils';
interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        resetLocalStorage();
        router.flushAll();
    };

    const handleSyncMenu = async () => {
        localStorage.removeItem('menu');
        localStorage.removeItem('menu-data');

        try {
            const res = await fetch('/menu-usuario');
            const data = await res.json();

            localStorage.setItem('menu-data', JSON.stringify(data));
            localStorage.setItem('menu', JSON.stringify(data)); // opcional si querés guardar jerárquico

            location.reload(); // recarga forzada
        } catch (error) {
            console.error('Error al sincronizar menú:', error);
        }
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/*<DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full"
                        href={edit()}
                        as="button"
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Ajustes
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />*/}
            <DropdownMenuItem asChild>
                <button
                    className="block w-full text-left px-2 py-1"
                    onClick={handleSyncMenu}
                >
                    <RefreshCcw className='mr-2'/>Sincronizar
                </button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Salir
                </Link>
            </DropdownMenuItem>
            

        </>
    );
}
