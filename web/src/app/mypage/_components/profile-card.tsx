'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ProfileEditModal } from './profile-edit-modal'

type ProfileCardProps = {
  name: string
  email: string
}

export function ProfileCard({ name, email }: ProfileCardProps) {
  const [open, setOpen] = useState(false)
  const handleOpen = useCallback(() => setOpen(true), [])
  const handleClose = useCallback(() => setOpen(false), [])

  return (
    <div className="bg-card space-y-4 rounded-lg border p-6">
      <div>
        <p className="text-muted-foreground text-sm">名前</p>
        <p className="text-lg font-semibold">{name}</p>
      </div>
      <div>
        <p className="text-muted-foreground text-sm">メールアドレス</p>
        <p className="text-lg font-semibold">{email}</p>
      </div>
      <div className="pt-2">
        <Button
          type="button"
          onClick={handleOpen}
          className="rounded-full border border-transparent bg-[#8FCBAB] px-6 py-2 text-slate-900 shadow-lg hover:bg-[#7BB898] hover:shadow-xl"
        >
          プロフィールを編集
        </Button>
      </div>

      <ProfileEditModal
        open={open}
        onClose={handleClose}
        name={name}
        email={email}
      />
    </div>
  )
}
