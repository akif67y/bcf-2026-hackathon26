'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { getMaterialsWithMetadata, type Material } from '@/actions/materials';
import { MaterialCard } from './material-card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, FlaskConical, LayoutGrid } from 'lucide-react';

export function MaterialsBrowser() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [isPending, startTransition] = useTransition();

    const categoryParam = searchParams.get('category');
    const activeTab: 'All' | 'Theory' | 'Lab' = (categoryParam === 'Theory' || categoryParam === 'Lab') ? categoryParam : 'All';

    const setActiveTab = (tab: 'All' | 'Theory' | 'Lab') => {
        const params = new URLSearchParams(searchParams.toString());
        if (tab === 'All') {
            params.delete('category');
        } else {
            params.set('category', tab);
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    useEffect(() => {
        startTransition(async () => {
            const data = await getMaterialsWithMetadata();
            setMaterials(data);
        });
    }, []);

    const filteredMaterials = useMemo(() => {
        if (activeTab === 'All') return materials;
        return materials.filter(m => m.category === activeTab);
    }, [materials, activeTab]);

    const counts = useMemo(() => ({
        All: materials.length,
        Theory: materials.filter(m => m.category === 'Theory').length,
        Lab: materials.filter(m => m.category === 'Lab').length,
    }), [materials]);

    return (
        <div className="space-y-6">
            {/* Category Tabs */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
                {(['All', 'Theory', 'Lab'] as const).map(tab => (
                    <Button
                        key={tab}
                        variant={activeTab === tab ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab(tab)}
                        className="gap-2"
                    >
                        {tab === 'All' && <LayoutGrid className="w-4 h-4" />}
                        {tab === 'Theory' && <BookOpen className="w-4 h-4" />}
                        {tab === 'Lab' && <FlaskConical className="w-4 h-4" />}
                        {tab}
                        <span className="ml-1 text-xs opacity-70">({counts[tab]})</span>
                    </Button>
                ))}
            </div>

            {/* Materials Grid */}
            {isPending ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : filteredMaterials.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No materials found in this category.</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredMaterials.map(material => (
                        <MaterialCard key={material.id} material={material} />
                    ))}
                </div>
            )}
        </div>
    );
}
