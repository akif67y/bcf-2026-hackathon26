'use client';

import { toast } from 'sonner';
import { uploadMaterial } from '@/actions/upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload } from 'lucide-react';
import { useActionState } from 'react';

const initialState = {
    success: false,
    message: '',
    error: '',
};

export function UploadMaterial() {
    const [state, action, isPending] = useActionState(async (prev: any, formData: FormData) => {
        const result = await uploadMaterial(formData);
        if (result.error) {
            toast.error(result.error);
            return { ...prev, error: result.error, success: false };
        }
        if (result.success) {
            toast.success("Material uploaded and embedded successfully!"); // Fixed generic message
            return { ...prev, message: "Material uploaded and embedded successfully!", success: true };
        }
        return prev;
    }, initialState);

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Upload Learning Material</CardTitle>
                <CardDescription>Upload PDFs, text, or code files (.txt, .md, .py, .js) to generate local embeddings.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={action} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" placeholder="e.g. Introduction to Physics" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <div className="flex gap-4">
                            <label className="flex items-center space-x-2">
                                <input type="radio" name="category" value="Theory" defaultChecked />
                                <span>Theory</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="radio" name="category" value="Lab" />
                                <span>Lab</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file">File (PDF, Text, Code)</Label>
                        <Input
                            id="file"
                            name="file"
                            type="file"
                            accept=".pdf, .txt, .md, .py, .js, .ts, .tsx, .json, .java, .c, .cpp"
                            required
                        />
                    </div>

                    <Button type="submit" disabled={isPending} className="w-full">
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing (Embedding)...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload & Embed
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
