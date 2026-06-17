'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaBookOpen, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner, FaStickyNote } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type Note = {
  id: number
  course_id: number
  course_name: string
  course_slug: string
  lesson_id: number | null
  content: string
  created_at: string
  updated_at: string
}

export default function NotasPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/v1/notes')
      .then(r => r.json())
      .then(d => { if (d.success) setNotes(d.data) })
      .finally(() => setLoading(false))
  }, [])

  function startEdit(note: Note) {
    setEditingId(note.id)
    setEditContent(note.content)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditContent('')
  }

  async function saveEdit(id: number) {
    if (!editContent.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/v1/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      })
      const data = await res.json()
      if (data.success) {
        setNotes(ns => ns.map(n => n.id === id ? { ...n, content: editContent, updated_at: new Date().toISOString() } : n))
        setEditingId(null)
      }
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete(id: number) {
    const res = await fetch(`/api/v1/notes/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) setNotes(ns => ns.filter(n => n.id !== id))
    setDeletingId(null)
  }

  /* Group notes by course */
  const byCourse = notes.reduce<Record<number, Note[]>>((acc, n) => {
    if (!acc[n.course_id]) acc[n.course_id] = []
    acc[n.course_id].push(n)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Mis notas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {notes.length} {notes.length === 1 ? 'nota' : 'notas'} en {Object.keys(byCourse).length} {Object.keys(byCourse).length === 1 ? 'curso' : 'cursos'}
          </p>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center gap-4">
          <FaStickyNote className="h-12 w-12 text-muted-foreground/30" />
          <div>
            <p className="font-medium text-lg">Sin notas todavía</p>
            <p className="text-muted-foreground text-sm mt-1">Tus notas de los cursos aparecerán aquí.</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/comprador/cursos">Ver mis cursos</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(byCourse).map(([courseId, courseNotes]) => {
            const first = courseNotes[0]
            return (
              <Card key={courseId}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <FaBookOpen className="h-4 w-4 text-primary shrink-0" />
                    <CardTitle className="text-base">
                      <Link href={`/dashboard/comprador/cursos/${first.course_slug}`}
                        className="hover:text-primary transition-colors">
                        {first.course_name}
                      </Link>
                    </CardTitle>
                    <Badge variant="secondary" className="ml-auto">{courseNotes.length} nota{courseNotes.length !== 1 ? 's' : ''}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 pt-0">
                  {courseNotes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-4">
                      {editingId === note.id ? (
                        <div className="flex flex-col gap-3">
                          <Textarea
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            className="min-h-[100px] resize-none"
                            maxLength={5000}
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={saving}>
                              <FaTimes className="h-3 w-3 mr-1" /> Cancelar
                            </Button>
                            <Button size="sm" onClick={() => saveEdit(note.id)} disabled={saving || !editContent.trim()}>
                              {saving ? <FaSpinner className="h-3 w-3 animate-spin mr-1" /> : <FaSave className="h-3 w-3 mr-1" />}
                              Guardar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm whitespace-pre-line leading-relaxed">{note.content}</p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-muted-foreground">
                              {new Date(note.updated_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => startEdit(note)} className="h-7 px-2 text-xs">
                                <FaEdit className="h-3 w-3 mr-1" /> Editar
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeletingId(note.id)}
                                className="h-7 px-2 text-xs text-destructive hover:text-destructive">
                                <FaTrash className="h-3 w-3 mr-1" /> Eliminar
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar nota?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingId && confirmDelete(deletingId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
