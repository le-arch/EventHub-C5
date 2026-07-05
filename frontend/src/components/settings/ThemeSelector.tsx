'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { Card } from '@/components/ui/card'

const themes = [
  { value: 'light', label: 'Light', icon: Sun, description: 'Bright and clean interface' },
  { value: 'dark', label: 'Dark', icon: Moon, description: 'Easy on the eyes at night' },
  { value: 'system', label: 'System', icon: Monitor, description: 'Follows your system preference' },
] as const

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {themes.map(({ value, label, icon: Icon, description }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className="text-left focus:outline-none"
        >
          <Card
            className={`
              relative p-5 h-full cursor-pointer border-2 transition-all duration-200
              ${theme === value
                ? 'border-indigo-500 bg-indigo-50/50 shadow-md'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }
            `}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className={`
                p-3 rounded-xl transition-colors
                ${theme === value
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-slate-50 text-slate-400'
                }
              `}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className={`font-semibold text-sm ${theme === value ? 'text-indigo-700' : 'text-slate-800'}`}>
                  {label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
              </div>
            </div>
            {theme === value && (
              <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-indigo-500" />
            )}
          </Card>
        </button>
      ))}
    </div>
  )
}
