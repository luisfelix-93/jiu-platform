import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Hero/Branding */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-neutral-900 text-white p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-neutral-800 z-0" />
                <div className="relative z-10 max-w-lg text-center">
                    {/* Placeholder for Logo */}
                    <div className="mb-8 text-primary flex justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Arcieri BJJ</h1>
                    <p className="text-lg text-neutral-400">
                        Gerencie suas aulas, acompanhe seu progresso e evolua sua técnica.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8 bg-neutral-50 relative">
                <div className="w-full max-w-sm">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};
