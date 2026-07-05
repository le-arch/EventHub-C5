'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

interface EventReminder {
  eventId: string
  eventTitle: string
  eventDate: string
  remindAt: number
}

const STORAGE_KEY = 'eventhub_reminders'

function loadReminders(): EventReminder[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveReminders(reminders: EventReminder[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
  } catch {}
}

export function useEventReminder(eventId: string, eventTitle: string, eventDate: string) {
  const [reminderSet, setReminderSet] = useState(false)

  useEffect(() => {
    const reminders = loadReminders()
    setReminderSet(reminders.some(r => r.eventId === eventId))
  }, [eventId])

  useEffect(() => {
    const reminders = loadReminders()
    const now = Date.now()

    for (const reminder of reminders) {
      const delay = reminder.remindAt - now
      if (delay <= 0) {
        // Past reminder — clean up
        const updated = reminders.filter(r => r.remindAt > now)
        saveReminders(updated)
        continue
      }

      const timer = setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification('Event Reminder', {
            body: `"${reminder.eventTitle}" starts in 1 hour!`,
            icon: '/images/logo.svg',
          })
        }
        // Remove after firing
        const updated = loadReminders().filter(r => r.eventId !== reminder.eventId)
        saveReminders(updated)
        setReminderSet(false)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [eventId, reminderSet])

  const setReminder = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications are not supported in this browser')
      return
    }

    if (Notification.permission === 'denied') {
      toast.error('Notification permission was denied. Please enable it in your browser settings.')
      return
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error('Notification permission was denied')
        return
      }
    }

    const eventTime = new Date(eventDate).getTime()
    const remindAt = eventTime - 60 * 60 * 1000 // 1 hour before

    if (remindAt <= Date.now()) {
      toast.error('This event has already started or is too soon')
      return
    }

    const reminder: EventReminder = {
      eventId,
      eventTitle,
      eventDate,
      remindAt,
    }

    const reminders = loadReminders()
    reminders.push(reminder)
    saveReminders(reminders)
    setReminderSet(true)

    // Schedule the notification
    const delay = remindAt - Date.now()
    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification('Event Reminder', {
          body: `"${eventTitle}" starts in 1 hour!`,
          icon: '/images/logo.svg',
        })
      }
      const updated = loadReminders().filter(r => r.eventId !== eventId)
      saveReminders(updated)
      setReminderSet(false)
    }, delay)

    toast.success(`Reminder set for "${eventTitle}"`)
  }, [eventId, eventTitle, eventDate])

  const clearReminder = useCallback(() => {
    const reminders = loadReminders().filter(r => r.eventId !== eventId)
    saveReminders(reminders)
    setReminderSet(false)
    toast.success('Reminder cancelled')
  }, [eventId])

  return { reminderSet, setReminder, clearReminder }
}
