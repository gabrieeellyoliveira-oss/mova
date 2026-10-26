import { linkedinStore } from '@/store/db'
import { monthKey, today } from '@/utils/date'
import type { LinkedInData } from '@/types'

/** Aceita linkedin.com/in/usuario (com ou sem https/www) e devolve o link completo. */
export function normalizeLinkedIn(input: string): string | null {
  const raw = input.trim().replace(/^(https?:\/\/)?(www\.|[a-z]{2}\.)?/i, '')
  const m = raw.match(/^linkedin\.com\/(in|company)\/([^/?#\s]+)/i)
  return m ? `https://www.linkedin.com/${m[1].toLowerCase()}/${m[2]}` : null
}

export const updateLinkedIn = (patch: Partial<LinkedInData>) =>
  linkedinStore.set({ ...linkedinStore.get(), ...patch, updatedAt: new Date().toISOString() })

export const logLinkedInPost = () => updateLinkedIn({ posts: [...linkedinStore.get().posts, today()] })
export const undoLinkedInPost = () => {
  const posts = [...linkedinStore.get().posts]
  const i = posts.lastIndexOf(today())
  if (i >= 0) posts.splice(i, 1)
  updateLinkedIn({ posts })
}
export const postsThisMonth = (d: LinkedInData) => d.posts.filter((p) => monthKey(p) === monthKey(today())).length
