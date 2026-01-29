'use client';

import { toast } from 'sonner';
import { uploadMaterial } from '@/actions/upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, BookOpen, FlaskConical } from 'lucide-react';
import { useActionState } from 'react';

interface AdminUploadFormProps {
    onUploadSuccess?: () => void;
}

const initialState = {
    success: false,
    message: '',
    error: '',
};

export function AdminUploadForm({ onUploadSuccess }: AdminUploadFormProps) {
    const [state, action, isPending] = useActionState(async (prev: any, formData: FormData) => {
        const result = await uploadMaterial(formData);
        if (result.error) {
            toast.error(result.error);
            return { ...prev, error: result.error, success: false };
        }
        if (result.success) {
            toast.success("Material uploaded and embedded successfully!");
            onUploadSuccess?.();
            // Reset form by forcing a re-render
            return { ...prev, message: "Material uploaded!", success: true };
        }
        return prev;
    }, initialState);

    return (
        <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Upload New Material
                </CardTitle>
                <CardDescription>
                    Upload PDFs, text files, or code to generate embeddings for RAG search.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={action} className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="e.g. Week 5 - Introduction to Algorithms"
                            required
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label>Category *</Label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="category"
                                    value="Theory"
                                    defaultChecked
                                    className="accent-primary"
                                />
                                <BookOpen className="w-4 h-4 text-primary" />
                                <span>Theory</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="category"
                                    value="Lab"
                                    className="accent-primary"
                                />
                                <FlaskConical className="w-4 h-4 text-blue-500" />
                                <span>Lab</span>
                            </label>
                        </div>
                    </div>

                    {/* Week and Tags Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="week">Week Number</Label>
                            <Input
                                id="week"
                                name="week"
                                type="number"
                                min="1"
                                max="20"
                                placeholder="e.g. 5"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (comma-separated)</Label>
                            <Input
                                id="tags"
                                name="tags"
                                placeholder="sorting, algorithms"
                            />
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="file">File *</Label>
                        <Input
                            id="file"
                            name="file"
                            type="file"
                            accept=".pdf, .txt, .md, .py, .js, .ts, .tsx, .json, .java, .c, .cpp"
                            required
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground">
                            Supported: PDF, TXT, MD, Python, JavaScript, TypeScript, Java, C/C++
                        </p>
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" disabled={isPending} className="w-full" size="lg">
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing & Embedding...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload & Generate Embeddings
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
