import { userDelete } from '@/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { useLanguage } from '@/context/LanguageContext'
import { useEffect, useState } from 'react'

type DeleteUserProps = {
  user: { userId: string; username: string }
  onDismiss: () => void
}
export const DeleteUser = ({ user: { userId, username }, onDismiss }: DeleteUserProps) => {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [open, setOpen] = useState<boolean>(false)
  const onYesEvent = async () => {
    try {
      await userDelete({
        path: { id: userId },
      })
      toast({
        title: t('common.success'),
        description: t('user.deleteSuccess', { name: username }),
      })
      onDismiss()
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast({
          title: t('common.error'),
          description: t('user.deleteError', { name: username }),
          variant: 'destructive',
        })
      }
    }
  }

  useEffect(() => {
    setOpen(true)
  }, [])

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('user.areYouSure')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('user.deleteConfirm', { name: username })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDismiss}>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onYesEvent}>{t('common.yes')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
