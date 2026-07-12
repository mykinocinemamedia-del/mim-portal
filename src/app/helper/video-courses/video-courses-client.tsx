'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Video, Clock, CheckCircle2, PlayCircle, GraduationCap, BookOpen } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type Progress = {
  id: string
  userId: string
  courseId: string
  watchedPercent: number
  completed: boolean
}

type Course = {
  id: string
  title: string
  description: string | null
  videoUrl: string
  thumbnail: string | null
  category: string | null
  durationMinutes: number | null
  isPublished: boolean
  progress: Progress[]
}

function toEmbedUrl(url: string): string {
  // Convert various YouTube URL formats to embed format
  if (!url) return ''
  // Already an embed URL
  if (url.includes('/embed/')) return url
  // youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([\w-]+)/)
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`
  // youtube.com/watch?v=ID
  const watchMatch = url.match(/[?&]v=([\w-]+)/)
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`
  return url
}

export function VideoCoursesClient({
  courses,
  userId,
  helperName,
}: {
  courses: Course[]
  userId: string
  helperName: string
}) {
  const { toast } = useToast()
  const [openCourseId, setOpenCourseId] = useState<string | null>(null)
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [localProgress, setLocalProgress] = useState<Record<string, Progress>>(() => {
    const map: Record<string, Progress> = {}
    for (const c of courses) {
      if (c.progress[0]) {
        map[c.id] = c.progress[0]
      }
    }
    return map
  })

  const openCourse = courses.find((c) => c.id === openCourseId)
  const totalCompleted = courses.filter(
    (c) => localProgress[c.id]?.completed
  ).length
  const overallPct =
    courses.length > 0 ? Math.round((totalCompleted / courses.length) * 100) : 0

  const markComplete = async (courseId: string) => {
    setMarkingId(courseId)
    try {
      const res = await fetch('/api/courses/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          userId,
          watchedPercent: 100,
          completed: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menandai kursus')
      setLocalProgress((p) => ({
        ...p,
        [courseId]: {
          id: p[courseId]?.id || '',
          userId,
          courseId,
          watchedPercent: 100,
          completed: true,
        },
      }))
      toast({
        title: 'Berjaya!',
        description: 'Kursus telah ditandai sebagai selesai.',
      })
    } catch (e: any) {
      toast({
        title: 'Ralat',
        description: e.message,
        variant: 'destructive',
      })
    } finally {
      setMarkingId(null)
    }
  }

  const updateWatchedPercent = async (courseId: string, pct: number) => {
    try {
      const existing = localProgress[courseId]
      // Only update if greater than existing
      if (existing && existing.watchedPercent >= pct && existing.completed) return

      const res = await fetch('/api/courses/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          userId,
          watchedPercent: pct,
          completed: pct >= 100,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setLocalProgress((p) => ({
        ...p,
        [courseId]: {
          id: existing?.id || '',
          userId,
          courseId,
          watchedPercent: pct,
          completed: pct >= 100,
        },
      }))
    } catch {
      // silent fail for progress tracking
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Video Kursus Latihan</h1>
          <p className="text-muted-foreground mt-1">
            Tonton dan lengkapkan semua kursus latihan untuk pembantu.
          </p>
        </div>
        <Badge variant="secondary" className="text-sm self-start">
          <GraduationCap className="w-4 h-4 mr-1" />
          {totalCompleted}/{courses.length} Selesai
        </Badge>
      </div>

      {/* Overall Progress */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-amber-50/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span className="font-medium text-sm">Keseluruhan Progress</span>
            </div>
            <span className="text-sm font-semibold text-emerald-700">{overallPct}%</span>
          </div>
          <Progress value={overallPct} className="h-2" />
        </CardContent>
      </Card>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Tiada Kursus Tersedia</h3>
            <p className="text-sm text-muted-foreground">
              Video kursus akan ditambah oleh admin dari semasa ke semasa.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => {
            const p = localProgress[c.id]
            const pct = p?.watchedPercent ?? 0
            const completed = p?.completed ?? false
            return (
              <Card
                key={c.id}
                className={`border-0 shadow-sm overflow-hidden transition hover:shadow-md ${
                  completed ? 'ring-1 ring-emerald-300' : ''
                }`}
              >
                <div
                  className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 cursor-pointer group"
                  onClick={() => setOpenCourseId(c.id)}
                >
                  {c.thumbnail ? (
                    <img
                      src={c.thumbnail}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-12 h-12 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-white/90" />
                  </div>
                  {completed && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Selesai
                      </Badge>
                    </div>
                  )}
                  {c.durationMinutes && (
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="secondary" className="bg-black/70 text-white">
                        <Clock className="w-3 h-3 mr-1" /> {c.durationMinutes} min
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">{c.title}</h3>
                    {c.category && (
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {c.category}
                      </Badge>
                    )}
                  </div>
                  {c.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {c.description}
                    </p>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => setOpenCourseId(c.id)}
                  >
                    {completed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Tonton Semula
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-4 h-4 mr-1" /> Tonton
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Video Dialog */}
      <Dialog open={!!openCourse} onOpenChange={(o) => !o && setOpenCourseId(null)}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="text-lg">{openCourse?.title}</DialogTitle>
            <DialogDescription className="text-xs">
              {openCourse?.category && <span className="mr-2">{openCourse.category}</span>}
              {openCourse?.durationMinutes && (
                <span>{openCourse.durationMinutes} minit</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video bg-black w-full">
            {openCourse && (
              <iframe
                src={toEmbedUrl(openCourse.videoUrl)}
                title={openCourse.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            )}
          </div>
          {openCourse && openCourse.description && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground">{openCourse.description}</p>
            </div>
          )}
          <DialogFooter className="p-4 pt-0 gap-2">
            <Button
              variant="outline"
              onClick={() => updateWatchedPercent(openCourse!.id, 50)}
              size="sm"
            >
              Tandai 50% ditonton
            </Button>
            <Button
              onClick={() => {
                if (openCourse) {
                  markComplete(openCourse.id)
                  setOpenCourseId(null)
                }
              }}
              disabled={
                markingId === openCourse?.id ||
                !!localProgress[openCourse?.id || '']?.completed
              }
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              {localProgress[openCourse?.id || '']?.completed
                ? 'Selesai'
                : 'Tandai Selesai'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
