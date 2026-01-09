import { log } from '@/utils/logger'

export function useClipboard() {
  async function copy(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return true
      }

      // Fallback for non-secure contexts
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        const successful = document.execCommand('copy')
        return successful
      } finally {
        document.body.removeChild(textArea)
      }
    } catch (err) {
      log.error('Copy failed:', err)
      return false
    }
  }

  async function copyToClipboard(text: string): Promise<boolean> {
    return copy(text)
  }

  return { copy, copyToClipboard }
}
