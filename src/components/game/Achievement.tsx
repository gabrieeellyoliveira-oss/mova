import { Lock } from 'lucide-react'
import { Icon, type IconName } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

/** Conquista: desbloqueada (círculo colorido) ou ainda não (cinza, cadeado e progresso). */
export function Achievement({
  title, description, sprite, unlocked, current, target, size = 'md', onClick,
}: { title: string; description?: string; sprite: IconName; unlocked: boolean; current: number; target: number; size?: 'sm' | 'md'; onClick?: () => void }) {
  const pct = Math.min(100, (current / target) * 100)
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag type={onClick ? 'button' : undefined} onClick={onClick} className={cn('group flex flex-col items-center text-center', size === 'sm' ? 'gap-1.5' : 'gap-2', onClick && 'cursor-pointer rounded-2xl p-1 hover:bg-rosa-50')} title={description}>
      <div className={cn('relative grid place-items-center rounded-full transition-transform duration-200 group-hover:-translate-y-0.5', size === 'sm' ? 'h-14 w-14' : 'h-[72px] w-[72px]', unlocked ? 'bg-gradient-to-br from-rosa to-[#F6D9C9] shadow-soft' : 'bg-creme-100')}>
        <Icon name={sprite} size={size === 'sm' ? 24 : 30} className={unlocked ? 'text-vinho' : 'text-vinho/30'} />
        {!unlocked && <span className="absolute -bottom-0.5 -right-0.5 grid h-6 w-6 place-items-center rounded-full bg-white shadow-pixel-sm"><Lock size={12} className="text-vinho/50" /></span>}
      </div>
      <p className={cn('font-semibold leading-tight', size === 'sm' ? 'text-[11px]' : 'text-sm', unlocked ? 'text-tinta' : 'text-tinta/50')}>{title}</p>
      {size === 'md' && description && <p className="max-w-[150px] text-[11px] leading-snug text-tinta/55">{description}</p>}
      {!unlocked && size === 'md' && (
        <div className="w-full max-w-[100px]">
          <div className="h-1.5 overflow-hidden rounded-full bg-creme-200"><div className="h-full rounded-full bg-queimado" style={{ width: `${pct}%` }} /></div>
          <p className="mt-0.5 text-[10px] tabular-nums text-tinta/50">{Math.min(current, target)} / {target}</p>
        </div>
      )}
    </Tag>
  )
}
