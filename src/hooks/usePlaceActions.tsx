import { useState } from 'react'
import type { Experience, Place, PlaceStatus } from '@/types'
import { db } from '@/store/db'
import { today } from '@/utils/date'
import { openForm } from '@/hooks/useQuickAdd'
import { celebrate } from '@/hooks/useToast'
import { ExperienceForm } from '@/components/places/ExperienceForm'

/** Troca de status de um lugar (planejar abre o formulário; "fui" desbloqueia uma memória). */
export function usePlaceActions() {
  const [memory, setMemory] = useState<Partial<Experience> | null>(null)
  const changeStatus = (p: Place, s: PlaceStatus) => {
    if (s === 'planejado') {
      openForm('place', { ...p, status: 'planejado', plannedFor: p.plannedFor ?? today(), plannedTime: p.plannedTime ?? '17:00' } as never)
      return
    }
    db.places.update(p.id, { status: s })
    if (s === 'fui' && p.status !== 'fui') {
      celebrate.place()
      setMemory({ placeId: p.id, title: p.name, spent: p.price })
    }
  }
  const memoryForm = memory ? <ExperienceForm initial={memory} onClose={() => setMemory(null)} /> : null
  return { changeStatus, openMemory: setMemory, memoryForm }
}
