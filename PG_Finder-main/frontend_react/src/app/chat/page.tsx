'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useChatStore } from '@/lib/store'
import { apiClient } from '@/lib/api'
import { Send, MapPin, Star, Heart, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const PGMap = dynamic(() => import('@/components/common/PGMap'), { ssr: false })

export default function ChatPage() {
  const router = useRouter()
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const {
    sessionId,
    messages,
    isLoading,
    error,
    recommendations,
    setSessionId,
    addMessage,
    sendMessage,
    setRecommendations,
  } = useChatStore()

  const [inputValue, setInputValue] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isFetchingDetails, setIsFetchingDetails] = useState(false)

  const initialized = useRef(false)

  useEffect(() => { setMounted(true) }, [])

  // Initialize session on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const initSession = async () => {
      try {
        const data = await apiClient.getNewSession()
        setSessionId(data.session_id)
        if (data.greeting && messages.length === 0) {
          addMessage('assistant', data.greeting)
        }
      } catch (error) {
        toast.error('Failed to start chat session')
      }
    }

    if (!sessionId) {
      initSession()
    }
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetch PG details when recommendations change
  useEffect(() => {
    if (recommendations.length === 0) {
      setResults([])
      return
    }

    const fetchPGs = async () => {
      setIsFetchingDetails(true)
      try {
        const pgList = await Promise.all(
          recommendations.map((id) =>
            apiClient.getPGDetails(id).catch(() => null)
          )
        )
        setResults(pgList.filter(Boolean))
      } catch {
        // partial results still show
      } finally {
        setIsFetchingDetails(false)
      }
    }

    fetchPGs()
  }, [recommendations])

  const handleQuickReply = useCallback(async (text: string) => {
    setInputValue('')
    const ids = await sendMessage(text)
    if (ids.length > 0) {
      setRecommendations(ids)
    }
  }, [sendMessage, setRecommendations])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !sessionId) return

    const message = inputValue.trim()
    setInputValue('')

    const ids = await sendMessage(message)
    if (ids.length > 0) {
      setRecommendations(ids)
    }
  }

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[60fr_40fr] gap-0 h-[calc(100vh-60px)] bg-card">
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-muted text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[60fr_40fr] gap-0 h-[calc(100vh-60px)] bg-card">
      {/* Chat Panel */}
      <div className="flex flex-col border-r border-current border-opacity-[0.09]">
        {/* Chat Header */}
        <div className="border-b border-current border-opacity-[0.09] p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center font-syne font-bold text-white text-xs">
            PB
          </div>
          <div>
            <h3 className="font-syne text-sm font-bold">PG Buddy</h3>
            <p className="text-xs text-muted">Online • Ready to help</p>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full ml-auto flex-shrink-0"></div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center text-2xl">🏠</div>
              <p className="font-syne font-bold text-sm">Your matches appear here</p>
              <p className="text-xs text-muted leading-relaxed">
                Tell PG Buddy what you need — area, budget, and preferences — and we'll find your perfect fit.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed break-words ${
                      msg.role === 'user'
                        ? 'bg-accent text-white rounded-br-sm'
                        : 'bg-surface text-ink rounded-bl-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{renderMessage(msg.content)}</div>
                  </div>
                </div>
              ))}

              {/* Show quick replies after the very first assistant message (greeting) */}
              {messages.length === 1 && messages[0]?.role === 'assistant' && !isLoading && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {QUICK_REPLIES.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickReply(reply)}
                      className="text-xs px-3 py-1.5 rounded-full border border-accent text-accent hover:bg-accent hover:text-white transition-colors font-medium"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="flex gap-1 bg-surface w-fit px-4 py-3 rounded-2xl rounded-bl-sm">
                  <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce-light"></span>
                  <span
                    className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce-light"
                    style={{ animationDelay: '0.2s' }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce-light"
                    style={{ animationDelay: '0.4s' }}
                  ></span>
                </div>
              )}

              {error && (
                <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {error}
                  <button onClick={() => useChatStore.getState().setError(null)} className="ml-2 font-bold">&times;</button>
                </div>
              )}

              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSendMessage}
          className="border-t border-current border-opacity-[0.09] p-4 flex gap-2 items-center bg-card"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Share your preferences..."
            disabled={isLoading || !sessionId}
            className="input-field text-sm"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || !sessionId}
            className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d0460f] transition"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Results Panel */}
      <div className="hidden lg:flex flex-col bg-surface">
        {/* Results Header */}
        <div className="border-b border-current border-opacity-[0.09] p-5 bg-card">
          <h3 className="font-syne text-sm font-bold">Your matches</h3>
          <p className="text-xs text-muted mt-1">
            {results.length} PG{results.length !== 1 ? 's' : ''} that fit your criteria
          </p>
        </div>

        {/* Map */}
        <div className="m-4 h-32 overflow-hidden rounded-xl border border-current border-opacity-[0.09]">
          {results.length > 0 ? (
            <PGMap pgs={results} className="w-full h-full" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-l to-blue-100 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={24} className="mx-auto mb-2 text-blue opacity-50" />
                <p className="text-xs text-blue text-opacity-70">PG locations appear here</p>
              </div>
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2.5">
          {isFetchingDetails ? (
            <div className="flex flex-col gap-2.5 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-current border-opacity-[0.09] rounded-xl p-3.5 animate-pulse">
                  <div className="h-4 bg-current bg-opacity-[0.09] rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-current bg-opacity-[0.06] rounded w-1/3 mb-3"></div>
                  <div className="h-3 bg-current bg-opacity-[0.06] rounded w-1/4 mb-3"></div>
                  <div className="h-8 bg-current bg-opacity-[0.06] rounded"></div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-sm text-muted">
                <p>Start chatting to see personalized recommendations</p>
              </div>
            </div>
          ) : (
            results.map((pg, i) => (
              <div
                key={pg.id || i}
                className="bg-card border border-current border-opacity-[0.09] rounded-xl p-3.5 hover:border-accent transition cursor-pointer"
                onClick={() => router.push(`/pg/${pg.id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-syne text-sm font-bold">{pg.pg_name || pg.name}</h4>
                    <p className="text-xs text-muted mt-0.5">{pg.area}</p>
                  </div>
                  <Heart size={16} className="text-muted cursor-pointer hover:text-accent flex-shrink-0" />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span className="text-xs font-semibold">{pg.avg_rating || 'New'}</span>
                </div>

                <div className="font-syne text-base font-black text-accent mb-2">
                  ₹{pg.rent_single_nonac || pg.rent_double_nonac || '—'}
                  <span className="text-xs font-normal text-muted">/month</span>
                </div>

                <div className="flex gap-1 flex-wrap mb-2">
                  {[
                    pg.wifi && 'WiFi',
                    pg.ac_available && 'AC',
                    pg.parking && 'Parking',
                    pg.food_included && 'Food',
                    pg.gym && 'Gym',
                  ].filter(Boolean).slice(0, 3).map((tag, j) => (
                    <span
                      key={j}
                      className="text-xs px-2 py-1 bg-surface rounded-full text-ink-2"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-1.5 text-xs">
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/pg/${pg.id}`) }}
                    className="flex-1 py-1.5 border border-accent text-accent rounded-lg font-medium hover:bg-accent hover:text-white transition"
                  >
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const lat = pg.latitude
                      const lng = pg.longitude
                      if (lat && lng) {
                        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
                      } else {
                        window.open(`https://www.google.com/maps/search/${encodeURIComponent(pg.area + ' ' + pg.pg_name)}`, '_blank')
                      }
                    }}
                    className="flex-1 py-1.5 border border-blue text-blue rounded-lg font-medium hover:bg-blue hover:text-white transition flex items-center justify-center gap-1"
                  >
                    <MapPin size={12} /> Locate
                  </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation()
                      try {
                        const data = await apiClient.recordContact(pg.id, sessionId || '')
                        toast.success(`📞 ${data.pg_name}: ${data.phone}`)
                      } catch {
                        toast.error('Failed to get contact')
                      }
                    }}
                    className="flex-1 py-1.5 bg-accent text-white rounded-lg font-medium hover:bg-[#d0460f] transition flex items-center justify-center gap-1"
                  >
                    <Phone size={12} /> Contact
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const QUICK_REPLIES = [
  "Looking near Gachibowli, budget ₹8k",
  "Need PG near JNTU",
  "Girls PG in Madhapur under ₹7000",
]

function renderMessage(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}
