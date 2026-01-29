import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  GraduationCap,
  Upload,
  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
  Shield,
  FlaskConical,
  FileText,
  Zap
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,80,200,0.15),transparent_50%)] opacity-60"></div>
        <div className="container relative py-24 lg:py-32">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
              <Zap className="w-4 h-4 text-yellow-400" />
              AI-Powered Learning Platform
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
              <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                Trinity Learning
              </span>
              <br />
              <span className="text-2xl md:text-3xl lg:text-4xl font-normal text-purple-200/80 mt-4 block">
                Course Management & AI Assistant
              </span>
            </h1>
            <p className="text-lg md:text-xl text-purple-100/70 max-w-2xl">
              Upload course materials, browse organized content, and get instant AI-powered answers
              from your documents using semantic search.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/materials">
                <Button size="lg" className="bg-white text-purple-900 hover:bg-purple-100 gap-2 text-lg px-8">
                  <BookOpen className="w-5 h-5" />
                  Browse Materials
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/cms">
                <Button size="lg" className="bg-white/20 border border-white/40 text-white hover:bg-white/30 gap-2 text-lg px-8">
                  <Shield className="w-5 h-5" />
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete platform for managing course content and helping students learn smarter.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: CMS */}
          <Link href="/cms" className="group">
            <Card className="h-full transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/50 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  Content Management
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </CardTitle>
                <CardDescription>
                  Upload PDFs, code files, and notes. Organize by Theory or Lab with week numbers and tags.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">PDF Parsing</span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Auto Embedding</span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">RAG Ready</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Card 2: Materials Browser */}
          <Link href="/materials" className="group">
            <Card className="h-full transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/50 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  Materials Browser
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </CardTitle>
                <CardDescription>
                  Browse and download course materials filtered by Theory or Lab categories.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Theory
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <FlaskConical className="w-3 h-3" /> Lab
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Downloads</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Card 3: AI Search */}
          <Link href="/materials" className="group">
            <Card className="h-full transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/50 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  AI-Powered Search
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </CardTitle>
                <CardDescription>
                  Ask questions in natural language and get answers grounded in your course materials.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Semantic Search</span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Citations</span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Gemini AI</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Card 4: Content Generator */}
          <Link href="/generate" className="group">
            <Card className="h-full transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-500/50 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  Content Generator
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </CardTitle>
                <CardDescription>
                  Generate reading notes, slides, and lab exercises powered by AI and your materials.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Notes</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Slides</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Lab Exercises</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Card 5: Theory */}
          <Link href="/materials?category=Theory" className="group">
            <Card className="h-full bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 transition-all duration-300 hover:shadow-xl hover:shadow-slate-500/10 hover:border-slate-400/50 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  Theory Materials
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </CardTitle>
                <CardDescription>
                  Lecture slides, reading materials, and theoretical concepts organized by week.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full">Lectures</span>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full">PDFs</span>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full">Notes</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Card 6: Lab */}
          <Link href="/materials?category=Lab" className="group">
            <Card className="h-full bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 transition-all duration-300 hover:shadow-xl hover:shadow-slate-500/10 hover:border-slate-400/50 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FlaskConical className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  Lab Materials
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </CardTitle>
                <CardDescription>
                  Code samples, exercises, and hands-on lab instructions for practical learning.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full">Code</span>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full">Exercises</span>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full">Solutions</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="bg-slate-50 py-16">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready to get started?</h3>
              <p className="text-purple-100">Upload your first course material or browse existing content.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/cms">
                <Button size="lg" className="bg-white text-purple-700 hover:bg-purple-100">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Material
                </Button>
              </Link>
              <Link href="/materials">
                <Button size="lg" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  Browse Content
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-muted-foreground text-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5" />
            <span className="font-semibold">Trinity Learning Platform</span>
          </div>
          <p>Built for BUET CSE Fest Hackathon 2026</p>
        </div>
      </footer>
    </main >
  );
}
