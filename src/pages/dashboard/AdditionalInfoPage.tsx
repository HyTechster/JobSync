import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { Icons } from '../../components/ui/Icons'

// ─── Timezone data ────────────────────────────────────────────────────────────

interface TZEntry { iana: string; city: string }

const RAW_ZONES: TZEntry[] = [
  { iana: 'Etc/GMT+12',                       city: 'Baker Island'        },
  { iana: 'Pacific/Pago_Pago',                city: 'Pago Pago'           },
  { iana: 'Pacific/Niue',                     city: 'Niue'                },
  { iana: 'Pacific/Honolulu',                 city: 'Honolulu'            },
  { iana: 'Pacific/Tahiti',                   city: 'Tahiti'              },
  { iana: 'Pacific/Marquesas',                city: 'Marquesas'           },
  { iana: 'America/Anchorage',                city: 'Anchorage'           },
  { iana: 'America/Juneau',                   city: 'Juneau'              },
  { iana: 'Pacific/Gambier',                  city: 'Gambier'             },
  { iana: 'America/Los_Angeles',              city: 'Los Angeles'         },
  { iana: 'America/Vancouver',                city: 'Vancouver'           },
  { iana: 'America/Tijuana',                  city: 'Tijuana'             },
  { iana: 'America/Denver',                   city: 'Denver'              },
  { iana: 'America/Phoenix',                  city: 'Phoenix'             },
  { iana: 'America/Edmonton',                 city: 'Calgary'             },
  { iana: 'America/Chicago',                  city: 'Chicago'             },
  { iana: 'America/Mexico_City',              city: 'Mexico City'         },
  { iana: 'America/Guatemala',                city: 'Guatemala City'      },
  { iana: 'America/New_York',                 city: 'New York'            },
  { iana: 'America/Toronto',                  city: 'Toronto'             },
  { iana: 'America/Lima',                     city: 'Lima'                },
  { iana: 'America/Halifax',                  city: 'Halifax'             },
  { iana: 'America/Caracas',                  city: 'Caracas'             },
  { iana: 'America/La_Paz',                   city: 'La Paz'              },
  { iana: 'America/St_Johns',                 city: "St. John's"          },
  { iana: 'America/Sao_Paulo',                city: 'São Paulo'           },
  { iana: 'America/Argentina/Buenos_Aires',   city: 'Buenos Aires'        },
  { iana: 'America/Santiago',                 city: 'Santiago'            },
  { iana: 'America/Noronha',                  city: 'Fernando de Noronha' },
  { iana: 'Atlantic/South_Georgia',           city: 'South Georgia'       },
  { iana: 'Atlantic/Azores',                  city: 'Azores'              },
  { iana: 'Atlantic/Cape_Verde',              city: 'Cape Verde'          },
  { iana: 'Europe/London',                    city: 'London'              },
  { iana: 'Europe/Dublin',                    city: 'Dublin'              },
  { iana: 'Atlantic/Reykjavik',               city: 'Reykjavik'           },
  { iana: 'Europe/Paris',                     city: 'Paris'               },
  { iana: 'Europe/Berlin',                    city: 'Berlin'              },
  { iana: 'Africa/Lagos',                     city: 'Lagos'               },
  { iana: 'Africa/Cairo',                     city: 'Cairo'               },
  { iana: 'Africa/Johannesburg',              city: 'Johannesburg'        },
  { iana: 'Europe/Helsinki',                  city: 'Helsinki'            },
  { iana: 'Europe/Moscow',                    city: 'Moscow'              },
  { iana: 'Asia/Riyadh',                      city: 'Riyadh'              },
  { iana: 'Africa/Nairobi',                   city: 'Nairobi'             },
  { iana: 'Asia/Tehran',                      city: 'Tehran'              },
  { iana: 'Asia/Dubai',                       city: 'Dubai'               },
  { iana: 'Asia/Baku',                        city: 'Baku'                },
  { iana: 'Asia/Tbilisi',                     city: 'Tbilisi'             },
  { iana: 'Asia/Kabul',                       city: 'Kabul'               },
  { iana: 'Asia/Karachi',                     city: 'Karachi'             },
  { iana: 'Asia/Tashkent',                    city: 'Tashkent'            },
  { iana: 'Asia/Yekaterinburg',               city: 'Yekaterinburg'       },
  { iana: 'Asia/Kolkata',                     city: 'Mumbai'              },
  { iana: 'Asia/Colombo',                     city: 'Colombo'             },
  { iana: 'Asia/Kathmandu',                   city: 'Kathmandu'           },
  { iana: 'Asia/Dhaka',                       city: 'Dhaka'               },
  { iana: 'Asia/Almaty',                      city: 'Almaty'              },
  { iana: 'Asia/Bishkek',                     city: 'Bishkek'             },
  { iana: 'Asia/Yangon',                      city: 'Yangon'              },
  { iana: 'Indian/Cocos',                     city: 'Cocos Islands'       },
  { iana: 'Asia/Bangkok',                     city: 'Bangkok'             },
  { iana: 'Asia/Jakarta',                     city: 'Jakarta'             },
  { iana: 'Asia/Ho_Chi_Minh',                 city: 'Ho Chi Minh City'    },
  { iana: 'Asia/Kuala_Lumpur',                city: 'Kuala Lumpur'        },
  { iana: 'Asia/Singapore',                   city: 'Singapore'           },
  { iana: 'Asia/Shanghai',                    city: 'Beijing'             },
  { iana: 'Australia/Eucla',                  city: 'Eucla'               },
  { iana: 'Asia/Tokyo',                       city: 'Tokyo'               },
  { iana: 'Asia/Seoul',                       city: 'Seoul'               },
  { iana: 'Asia/Yakutsk',                     city: 'Yakutsk'             },
  { iana: 'Australia/Adelaide',               city: 'Adelaide'            },
  { iana: 'Australia/Darwin',                 city: 'Darwin'              },
  { iana: 'Australia/Sydney',                 city: 'Sydney'              },
  { iana: 'Australia/Brisbane',               city: 'Brisbane'            },
  { iana: 'Pacific/Guam',                     city: 'Guam'                },
  { iana: 'Australia/Lord_Howe',              city: 'Lord Howe Island'    },
  { iana: 'Pacific/Noumea',                   city: 'Nouméa'              },
  { iana: 'Asia/Vladivostok',                 city: 'Vladivostok'         },
  { iana: 'Pacific/Guadalcanal',              city: 'Honiara'             },
  { iana: 'Pacific/Auckland',                 city: 'Auckland'            },
  { iana: 'Pacific/Fiji',                     city: 'Suva'                },
  { iana: 'Asia/Kamchatka',                   city: 'Petropavlovsk'       },
  { iana: 'Pacific/Chatham',                  city: 'Chatham Islands'     },
  { iana: 'Pacific/Apia',                     city: 'Apia'                },
  { iana: 'Pacific/Tongatapu',                city: "Nuku'alofa"          },
  { iana: 'Pacific/Fakaofo',                  city: 'Tokelau'             },
  { iana: 'Pacific/Kiritimati',               city: 'Kiritimati'          },
]

function computeOffset(iana: string): { label: string; minutes: number } {
  try {
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: iana,
      timeZoneName: 'shortOffset',
    }).formatToParts(new Date())
    const raw = parts.find(p => p.type === 'timeZoneName')?.value ?? 'GMT'
    const m = raw.match(/GMT([+-])(\d+)(?::(\d+))?/)
    if (!m) return { label: 'UTC+0', minutes: 0 }
    const sign = m[1] === '+' ? 1 : -1
    const h = parseInt(m[2])
    const min = parseInt(m[3] ?? '0')
    const totalMin = sign * (h * 60 + min)
    const absH = Math.floor(Math.abs(totalMin) / 60)
    const absM = Math.abs(totalMin) % 60
    const label = `UTC${sign >= 0 ? '+' : '-'}${absH}${absM ? ':' + String(absM).padStart(2, '0') : ''}`
    return { label, minutes: totalMin }
  } catch {
    return { label: 'UTC+0', minutes: 0 }
  }
}

interface TZOption extends TZEntry {
  offsetLabel: string
  offsetMinutes: number
}

const TIMEZONE_OPTIONS: TZOption[] = RAW_ZONES.map(z => {
  const { label, minutes } = computeOffset(z.iana)
  return { ...z, offsetLabel: label, offsetMinutes: minutes }
}).sort((a, b) => a.offsetMinutes - b.offsetMinutes)

const LANGUAGES = [
  { value: 'en',    label: 'English'         },
  { value: 'ms',    label: 'Bahasa Malaysia' },
  { value: 'zh-CN', label: '中文 (简体)'      },
]

// ─── Timezone combobox ────────────────────────────────────────────────────────

function TimezoneCombobox({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen]   = useState(false)
  const ref               = useRef<HTMLDivElement>(null)
  const inputRef          = useRef<HTMLInputElement>(null)

  const selected = useMemo(
    () => TIMEZONE_OPTIONS.find(o => o.iana === value),
    [value]
  )

  const filtered = useMemo(() => {
    if (!query) return TIMEZONE_OPTIONS
    const q = query.toLowerCase()
    return TIMEZONE_OPTIONS.filter(
      o =>
        o.city.toLowerCase().includes(q) ||
        o.offsetLabel.toLowerCase().includes(q) ||
        o.iana.toLowerCase().includes(q)
    )
  }, [query])

  useEffect(() => {
    if (!open) return
    function handler(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [open])

  function select(tz: string) {
    onChange(tz)
    setOpen(false)
    setQuery('')
    inputRef.current?.blur()
  }

  return (
    <div ref={ref} className="relative">
      <div
        className={`flex items-center h-10 border rounded-lg bg-white transition-all ${
          open
            ? 'border-brand-700 ring-[3px] ring-brand-700/10'
            : 'border-slate-200'
        }`}
      >
        <Icons.globe size={15} color="#64748B" className="ml-3 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={open ? query : (selected?.city ?? value)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => { setOpen(true); setQuery('') }}
          placeholder="Search city or timezone…"
          className="flex-1 min-w-0 px-2.5 text-[13.5px] text-text-base bg-transparent outline-none"
          autoComplete="off"
          spellCheck={false}
          aria-label="Timezone"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        {selected && !open && (
          <span className="mr-2 text-[11px] font-medium text-text-muted bg-slate-100 rounded px-1.5 py-0.5 flex-shrink-0">
            {selected.offsetLabel}
          </span>
        )}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
          className={`mr-3 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-y-auto"
          style={{ maxHeight: '220px' }}
        >
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-[13px] text-text-muted">No timezones found</p>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.iana}
                type="button"
                role="option"
                aria-selected={opt.iana === value}
                onClick={() => select(opt.iana)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2 text-[13px] transition-colors ${
                  opt.iana === value
                    ? 'font-semibold text-brand-700 bg-brand-50'
                    : 'text-text-base hover:bg-surface-2'
                }`}
              >
                <span className="truncate">{opt.city}</span>
                <span className={`text-[11px] font-medium flex-shrink-0 ${
                  opt.iana === value ? 'text-brand-600' : 'text-text-muted'
                }`}>
                  {opt.offsetLabel}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdditionalInfoPage() {
  const navigate   = useNavigate()
  const session    = useAuthStore((s) => s.session)
  const profile    = useAuthStore((s) => s.profile)
  const setProfile = useAuthStore((s) => s.setProfile)

  const [timezone, setTimezone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone
  )
  const [language, setLanguage] = useState('en')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    if (!session) navigate('/login', { replace: true })
  }, [session, navigate])

  async function handleContinue() {
    if (!session) return
    setIsSaving(true)
    setError('')
    try {
      const existing    = (profile?.preferences as Record<string, unknown>) ?? {}
      const preferences = { ...existing, timezone, language }

      const { data: updated, error: err } = await supabase
        .from('profiles')
        .update({ preferences })
        .eq('id', session.user.id)
        .select()
        .single()
      if (err) throw err

      if (updated && profile) setProfile({ ...profile, preferences: updated.preferences })
      navigate('/dashboard/select-organization', { replace: true })
    } catch {
      setError('Failed to save preferences. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen md:grid md:grid-cols-[1.05fr_1fr]">
      {/* ── Brand panel (desktop only) ── */}
      <div className="hidden md:flex flex-col justify-between bg-brand-900 p-12 text-white">
        <div className="flex items-center gap-2.5">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="28" height="28" rx="8" fill="#fff" fillOpacity=".12" />
            <path d="M10 11.5h12M10 16h8M10 20.5h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="22" cy="20.5" r="1.6" fill="#fff" />
          </svg>
          <span className="text-xl font-bold tracking-tight">JobSync</span>
        </div>
        <div>
          <blockquote className="text-[15px] leading-relaxed text-brand-200 mb-6">
            "Setting your timezone ensures job schedules, submitted timestamps, and reports all display in the right local time — no confusion between field and office."
          </blockquote>
          <div>
            <p className="text-sm font-semibold">Why this matters</p>
            <p className="text-xs text-brand-300 mt-0.5">Accurate timestamps keep your team aligned across locations.</p>
          </div>
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="flex flex-col justify-center px-6 py-10 bg-white md:px-14">
        <div className="w-full max-w-sm mx-auto">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-brand-700 text-white text-[10px] font-bold flex items-center justify-center">
                <Icons.check size={12} />
              </span>
              <span className="text-[12px] text-text-muted font-medium">Account</span>
            </div>
            <div className="flex-1 h-px bg-brand-700" />
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-brand-700 text-white text-[10px] font-bold flex items-center justify-center">
                2
              </span>
              <span className="text-[12px] text-brand-700 font-semibold">Preferences</span>
            </div>
          </div>

          <h1 className="text-[24px] font-bold text-text-base mb-1 leading-tight">
            Almost done
          </h1>
          <p className="text-[13.5px] text-text-muted mb-7 leading-relaxed">
            Set your timezone and language so JobSync displays dates and times correctly for you.
          </p>

          <div className="space-y-5">
            {/* Timezone */}
            <div>
              <label className="block text-[13px] font-semibold text-text-base mb-1.5">
                Timezone
              </label>
              <TimezoneCombobox value={timezone} onChange={setTimezone} />
              <p className="text-[11.5px] text-text-muted mt-1.5">
                Auto-detected from your browser · affects all timestamps in the app
              </p>
            </div>

            {/* Language */}
            <div>
              <label htmlFor="language" className="block text-[13px] font-semibold text-text-base mb-1.5">
                Language
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-[13.5px] text-text-base bg-white outline-none focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all appearance-none"
              >
                {LANGUAGES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-[13px] text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={() => void handleContinue()}
              disabled={isSaving}
              className="w-full h-11 rounded-xl bg-brand-700 text-white text-[14px] font-semibold hover:bg-brand-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                'Continue →'
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard/select-organization', { replace: true })}
              className="w-full text-center text-[13px] text-text-muted hover:text-text-base transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
