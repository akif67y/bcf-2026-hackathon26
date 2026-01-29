'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { getMaterialDownloadUrl, type Material } from '@/actions/materials';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Code, Loader2, BookOpen, FlaskConical, Calendar } from 'lucide-react';

interface MaterialCardProps {
    material: Material;
}

export function MaterialCard({ material }: MaterialCardProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (!material.file_url) {
            toast.error('No file available for download');
            return;
        }

        setIsDownloading(true);
        try {
            const url = await getMaterialDownloadUrl(material.file_url);
            if (url) {
                window.open(url, '_blank');
                toast.success('Download started');
            } else {
                toast.error('Failed to generate download link');
            }
        } catch (error) {
            toast.error('Download failed');
        } finally {
            setIsDownloading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <Card className="group hover:shadow-lg hover:border-primary/30 transition-all duration-200">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            {material.type === 'pdf' ? (
                                <FileText className="w-5 h-5 text-red-500" />
                            ) : (
                                <Code className="w-5 h-5 text-blue-500" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-semibold line-clamp-2">
                                {material.title}
                            </CardTitle>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Metadata Badges */}
                <div className="flex flex-wrap gap-1.5">
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
                            <Calendar className="w-3 h-3 mr-1" />
                            Week {material.metadata.week}
                        </Badge>
                    )}

                    <Badge variant="outline" className="text-xs text-muted-foreground">
                        {formatDate(material.created_at)}
                    </Badge>
                </div>

                {/* Tags */}
                {material.metadata?.tags && material.metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {material.metadata.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs bg-muted/50">
                                #{tag}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Download Button */}
                {material.file_url && (
                    <Button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Preparing...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </>
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
