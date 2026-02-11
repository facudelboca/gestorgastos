
import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout = ({ children, currentSection, onSectionChange, onLogout, user }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
            <Sidebar
                currentSection={currentSection}
                onSectionChange={onSectionChange}
                onLogout={onLogout}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-semibold text-slate-900 dark:text-white">Lunch Money</span>
                    <div className="w-10" /> {/* Spacer for centering */}
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
                    {/* Top Bar (Desktop) */}
                    <div className="hidden lg:flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                                {currentSection}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                Welcome back, {user?.name || 'User'}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Add global actions here if needed */}
                        </div>
                    </div>

                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
