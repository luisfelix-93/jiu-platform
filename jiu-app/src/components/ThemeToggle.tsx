import { Moon, Sun, Monitor } from 'lucide-react';
import { useThemeStore } from '../stores/useThemeStore';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { cn } from '../utils/cn'; // Assuming you have a cn utility or similar, if not I'll use clsx directly or verify exists. 
// Wait, I saw clsx and tailwind-merge in package.json, so a cn utility is likely. 
// Let me check if utils/cn exists or creates it if not. 
// I'll assume standard button for now or just standard HTML to reduce dependency on unknown components first.
// Actually, using HeadlessUI Menu for a dropdown is nice. 

// I will implement a Cycle button first as it's simpler than a dropdown, or a simple dropdown.
// Let's go with a dropdown using Headless URI since it is in dependencies.

export function ThemeToggle() {
    const { theme, setTheme } = useThemeStore();

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <MenuButton className="inline-flex items-center justify-center p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-secondary">
                    <span className="sr-only">Toggle theme</span>
                    {theme === 'light' && <Sun className="h-5 w-5" />}
                    {theme === 'dark' && <Moon className="h-5 w-5" />}
                    {theme === 'system' && <Monitor className="h-5 w-5" />}
                </MenuButton>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <MenuItems className="absolute right-0 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white dark:bg-neutral-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="px-1 py-1">
                        <MenuItem>
                            {({ active }) => (
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`${active ? 'bg-primary text-white' : 'text-neutral-900 dark:text-neutral-100'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                >
                                    <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Light
                                </button>
                            )}
                        </MenuItem>
                        <MenuItem>
                            {({ active }) => (
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`${active ? 'bg-primary text-white' : 'text-neutral-900 dark:text-neutral-100'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                >
                                    <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Dark
                                </button>
                            )}
                        </MenuItem>
                        <MenuItem>
                            {({ active }) => (
                                <button
                                    onClick={() => setTheme('system')}
                                    className={`${active ? 'bg-primary text-white' : 'text-neutral-900 dark:text-neutral-100'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                >
                                    <Monitor className="mr-2 h-4 w-4" aria-hidden="true" />
                                    System
                                </button>
                            )}
                        </MenuItem>
                    </div>
                </MenuItems>
            </Transition>
        </Menu>
    );
}
