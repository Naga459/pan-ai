import { App } from 'antd'
import { useCallback } from 'react'
import { copyText } from '../lib/browser'

export function useCopy() {
  const { message } = App.useApp()
  return useCallback(
    async (text: string, label = 'Copied to clipboard') => {
      try {
        await copyText(text)
        message.success(label)
      } catch {
        message.error('Could not copy. Select the text and copy it manually.')
      }
    },
    [message],
  )
}
