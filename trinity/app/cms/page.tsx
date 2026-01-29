import { AdminUploadForm } from '@/components/cms/admin-upload-form';
import { MaterialsManager } from '@/components/cms/materials-manager';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

export default function CMSPage() {
    return (
        <main className="container py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Shield className="w-6 h-6 text-primary" />
                            Content Management System
                        </h1>
                        <p className="text-muted-foreground">
                            Upload, organize, and manage course materials
                        </p>
                    </div>
                </div>
                <Link href="/materials">
                    <Button variant="outline">View as Student →</Button>
                </Link>
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Left: Upload Form */}
                <AdminUploadForm />

                {/* Right: Materials List */}
                <MaterialsManager />
            </div>
        </main>
    );
}
