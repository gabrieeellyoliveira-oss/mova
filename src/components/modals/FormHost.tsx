import { closeForm, useOpenForm } from '@/hooks/useQuickAdd'
import { EventForm } from './EventForm'
import { TaskForm } from './TaskForm'
import { TransactionForm } from './TransactionForm'
import { VaultEntryForm } from './VaultEntryForm'
import { BookForm } from './BookForm'

/** Renderiza o formulário global aberto via `openForm()` */
export function FormHost() {
  const open = useOpenForm()
  if (!open) return null
  // `key` garante estado limpo a cada abertura
  const key = JSON.stringify(open.initial ?? {}) + open.kind
  const props = { initial: open.initial as never, onClose: closeForm }
  switch (open.kind) {
    case 'event': return <EventForm key={key} {...props} />
    case 'task': return <TaskForm key={key} {...props} />
    case 'transaction': return <TransactionForm key={key} {...props} />
    case 'deposit': return <VaultEntryForm key={key} {...props} />
    case 'book': return <BookForm key={key} {...props} />
  }
}
