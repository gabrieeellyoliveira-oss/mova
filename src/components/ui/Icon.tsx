import { memo } from 'react'
import {
  BookOpen, Briefcase, Building2, CalendarDays, CalendarRange, CheckSquare, Coffee, Coins, Droplet, Dumbbell, GraduationCap,
  Heart, Home, Hourglass, Lock, Map, MapPin, Moon, NotebookPen, PiggyBank, Plus, Settings, Sparkles, Sprout, Star, Sun, Target,
  Trophy, User, Wallet, type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/cn'

/** Ícones do MOVA (linha fina, cor ameixa). Os nomes vêm da época dos sprites e continuam valendo. */
const ICONS = {
  home: Home, day: CalendarDays, planner: CalendarRange, briefcase: Briefcase, sun: Sun, target: Target, coins: Wallet,
  piggy: PiggyBank, laptop: GraduationCap, cherry: Sparkles, cherries: Sparkles, heart: Heart, book: BookOpen, map: Map, pin: MapPin,
  note: NotebookPen, trophy: Trophy, gear: Settings, hourglass: Hourglass, dumbbell: Dumbbell, drop: Droplet, moon: Moon,
  star: Star, lock: Lock, check: CheckSquare, cup: Coffee, tree: Sprout, sparkle: Sparkles, user: User, plus: Plus, city: Building2,
  money: Coins,
} satisfies Record<string, LucideIcon>

export type IconName = keyof typeof ICONS

export const Icon = memo(function Icon({ name, size = 22, className, title }: { name: IconName; size?: number; className?: string; title?: string }) {
  const C = ICONS[name] ?? Star
  return <C size={size} strokeWidth={1.8} className={cn('shrink-0 text-vinho', className)} aria-hidden={title ? undefined : true} aria-label={title} role={title ? 'img' : undefined} />
})
