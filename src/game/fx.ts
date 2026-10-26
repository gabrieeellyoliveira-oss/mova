/** Efeitos visuais globais (explosão de estrelas/pixels). */
export const burst = (x?: number, y?: number) =>
  window.dispatchEvent(new CustomEvent('mova:burst', { detail: { x, y } }))
