import { PageHeader }        from '@/components/shared/PageHeader'
import { NotificationList }  from '@/components/modules/notification/NotificationList'

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifikasi"
        description="Semua notifikasi aktivitas sistem yang ditujukan kepada Anda."
      />
      <NotificationList />
    </div>
  )
}
