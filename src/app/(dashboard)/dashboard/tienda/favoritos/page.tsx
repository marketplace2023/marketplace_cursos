'use client'

import { FaHeart } from 'react-icons/fa'
import { Card, CardContent } from '@/components/ui/card'

export default function TiendaFavoritosPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
        <FaHeart className="text-rose-500 h-5 w-5" /> Favoritos
      </h1>
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          No tienes cursos guardados como favoritos.
        </CardContent>
      </Card>
    </div>
  )
}
