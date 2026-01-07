// Utilities
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import type { CountdownEvent, AppSettings, DisplayFormat, RepeatType } from './types'

export const useAppStore = defineStore('app', {
  state: () => ({
    events: [] as CountdownEvent[],
    settings: {
      language: 'zh',
      theme: 'light',
      displayFormat: 'days',
      sync: {},
    } as AppSettings,
    initialized: false,
  }),

  actions: {
    init() {
      const savedEvents = localStorage.getItem('events')
      const savedSettings = localStorage.getItem('settings')
      if (savedEvents) this.events = JSON.parse(savedEvents)
      if (savedSettings) this.settings = { ...this.settings, ...JSON.parse(savedSettings) }
      this.initialized = true
    },

    save() {
      localStorage.setItem('events', JSON.stringify(this.events))
      localStorage.setItem('settings', JSON.stringify(this.settings))
    },

    addEvent(event: Omit<CountdownEvent, 'id' | 'createdAt'>) {
      const newEvent: CountdownEvent = {
        ...event,
        id: uuidv4(),
        createdAt: Date.now(),
      }
      this.events.push(newEvent)
      this.save()
    },

    updateEvent(event: CountdownEvent) {
      const index = this.events.findIndex(e => e.id === event.id)
      if (index !== -1) {
        this.events[index] = event
        this.save()
      }
    },

    deleteEvent(id: string) {
      this.events = this.events.filter(e => e.id !== id)
      this.save()
    },

    updateSettings(settings: Partial<AppSettings>) {
      this.settings = { ...this.settings, ...settings }
      this.save()
    },

    importEvents(events: CountdownEvent[]) {
      this.events = events
      this.save()
    }
  },
})
