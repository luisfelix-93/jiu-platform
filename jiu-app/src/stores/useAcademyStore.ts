import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Academy } from '../types/academy';
import { AcademyService } from '../services/academy.service';

interface AcademyState {
    myAcademies: Academy[];
    activeAcademy: Academy | null;
    isLoading: boolean;
    error: string | null;

    fetchMyAcademies: () => Promise<void>;
    setActiveAcademy: (academyId: string | null) => void;
    enrollInAcademy: (academyId: string) => Promise<void>;
    leaveAcademy: (academyId: string) => Promise<void>;
    clear: () => void;
}

export const useAcademyStore = create<AcademyState>()(
    persist(
        (set, get) => ({
            myAcademies: [],
            activeAcademy: null,
            isLoading: false,
            error: null,

            fetchMyAcademies: async () => {
                set({ isLoading: true, error: null });
                try {
                    const academies = await AcademyService.getMyAcademies();
                    set({ myAcademies: academies, isLoading: false });
                    
                    // Se não tiver academia ativa e tiver academias disponíveis, 
                    // ou se a academia ativa atual não estiver mais na lista
                    const currentActive = get().activeAcademy;
                    if (academies.length > 0) {
                        const hasCurrentActive = currentActive && academies.some(a => a.id === currentActive.id);
                        if (!hasCurrentActive) {
                            set({ activeAcademy: academies[0] });
                        }
                    } else {
                        set({ activeAcademy: null });
                    }
                } catch (error: any) {
                    set({ error: error.message || 'Erro ao carregar academias', isLoading: false });
                }
            },

            setActiveAcademy: (academyId) => {
                if (!academyId) {
                    set({ activeAcademy: null });
                    return;
                }
                const academy = get().myAcademies.find(a => a.id === academyId);
                if (academy) {
                    set({ activeAcademy: academy });
                }
            },

            enrollInAcademy: async (academyId) => {
                set({ isLoading: true, error: null });
                try {
                    await AcademyService.enrollStudent(academyId);
                    await get().fetchMyAcademies(); // Reload the list
                } catch (error: any) {
                    set({ error: error.response?.data?.error || error.message || 'Erro ao matricular na academia', isLoading: false });
                    throw error;
                }
            },

            leaveAcademy: async (academyId) => {
                set({ isLoading: true, error: null });
                try {
                    await AcademyService.unenrollStudent(academyId);
                    await get().fetchMyAcademies(); // Reload the list
                } catch (error: any) {
                    set({ error: error.message || 'Erro ao sair da academia', isLoading: false });
                    throw error;
                }
            },
            
            clear: () => {
                set({ myAcademies: [], activeAcademy: null, error: null });
            }
        }),
        {
            name: 'academy-storage',
            // Opcional: define qual storage usar (padrão é localStorage)
            // storage: createJSONStorage(() => sessionStorage), // Habilite se preferir sessionStorage
            partialize: (state) => ({ activeAcademy: state.activeAcademy }), // Persiste apenas a academia ativa
        }
    )
);
