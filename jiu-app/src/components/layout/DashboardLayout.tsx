import { type ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { cn } from '../../lib/utils';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ThemeToggle';

interface NavItem {
    label: string;
    href: string;
    icon: ReactNode;
    end?: boolean;
}

interface DashboardLayoutProps {
    children: ReactNode;
    navItems: NavItem[];
    title?: string;
}

export const DashboardLayout = ({ children, navItems, title }: DashboardLayoutProps) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-neutral-100 flex flex-col lg:flex-row">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 w-full h-16 bg-white border-b z-30 flex items-center justify-between px-4">
                <h1 className="font-bold text-lg text-primary flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5" />
                    TeamArcieri BJJ
                </h1>
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2">
                    {isSidebarOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 bg-white border-r w-64 z-40 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:block',
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 hidden lg:flex items-center px-6 border-b">
                        <h1 className="font-bold text-xl text-primary flex items-center gap-2">
                            <LayoutDashboard className="h-6 w-6" />
                            TeamArcieri BJJ
                        </h1>
                    </div>

                    {/* User Info */}
                    <div className="p-4 border-b bg-neutral-50 mt-16 lg:mt-0">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-neutral-200 overflow-hidden shrink-0">
                                <img src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}`} alt="Profile" className="h-full w-full object-cover" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-semibold text-sm truncate">{user?.name}</p>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-600 uppercase font-bold">
                                    {user?.beltColor} Belt
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                end={item.end}
                                className={({ isActive }) =>
                                    cn(
                                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                                    )
                                }
                                onClick={() => setSidebarOpen(false)}
                            >
                                {item.icon}
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Tema</span>
                            <ThemeToggle />
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 w-full p-4 lg:p-8 mt-16 lg:mt-0 overflow-y-auto h-[calc(100vh-64px)] lg:h-screen">
                {title && <h2 className="text-2xl font-bold mb-6 text-neutral-800">{title}</h2>}
                {children}
            </main>

            {/* Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};
