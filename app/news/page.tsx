'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Newspaper,
  Eye,
  EyeOff,
  Archive,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Tag,
  Calendar,
  User,
  ImagePlus,
  X,
  Upload,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// ─── Types ────────────────────────────────────────────────────────────────────

type NewsStatus   = 'draft' | 'published' | 'archived';
type NewsCategory = 'announcement' | 'alert' | 'event' | 'update' | 'general';

interface NewsItem {
  _id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  author: string;
  category: NewsCategory;
  tags: string[];
  imageUrl?: string;
  lguCode?: string;
  status: NewsStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  title: string;
  summary: string;
  content: string;
  author: string;
  category: NewsCategory;
  tags: string;
  imageUrl: string;
  lguCode: string;
  status: NewsStatus;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<NewsStatus, { label: string; classes: string; dot: string; icon: React.ReactNode }> = {
  published: {
    label: 'Published',
    classes: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    dot: 'bg-emerald-400',
    icon: <Eye className="h-3 w-3" />,
  },
  draft: {
    label: 'Draft',
    classes: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    dot: 'bg-amber-400',
    icon: <EyeOff className="h-3 w-3" />,
  },
  archived: {
    label: 'Archived',
    classes: 'bg-zinc-700/60 text-zinc-400 border border-zinc-600/40',
    dot: 'bg-zinc-500',
    icon: <Archive className="h-3 w-3" />,
  },
};

const CATEGORY_CONFIG: Record<NewsCategory, { label: string; accent: string }> = {
  announcement: { label: 'Announcement', accent: 'text-violet-400' },
  alert:        { label: 'Alert',        accent: 'text-red-400' },
  event:        { label: 'Event',        accent: 'text-sky-400' },
  update:       { label: 'Update',       accent: 'text-teal-400' },
  general:      { label: 'General',      accent: 'text-zinc-400' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

// ─── Image Uploader Component ─────────────────────────────────────────────────

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const fileInputRef            = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');
  const [preview, setPreview]     = useState(value);

  // Keep preview in sync if value changes externally (e.g. edit dialog opens)
  useEffect(() => { setPreview(value); }, [value]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediate local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError('');
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append('file', file);

      const res  = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();

      if (json.success) {
        onChange(json.url);
        setPreview(json.url);
      } else {
        setError(json.error || 'Upload failed');
        setPreview(value); // revert
        onChange(value);
      }
    } catch {
      setError('Upload failed. Please try again.');
      setPreview(value);
      onChange(value);
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleRemove() {
    setPreview('');
    onChange('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {preview ? (
        /* ── Image preview ── */
        <div className="relative group rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800">
          <img
            src={preview}
            alt="Cover preview"
            className="w-full h-44 object-cover"
          />

          {/* Uploading overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-zinc-950/70 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
              <span className="text-xs text-zinc-300">Uploading to Cloudinary…</span>
            </div>
          )}

          {/* Hover actions */}
          {!uploading && (
            <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <Upload className="h-3.5 w-3.5" />
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ── Drop zone / picker ── */
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-36 rounded-lg border-2 border-dashed border-zinc-700 hover:border-indigo-500/60 bg-zinc-800/40 hover:bg-zinc-800/70 transition-all flex flex-col items-center justify-center gap-2 group"
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
              <span className="text-xs text-zinc-400">Uploading…</span>
            </>
          ) : (
            <>
              <div className="p-2.5 rounded-full bg-zinc-700 group-hover:bg-indigo-500/20 transition-colors">
                <ImagePlus className="h-5 w-5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm text-zinc-300 group-hover:text-white transition-colors font-medium">
                  Click to upload cover image
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">PNG, JPG, WEBP · max 5MB</p>
              </div>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5">
          <X className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NewsAdminPage() {
  const { data: session } = useSession();

  const sessionLguCode = session?.user?.lguCode || '';
  const sessionName    = session?.user?.name    || '';

  const emptyForm = useCallback((): FormData => ({
    title:    '',
    summary:  '',
    content:  '',
    author:   sessionName,
    category: 'general',
    tags:     '',
    imageUrl: '',
    lguCode:  sessionLguCode,
    status:   'draft',
  }), [sessionLguCode, sessionName]);

  const [news, setNews]                     = useState<NewsItem[]>([]);
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [search, setSearch]                 = useState('');
  const [filterStatus, setFilterStatus]     = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [page, setPage]                     = useState(1);
  const [totalPages, setTotalPages]         = useState(1);
  const [total, setTotal]                   = useState(0);
  const [dialogOpen, setDialogOpen]         = useState(false);
  const [deleteTarget, setDeleteTarget]     = useState<NewsItem | null>(null);
  const [editingItem, setEditingItem]       = useState<NewsItem | null>(null);
  const [form, setForm]                     = useState<FormData>(() => ({
    title: '', summary: '', content: '', author: '', category: 'general',
    tags: '', imageUrl: '', lguCode: '', status: 'draft',
  }));

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search)                   params.set('search', search);
      if (filterStatus !== 'all')   params.set('status', filterStatus);
      if (filterCategory !== 'all') params.set('category', filterCategory);
      if (sessionLguCode)           params.set('lguCode', sessionLguCode);

      const res  = await fetch(`/api/news?${params}`);
      const json = await res.json();
      if (json.success) {
        setNews(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotal(json.pagination.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus, filterCategory, sessionLguCode]);


  
  useEffect(() => { fetchNews(); }, [fetchNews]);
  useEffect(() => { setPage(1); }, [search, filterStatus, filterCategory]);

  // ── Dialog helpers ─────────────────────────────────────────────────────────

  function openCreate() {
    setEditingItem(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(item: NewsItem) {
    setEditingItem(item);
    setForm({
      title:    item.title,
      summary:  item.summary,
      content:  item.content,
      author:   sessionName,
      category: item.category,
      tags:     item.tags.join(', '),
      imageUrl: item.imageUrl || '',
      lguCode:  sessionLguCode,
      status:   item.status,
    });
    setDialogOpen(true);
  }

  function updateForm(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        author:  sessionName,
        lguCode: sessionLguCode,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      const url    = editingItem ? `/api/news/${editingItem._id}` : '/api/news';
      const method = editingItem ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setDialogOpen(false);
        fetchNews();
      } else {
        alert(json.error || 'Something went wrong');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: NewsItem) {
    try {
      const res  = await fetch(`/api/news/${item._id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) { setDeleteTarget(null); fetchNews(); }
    } catch (e) { console.error(e); }
  }

  const inputCls = 'bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-indigo-500/20';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      <div className="fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-md opacity-40 rounded-lg" />
              <div className="relative p-2 bg-indigo-600 rounded-lg border border-indigo-500/30">
                <Newspaper className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">News Manager</h1>
              <p className="text-xs text-zinc-500">
                {sessionLguCode && (
                  <span className="text-indigo-400 font-medium">{sessionLguCode} · </span>
                )}
                {total} article{total !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            onClick={openCreate}
            className="bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/30 shadow-lg shadow-indigo-900/40 transition-all"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Article
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`pl-9 ${inputCls}`}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className={`w-full sm:w-40 ${inputCls}`}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className={`w-full sm:w-44 ${inputCls}`}>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
              <SelectItem value="all">All Categories</SelectItem>
              {(Object.keys(CATEGORY_CONFIG) as NewsCategory[]).map((c) => (
                <SelectItem key={c} value={c}>{CATEGORY_CONFIG[c].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-2xl shadow-black/40">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-indigo-400" />
                <span className="text-sm text-zinc-500">Loading articles…</span>
              </div>
            </div>
          ) : news.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="p-4 rounded-full bg-zinc-800 border border-zinc-700">
                <Newspaper className="h-8 w-8 text-zinc-600" />
              </div>
              <p className="font-medium text-zinc-300">No articles found</p>
              <p className="text-sm text-zinc-600">Try adjusting your filters or create a new article.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-800/50">
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Article</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Author</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                    <th className="px-6 py-3.5 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {news.map((item) => {
                    const s = STATUS_CONFIG[item.status];
                    const c = CATEGORY_CONFIG[item.category];
                    return (
                      <tr key={item._id} className="group hover:bg-zinc-800/40 transition-colors duration-150">
                        {/* Cover thumb + title */}
                        <td className="px-6 py-4 max-w-xs">
                          <div className="flex items-center gap-3">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt=""
                                className="h-10 w-16 rounded object-cover shrink-0 border border-zinc-700"
                              />
                            ) : (
                              <div className="h-10 w-16 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                                <Newspaper className="h-4 w-4 text-zinc-600" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-zinc-100 line-clamp-1 group-hover:text-white transition-colors">
                                {item.title}
                              </p>
                              <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{item.summary}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className={`text-xs font-medium ${c.accent}`}>{c.label}</span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                            <User className="h-3 w-3 text-zinc-600" />
                            {item.author}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.classes}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                            {s.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                            <Calendar className="h-3 w-3 text-zinc-600" />
                            {formatDate(item.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all"
                              onClick={() => openEdit(item)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                              onClick={() => setDeleteTarget(item)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <span>
              Page <span className="text-zinc-300 font-medium">{page}</span> of{' '}
              <span className="text-zinc-300 font-medium">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline" size="sm" disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button
                variant="outline" size="sm" disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-30"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-700/60 text-zinc-100 shadow-2xl shadow-black/60">
          <DialogHeader>
            <DialogTitle className="text-white text-base font-semibold">
              {editingItem ? 'Edit Article' : 'New Article'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">

            {/* Cover Image Upload */}
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <ImagePlus className="h-3 w-3" /> Cover Image
              </Label>
              <ImageUploader
                value={form.imageUrl}
                onChange={(url) => updateForm('imageUrl', url)}
              />
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs uppercase tracking-wide">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => updateForm('title', e.target.value)}
                placeholder="Enter article title"
                className={inputCls}
              />
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs uppercase tracking-wide">Summary *</Label>
              <Textarea
                value={form.summary}
                onChange={(e) => updateForm('summary', e.target.value)}
                placeholder="Brief summary for list views…"
                rows={2}
                className={inputCls}
              />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs uppercase tracking-wide">Content *</Label>
              <Textarea
                value={form.content}
                onChange={(e) => updateForm('content', e.target.value)}
                placeholder="Write the full article content here…"
                rows={8}
                className={inputCls}
              />
            </div>

            {/* Author (read-only) + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-xs uppercase tracking-wide">Author</Label>
                <Input
                  value={form.author}
                  readOnly
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-400 cursor-not-allowed"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-xs uppercase tracking-wide">Category *</Label>
                <Select value={form.category} onValueChange={(v: any) => updateForm('category', v)}>
                  <SelectTrigger className={inputCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                    {(Object.keys(CATEGORY_CONFIG) as NewsCategory[]).map((c) => (
                      <SelectItem key={c} value={c}>{CATEGORY_CONFIG[c].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status + LGU Code (read-only) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-xs uppercase tracking-wide">Status</Label>
                <Select value={form.status} onValueChange={(v: any) => updateForm('status', v)}>
                  <SelectTrigger className={inputCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-xs uppercase tracking-wide">LGU Code</Label>
                <Input
                  value={form.lguCode}
                  readOnly
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Tag className="h-3 w-3" /> Tags
              </Label>
              <Input
                value={form.tags}
                onChange={(e) => updateForm('tags', e.target.value)}
                placeholder="safety, health, event  (comma-separated)"
                className={inputCls}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 border-t border-zinc-800">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/30 shadow-lg shadow-indigo-900/40"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingItem ? 'Save Changes' : 'Create Article'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-zinc-900 border border-zinc-700/60 shadow-2xl shadow-black/60 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Article?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              You're about to permanently delete{' '}
              <span className="text-zinc-200 font-medium">"{deleteTarget?.title}"</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-500 text-white border border-red-500/30 shadow-lg shadow-red-900/30"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}