# Component Architectuur

## Overzicht

Het platform bestaat uit twee hoofdapplicaties:

1. **Admin Portal** - Next.js applicatie met React componenten
2. **Chatbot Widget** - Standalone React applicatie

## Folder Structuur

src/
├── app/ # Next.js App Router
│ ├── (auth)/ # Auth layout groep
│ │ ├── login/
│ │ │ └── page.tsx
│ │ └── signup/
│ │ └── page.tsx
│ │
│ ├── (dashboard)/ # Dashboard layout groep (protected)
│ │ ├── layout.tsx # Dashboard layout met sidebar
│ │ ├── page.tsx # Dashboard home / overzicht
│ │ ├── documents/
│ │ │ ├── page.tsx # Document lijst
│ │ │ └── [id]/
│ │ │ └── page.tsx # Document detail
│ │ ├── conversations/
│ │ │ ├── page.tsx # Conversatie lijst
│ │ │ └── [id]/
│ │ │ └── page.tsx # Conversatie detail
│ │ ├── settings/
│ │ │ ├── page.tsx # Chatbot settings
│ │ │ └── integration/
│ │ │ └── page.tsx # Integration/embed code
│ │ └── analytics/
│ │ └── page.tsx # Analytics dashboard
│ │
│ ├── api/ # API routes
│ │ ├── auth/
│ │ ├── documents/
│ │ ├── chatbot/
│ │ ├── chat/
│ │ ├── conversations/
│ │ └── analytics/
│ │
│ ├── layout.tsx # Root layout
│ └── globals.css # Global styles
│
├── components/
│ ├── ui/ # shadcn/ui components
│ │ ├── button.tsx
│ │ ├── input.tsx
│ │ ├── card.tsx
│ │ ├── dialog.tsx
│ │ ├── dropdown-menu.tsx
│ │ ├── table.tsx
│ │ ├── badge.tsx
│ │ ├── select.tsx
│ │ ├── textarea.tsx
│ │ └── toast.tsx
│ │
│ ├── auth/ # Auth componenten
│ │ ├── login-form.tsx
│ │ └── signup-form.tsx
│ │
│ ├── dashboard/ # Dashboard componenten
│ │ ├── sidebar.tsx
│ │ ├── header.tsx
│ │ ├── stats-card.tsx
│ │ └── quick-actions.tsx
│ │
│ ├── documents/ # Document componenten
│ │ ├── document-list.tsx
│ │ ├── document-card.tsx
│ │ ├── document-upload.tsx
│ │ ├── document-url-form.tsx
│ │ ├── document-viewer.tsx
│ │ └── document-delete-dialog.tsx
│ │
│ ├── conversations/ # Conversatie componenten
│ │ ├── conversation-list.tsx
│ │ ├── conversation-card.tsx
│ │ ├── conversation-detail.tsx
│ │ ├── rating-form.tsx
│ │ ├── conversation-filters.tsx
│ │ └── conversation-export-button.tsx
│ │
│ ├── chatbot/ # Chatbot settings componenten
│ │ ├── settings-form.tsx
│ │ ├── color-picker.tsx
│ │ ├── embed-code-display.tsx
│ │ └── chatbot-preview.tsx
│ │
│ ├── analytics/ # Analytics componenten
│ │ ├── stats-overview.tsx
│ │ ├── rating-chart.tsx
│ │ ├── conversations-chart.tsx
│ │ └── top-questions.tsx
│ │
│ └── shared/ # Gedeelde componenten
│ ├── loading-spinner.tsx
│ ├── error-boundary.tsx
│ ├── pagination.tsx
│ └── empty-state.tsx
│
├── lib/ # Utility libraries
├── types/ # TypeScript types
├── hooks/ # Custom React hooks
└── middleware.ts # Next.js middleware (auth)

---

## Admin Portal Componenten

### 1. Layout Componenten

#### DashboardLayout

`app/(dashboard)/layout.tsx`

```tsx
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
Features:

Fixed sidebar met navigatie
Responsive header
Scroll container voor content
Container met padding


Sidebar
components/dashboard/sidebar.tsx
tsx'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings,
  BarChart
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/documents', icon: FileText, label: 'Documenten' },
  { href: '/conversations', icon: MessageSquare, label: 'Conversaties' },
  { href: '/analytics', icon: BarChart, label: 'Analytics' },
  { href: '/settings', icon: Settings, label: 'Instellingen' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">
          Cited
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-200">
        <UserMenu />
      </div>
    </aside>
  )
}
Props: Geen
Features:

Active state highlighting
Icon links
User menu onderaan
Responsive design


Header
components/dashboard/header.tsx
tsx'use client'

import { useSession } from 'next-auth/react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Welkom terug, {session?.user?.name}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}

2. Document Componenten
DocumentUpload
components/documents/document-upload.tsx
tsx'use client'

import { useState, useCallback } from 'react'
import { Upload, File } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function DocumentUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const onDrop = useCallback(async (files: File[]) => {
    setUploading(true)

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) throw new Error('Upload failed')
      }

      toast({
        title: 'Success',
        description: `${files.length} document(en) geüpload`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Upload mislukt',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }, [toast])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    onDrop(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      onDrop(files)
    }
  }

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-lg p-12 text-center transition-colors',
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
        uploading && 'opacity-50 pointer-events-none'
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />

      <p className="text-lg font-medium text-gray-900 mb-2">
        Sleep bestanden hierheen
      </p>

      <p className="text-sm text-gray-500 mb-4">
        of klik om te uploaden
      </p>

      <input
        type="file"
        multiple
        accept=".pdf,.docx,.txt,.jpg,.png"
        onChange={handleFileInput}
        className="hidden"
        id="file-upload"
      />

      <label htmlFor="file-upload">
        <Button asChild>
          <span>Selecteer bestanden</span>
        </Button>
      </label>

      <p className="text-xs text-gray-400 mt-4">
        PDF, DOCX, TXT, JPG, PNG (max 10MB)
      </p>
    </div>
  )
}
Props: Geen
Features:

Drag & drop
File type validatie
Multiple files
Progress feedback
Error handling


DocumentList
components/documents/document-list.tsx
tsx'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DocumentCard } from './document-card'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { EmptyState } from '@/components/shared/empty-state'
import { Pagination } from '@/components/shared/pagination'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

interface DocumentFilters {
  search: string
  type: string
  status: string
}

export function DocumentList() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<DocumentFilters>({
    search: '',
    type: 'all',
    status: 'all',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['documents', page, filters],
    queryFn: () => fetchDocuments({ page, ...filters }),
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!data?.data.length) {
    return (
      <EmptyState
        title="Geen documenten"
        description="Upload je eerste document om te beginnen"
        action={{ label: 'Document uploaden', href: '/documents/upload' }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Zoeken..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="max-w-sm"
        />

        <Select
          value={filters.type}
          onValueChange={(value) => setFilters({ ...filters, type: value })}
        >
          <option value="all">Alle types</option>
          <option value="PDF">PDF</option>
          <option value="DOCX">DOCX</option>
          <option value="TXT">TXT</option>
          <option value="URL">URL</option>
        </Select>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.data.map((document) => (
          <DocumentCard key={document.id} document={document} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={data.pagination.totalPages}
        onPageChange={setPage}
      />
    </div>
  )
}
Props: Geen
Features:

Search filtering
Type filtering
Grid layout
Pagination
Empty states
Loading states


DocumentCard
components/documents/document-card.tsx
tsximport Link from 'next/link'
import { FileText, MoreVertical, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatBytes, formatDate } from '@/lib/utils'

interface Document {
  id: string
  name: string
  type: string
  status: string
  fileSize?: number
  chunksCount: number
  createdAt: string
}

interface DocumentCardProps {
  document: Document
}

export function DocumentCard({ document }: DocumentCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>

          <div className="flex-1 min-w-0">
            <Link
              href={`/documents/${document.id}`}
              className="font-medium text-gray-900 hover:text-blue-600 truncate block"
            >
              {document.name}
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(document.createdAt)}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Trash2 className="w-4 h-4 mr-2" />
              Verwijderen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          <Badge variant={document.status === 'COMPLETED' ? 'default' : 'secondary'}>
            {document.status}
          </Badge>

          <div className="text-sm text-gray-500 space-y-1">
            {document.fileSize && (
              <div>{formatBytes(document.fileSize)}</div>
            )}
            <div>{document.chunksCount} chunks</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
Props:

document - Document data object

Features:

Document preview
Status badge
Actions menu
File size display
Click to view details


3. Conversation Componenten
ConversationList
components/conversations/conversation-list.tsx
tsx'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ConversationCard } from './conversation-card'
import { ConversationFilters } from './conversation-filters'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { Pagination } from '@/components/shared/pagination'

interface Filters {
  rated: 'all' | 'true' | 'false'
  rating: number | null
  search: string
  dateFrom: string
  dateTo: string
}

export function ConversationList() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<Filters>({
    rated: 'all',
    rating: null,
    search: '',
    dateFrom: '',
    dateTo: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['conversations', page, filters],
    queryFn: () => fetchConversations({ page, limit: 20, ...filters }),
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <ConversationFilters filters={filters} onChange={setFilters} />

      <div className="space-y-4">
        {data?.data.map((conversation) => (
          <ConversationCard
            key={conversation.id}
            conversation={conversation}
          />
        ))}
      </div>

      {data && (
        <Pagination
          currentPage={page}
          totalPages={data.pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}

RatingForm
components/conversations/rating-form.tsx
tsx'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface RatingFormProps {
  conversationId: string
  currentRating?: number | null
  currentNotes?: string | null
  onSuccess?: () => void
}

export function RatingForm({
  conversationId,
  currentRating,
  currentNotes,
  onSuccess
}: RatingFormProps) {
  const [rating, setRating] = useState(currentRating || 0)
  const [notes, setNotes] = useState(currentNotes || '')
  const [hoveredRating, setHoveredRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Error',
        description: 'Selecteer een rating',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/rating`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating, notes }),
        }
      )

      if (!response.ok) throw new Error('Failed to save rating')

      toast({
        title: 'Success',
        description: 'Beoordeling opgeslagen',
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Opslaan mislukt',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Beoordeel antwoord</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Star Rating */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={cn(
                    'w-8 h-8 transition-colors',
                    (hoveredRating || rating) >= value
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Notities (optioneel)
          </label>
          <Textarea
            placeholder="Voeg opmerkingen toe..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          className="w-full"
        >
          {submitting ? 'Opslaan...' : 'Opslaan'}
        </Button>
      </CardContent>
    </Card>
  )
}
Props:

conversationId - ID van conversatie
currentRating - Huidige rating (optioneel)
currentNotes - Huidige notities (optioneel)
onSuccess - Callback bij success

Features:

Interactive star rating
Hover effect
Optional notes
Form validation
Loading state


4. Settings Componenten
SettingsForm
components/chatbot/settings-form.tsx
tsx'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { ColorPicker } from './color-picker'
import { useToast } from '@/hooks/use-toast'

const settingsSchema = z.object({
  name: z.string().min(1, 'Naam is verplicht'),
  welcomeMessage: z.string().min(1, 'Welkomstbericht is verplicht'),
  placeholderText: z.string().min(1, 'Placeholder is verplicht'),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Ongeldige kleur'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Ongeldige kleur'),
  tone: z.enum(['professional', 'friendly', 'casual']),
  temperature: z.number().min(0).max(1),
  maxResponseLength: z.number().min(100).max(2000),
  fallbackMessage: z.string().min(1),
})

type SettingsFormData = z.infer<typeof settingsSchema>

export function SettingsForm({
  initialData
}: {
  initialData: SettingsFormData
}) {
  const { toast } = useToast()
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  })

  const onSubmit = async (data: SettingsFormData) => {
    try {
      const response = await fetch('/api/chatbot/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to save')

      toast({
        title: 'Success',
        description: 'Instellingen opgeslagen',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Opslaan mislukt',
        variant: 'destructive',
      })
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basis instellingen */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basis instellingen</h3>

        <div>
          <label className="text-sm font-medium">Bot naam</label>
          <Input {...form.register('name')} />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Welkomstbericht</label>
          <Textarea {...form.register('welcomeMessage')} rows={3} />
        </div>

        <div>
          <label className="text-sm font-medium">Placeholder tekst</label>
          <Input {...form.register('placeholderText')} />
        </div>
      </div>

      {/* Kleuren */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Kleuren</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Primaire kleur</label>
            <ColorPicker
              value={form.watch('primaryColor')}
              onChange={(color) => form.setValue('primaryColor', color)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Secundaire kleur</label>
            <ColorPicker
              value={form.watch('secondaryColor')}
              onChange={(color) => form.setValue('secondaryColor', color)}
            />
          </div>
        </div>
      </div>

      {/* Gedrag */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Gedrag</h3>

        <div>
          <label className="text-sm font-medium">Toon</label>
          <Select {...form.register('tone')}>
            <option value="professional">Professioneel</option>
            <option value="friendly">Vriendelijk</option>
            <option value="casual">Casual</option>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">
            Temperature ({form.watch('temperature')})
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            {...form.register('temperature', { valueAsNumber: true })}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Lagere waarde = meer deterministisch, hogere waarde = meer creatief
          </p>
        </div>
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Opslaan...' : 'Instellingen opslaan'}
      </Button>
    </form>
  )
}

5. Analytics Componenten
StatsOverview
components/analytics/stats-overview.tsx
tsximport { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Star, Clock, TrendingUp } from 'lucide-react'

interface StatsOverviewProps {
  stats: {
    totalConversations: number
    averageRating: number
    averageResponseTime: number
    conversationGrowth: number
  }
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const cards = [
    {
      title: 'Total Conversaties',
      value: stats.totalConversations.toLocaleString(),
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Gemiddelde Rating',
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      suffix: '/ 5',
    },
    {
      title: 'Reactietijd',
      value: stats.averageResponseTime.toFixed(0),
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      suffix: 'ms',
    },
    {
      title: 'Groei',
      value: `${stats.conversationGrowth > 0 ? '+' : ''}${stats.conversationGrowth}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {card.value}
                    {card.suffix && (
                      <span className="text-sm text-gray-500 ml-1">
                        {card.suffix}
                      </span>
                    )}
                  </p>
                </div>

                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

Custom Hooks
useDocuments
hooks/use-documents.ts
typescriptimport { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useDocuments(filters?: any) {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: () => fetchDocuments(filters),
  })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => fetchDocument(id),
    enabled: !!id,
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => uploadDocument(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

useConversations
hooks/use-conversations.ts
typescriptimport { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useConversations(filters?: any) {
  return useQuery({
    queryKey: ['conversations', filters],
    queryFn: () => fetchConversations(filters),
  })
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => fetchConversation(id),
    enabled: !!id,
  })
}

export function useUpdateRating() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, rating, notes }: UpdateRatingParams) =>
      updateConversationRating(id, { rating, notes }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.id] })
    },
  })
}

State Management
React Query Configuration
app/providers.tsx
tsx'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  )
}

Styling Conventions
Tailwind Klassen Structuur
tsx// 1. Layout (flex, grid, display)
// 2. Position & sizing (w-, h-, p-, m-)
// 3. Typography (text-, font-)
// 4. Colors (bg-, text-, border-)
// 5. Effects (shadow-, rounded-, transition-)
// 6. State (hover:, focus:, active:)

<div className="
  flex items-center gap-4
  w-full p-4
  text-sm font-medium
  bg-white text-gray-900 border border-gray-200
  rounded-lg shadow-sm transition-colors
  hover:bg-gray-50
">
Color Palette
css/* Primary */
--blue-50: #EFF6FF
--blue-600: #3B82F6

/* Semantic */
--green-600: #16A34A  /* Success */
--red-600: #DC2626    /* Error */
--yellow-600: #CA8A04 /* Warning */
--gray-600: #4B5563   /* Neutral */

Component Best Practices

Server Components by Default

Use 'use client' only when needed
Keep client components small


Prop Types

Always define TypeScript interfaces
Use React.ComponentProps<typeof Component> voor compositie


Error Boundaries

Wrap async components in error boundaries
Provide fallback UI


Loading States

Show skeletons or spinners
Provide feedback tijdens acties


Accessibility

Use semantic HTML
Include ARIA labels
Keyboard navigatie support
```
