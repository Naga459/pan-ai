import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from 'react'

const STICK_THRESHOLD_PX = 160

function scrollToBottom(el: HTMLElement, smooth: boolean) {
  if (typeof el.scrollTo === 'function') {
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  } else {
    el.scrollTop = el.scrollHeight
  }
}

/**
 * Keeps a chat scroll container pinned to the newest message while the reader is near the
 * bottom. Switching conversations jumps to the end of long chats and the top of short ones.
 */
export function useAutoScroll(
  ref: RefObject<HTMLElement | null>,
  conversationKey: string | null,
  messageCount: number,
  contentSignature: string,
) {
  const stickRef = useRef(true)
  const positionedKey = useRef<string | null | undefined>(undefined)

  const onScroll = useCallback(() => {
    const el = ref.current
    if (!el) return
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD_PX
  }, [ref])

  useLayoutEffect(() => {
    const el = ref.current
    // Position once per conversation switch, not on every new message.
    if (!el || positionedKey.current === conversationKey) return
    positionedKey.current = conversationKey
    const long = messageCount > 2
    if (long) {
      scrollToBottom(el, false)
    } else {
      el.scrollTop = 0
    }
    stickRef.current = long
  }, [ref, conversationKey, messageCount])

  const previousCount = useRef(messageCount)
  useEffect(() => {
    const el = ref.current
    const grew = messageCount > previousCount.current
    previousCount.current = messageCount
    if (!el) return
    if (grew) stickRef.current = true
    if (stickRef.current && (grew || contentSignature)) scrollToBottom(el, true)
  }, [ref, messageCount, contentSignature])

  return onScroll
}
