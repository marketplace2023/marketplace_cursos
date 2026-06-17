'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { FaArrowLeft, FaPlus, FaTrash, FaGripVertical, FaVideo, FaFileAlt, FaChevronDown } from 'react-icons/fa'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface Lesson { id: number; name: string; slide_type: string; duration: number; sort_order: number }
interface Module { id: number; name: string; sort_order: number; slides: Lesson[] }

export default function ContenidoCursoPage() {
  const { id } = useParams<{ id: string }>()
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [courseName, setCourseName] = useState('')

  /* New module dialog */
  const [modDialog, setModDialog] = useState(false)
  const [modName, setModName] = useState('')

  /* New lesson dialog */
  const [lesDialog, setLesDialog] = useState<number | null>(null)
  const [lesForm, setLesForm] = useState({ name: '', slide_type: 'video', duration: '0', content_url: '' })

  useEffect(() => {
    fetch(`/api/v1/courses/${id}`).then(r => r.json()).then(d => {
      setCourseName(d.course?.name ?? '')
      setModules(d.course?.modules ?? [])
      setLoading(false)
    })
  }, [id])

  async function addModule() {
    if (!modName.trim()) return
    const res = await fetch(`/api/v1/admin/courses/${id}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modName.trim(), sort_order: modules.length }),
    })
    if (res.ok) {
      const data = await res.json()
      setModules(prev => [...prev, { ...data.data, slides: [] }])
      setModName('')
      setModDialog(false)
    }
  }

  async function deleteModule(moduleId: number) {
    await fetch(`/api/v1/admin/courses/${id}/modules/${moduleId}`, { method: 'DELETE' })
    setModules(prev => prev.filter(m => m.id !== moduleId))
  }

  async function addLesson(moduleId: number) {
    const res = await fetch(`/api/v1/admin/courses/${id}/modules/${moduleId}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: lesForm.name.trim(),
        slide_type: lesForm.slide_type,
        duration: Number(lesForm.duration),
        content_url: lesForm.content_url.trim() || null,
        sort_order: modules.find(m => m.id === moduleId)?.slides.length ?? 0,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setModules(prev => prev.map(m => m.id === moduleId ? { ...m, slides: [...m.slides, data.data] } : m))
      setLesForm({ name: '', slide_type: 'video', duration: '0', content_url: '' })
      setLesDialog(null)
    }
  }

  async function deleteLesson(moduleId: number, lessonId: number) {
    await fetch(`/api/v1/admin/courses/${id}/lessons/${lessonId}`, { method: 'DELETE' })
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, slides: m.slides.filter(s => s.id !== lessonId) } : m))
  }

  const ICONS: Record<string, React.ReactNode> = {
    video: <FaVideo className="h-3 w-3" />,
    text: <FaFileAlt className="h-3 w-3" />,
  }

  if (loading) return (
    <div className="flex flex-col gap-4">
      {[1, 2].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
    </div>
  )

  const totalLessons = modules.reduce((a, m) => a + m.slides.length, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/dashboard/tienda/cursos/${id}`}><FaArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-heading font-bold line-clamp-1">{courseName}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{modules.length} módulos · {totalLessons} lecciones</p>
        </div>
        <Dialog open={modDialog} onOpenChange={setModDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
              <FaPlus className="h-4 w-4" />Nuevo módulo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Nuevo módulo</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex flex-col gap-1.5">
                <Label>Nombre del módulo</Label>
                <Input value={modName} onChange={e => setModName(e.target.value)} placeholder="Ej: Introducción" />
              </div>
              <Button onClick={addModule} className="bg-brand-green hover:bg-brand-green-dark text-white">Crear módulo</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {modules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FaVideo className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="font-semibold mb-1">Sin módulos aún</p>
          <p className="text-sm text-muted-foreground mb-4">Crea módulos para organizar las lecciones de tu curso</p>
          <Button onClick={() => setModDialog(true)} className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
            <FaPlus className="h-4 w-4" />Crear primer módulo
          </Button>
        </div>
      ) : (
        <Accordion type="multiple" defaultValue={modules.map(m => String(m.id))}>
          {modules.map((mod, mi) => (
            <AccordionItem key={mod.id} value={String(mod.id)}>
              <Card className="mb-3 overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-3 text-left w-full">
                    <FaGripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                    <span className="font-semibold text-sm flex-1">{mod.name}</span>
                    <Badge variant="secondary" className="text-xs mr-2">{mod.slides.length} lecciones</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 pb-4 flex flex-col gap-2">
                    {mod.slides.map(lesson => (
                      <div key={lesson.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50">
                        <FaGripVertical className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                        <span className="text-muted-foreground shrink-0">{ICONS[lesson.slide_type] ?? <FaVideo className="h-3 w-3" />}</span>
                        <p className="text-sm flex-1 truncate">{lesson.name}</p>
                        {lesson.duration > 0 && (
                          <span className="text-xs text-muted-foreground shrink-0">{Math.floor(lesson.duration / 60)}:{String(lesson.duration % 60).padStart(2, '0')}</span>
                        )}
                        <Button type="button" variant="ghost" size="sm" onClick={() => deleteLesson(mod.id, lesson.id)}>
                          <FaTrash className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <Dialog open={lesDialog === mod.id} onOpenChange={o => setLesDialog(o ? mod.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1 text-xs">
                            <FaPlus className="h-3 w-3" />Añadir lección
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader><DialogTitle>Nueva lección</DialogTitle></DialogHeader>
                          <div className="flex flex-col gap-3 mt-2">
                            <div className="flex flex-col gap-1.5">
                              <Label>Nombre</Label>
                              <Input value={lesForm.name} onChange={e => setLesForm(p => ({ ...p, name: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1.5">
                                <Label>Tipo</Label>
                                <Select value={lesForm.slide_type} onValueChange={v => setLesForm(p => ({ ...p, slide_type: v }))}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="text">Texto</SelectItem>
                                    <SelectItem value="quiz">Quiz</SelectItem>
                                    <SelectItem value="file">Archivo</SelectItem>
                                    <SelectItem value="live">En vivo</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <Label>Duración (seg)</Label>
                                <Input type="number" value={lesForm.duration} onChange={e => setLesForm(p => ({ ...p, duration: e.target.value }))} />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <Label>URL del contenido</Label>
                              <Input value={lesForm.content_url} onChange={e => setLesForm(p => ({ ...p, content_url: e.target.value }))} placeholder="https://…" />
                            </div>
                            <Button onClick={() => addLesson(mod.id)} className="bg-brand-green hover:bg-brand-green-dark text-white">Crear lección</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="sm" className="gap-1 text-xs text-destructive" onClick={() => deleteModule(mod.id)}>
                        <FaTrash className="h-3 w-3" />Eliminar módulo
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}
