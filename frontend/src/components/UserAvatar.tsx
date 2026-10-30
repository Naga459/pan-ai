import { Avatar } from 'antd'
import { DEMO_USER } from '../features/chat/demoUser'

export function UserAvatar({ size = 36 }: { size?: number }) {
  return (
    <Avatar size={size} className="!shrink-0 !bg-indigo-500 !font-semibold" aria-label={DEMO_USER.name}>
      {DEMO_USER.initials}
    </Avatar>
  )
}
