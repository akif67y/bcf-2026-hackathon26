'use client';

import { useState, useEffect, useTransition } from 'react';
import { toast } from 'sonner';
import { getMaterialsWithMetadata, deleteMaterial, type Material } from '@/actions/materials';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, FileText, Code, Loader2, BookOpen, FlaskConical } from 'lucide-react';

interface MaterialsManagerProps {
    onMaterialDeleted?: () => void;
}

export function MaterialsManager({ onMaterialDeleted }: MaterialsManagerProps) {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [filter, setFilter] = useState<'All' | 'Theory' | 'Lab'>('All');
    const [isPending, startTransition] = useTransition();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadMaterials = () => {
        startTransition(async () => {
            const data = await getMaterialsWithMetadata();
            setMaterials(data);
        });
    };

    useEffect(() => {
        loadMaterials();
    }, []);

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        const result = await deleteMaterial(id);
        setDeletingId(null);

        if (result.success) {
            toast.success('Material deleted successfully');
            setMaterials(prev => prev.filter(m => m.id !== id));
            onMaterialDeleted?.();
        } else {
            toast.error(result.error || 'Failed to delete material');
        }
    };

    const filteredMaterials = filter === 'All'
        ? materials
        : materials.filter(m => m.category === filter);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Manage Materials
                </CardTitle>
                <CardDescription>
                    View and delete uploaded course materials
                </CardDescription>
                {/* Filter Tabs */}
                <div className="flex gap-2 pt-2">
                    {(['All', 'Theory', 'Lab'] as const).map(category => (
                        <Button
                            key={category}
                            variant={filter === category ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter(category)}
                            className="gap-1"
                        >
                            {category === 'Theory' && <BookOpen className="w-3.5 h-3.5" />}
                            {category === 'Lab' && <FlaskConical className="w-3.5 h-3.5" />}
                            {category}
                        </Button>
                    ))}
                </div>
            </CardHeader>

            <CardContent>
                {isPending ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredMaterials.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No materials found. Upload some content to get started.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredMaterials.map(material => (
                            <div
                                key={material.id}
                                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="mt-0.5">
                                        {material.type === 'pdf' ? (
                                            <FileText className="w-5 h-5 text-red-500" />
                                        ) : (
                                            <Code className="w-5 h-5 text-blue-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium truncate">{material.title}</h4>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <Badge
                                                variant={material.category === 'Theory' ? 'default' : 'secondary'}
                                                className="text-xs"
                                            >
                                                {material.category === 'Theory' ? (
                                                    <BookOpen className="w-3 h-3 mr-1" />
                                                ) : (
                                                    <FlaskConical className="w-3 h-3 mr-1" />
                                                )}
                                                {material.category}
                                            </Badge>
                                            {material.metadata?.week && (
                                                <Badge variant="outline" className="text-xs">
                                                    Week {material.metadata.week}
                                                </Badge>
                                            )}
                                            {material.metadata?.tags?.map(tag => (
                                                <Badge key={tag} variant="outline" className="text-xs bg-muted">
                                                    {tag}
                                                </Badge>
                                            ))}
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(material.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            disabled={deletingId === material.id}
                                        >
                                            {deletingId === material.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Material?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete "{material.title}" and all its embeddings.
                                                This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(material.id)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
