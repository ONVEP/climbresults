import { post } from '#lib/api'
import { createSignal, Show, type Component } from 'solid-js'

export const TestNotificationButton: Component = () => {
  const [isSendingTestNotification, setIsSendingTestNotification] = createSignal(false)
  const [sendNotificationMessage, setSendNotificationMessage] = createSignal<string | null>(null)

  const handleSendTestNotification = async () => {
    setIsSendingTestNotification(true)
    setSendNotificationMessage(null)

    try {
      await post('/api/config/test-notification', {})
      setSendNotificationMessage('Notification de test envoyee.')
    } catch (error) {
      setSendNotificationMessage("Impossible d'envoyer la notification de test.")
    } finally {
      setIsSendingTestNotification(false)
    }
  }

  return (
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <button
        class="btn btn-outline btn-sm"
        onClick={handleSendTestNotification}
        disabled={isSendingTestNotification()}
      >
        {isSendingTestNotification() ? 'Envoi...' : 'Envoyer une notification de test'}
      </button>
      <Show when={sendNotificationMessage()}>
        {(message) => <span class="text-sm text-base-content/80">{message()}</span>}
      </Show>
    </div>
  )
}
