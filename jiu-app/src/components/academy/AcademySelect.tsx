import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AcademyService } from '../../services/academy.service';
import type { Academy } from '../../types/academy';
import { Loader2, Search, Building2 } from 'lucide-react';

interface AcademySelectProps {
    onSelect: (academy: Academy) => void;
}

export function AcademySelect({ onSelect }: AcademySelectProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Academy[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Initial load and simple debounce
    useEffect(() => {
        const fetchAcademies = async () => {
            setIsLoading(true);
            try {
                // If query is empty, we still fetch recent/all limit 10
                const response = await AcademyService.search({ q: query, limit: 10 });
                setResults(response.data);
                setHasSearched(true);
            } catch (error) {
                console.error("Failed to fetch academies", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchAcademies();
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="space-y-4 w-full">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Search className="h-5 w-5" />
                </div>
                <Input
                    placeholder="Buscar academia por nome..."
                    className="pl-10"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            <div className="bg-white border text-sm border-neutral-200 rounded-md shadow-sm divide-y max-h-64 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center p-4 text-neutral-500">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Buscando...
                    </div>
                ) : results.length > 0 ? (
                    results.map((academy) => (
                        <div 
                            key={academy.id} 
                            className="flex items-center justify-between p-3 hover:bg-neutral-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {academy.logoUrl ? (
                                    <img src={academy.logoUrl} alt={academy.name} className="h-10 w-10 rounded-md object-cover bg-neutral-100" />
                                ) : (
                                    <div className="h-10 w-10 flex items-center justify-center rounded-md bg-neutral-100 text-neutral-400">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-neutral-900">{academy.name}</p>
                                    {(academy.address || academy.phone) && (
                                        <p className="text-xs text-neutral-500">
                                            {academy.address}{academy.address && academy.phone ? ' • ' : ''}{academy.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => onSelect(academy)}>
                                Selecionar
                            </Button>
                        </div>
                    ))
                ) : hasSearched && (
                    <div className="p-4 text-center text-neutral-500">
                        Nenhuma academia encontrada com "{query}".
                    </div>
                )}
            </div>
        </div>
    );
}
