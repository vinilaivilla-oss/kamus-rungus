'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type PendingWord = {
  id: number
  word_rungus: string
  part_of_speech: string | null
  meaning_ms: string
}

export default function ModeratorPage() {
  const router = useRouter()
  
  const [allowed, setAllowed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [pending, setPending] = useState<PendingWord[]>([])

  // Semak peranan (role) pengguna & muatkan data sumbangan
  useEffect(() => {
    async function init() {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single()

      if (!profile || !['moderator', 'admin'].includes(profile.role)) {
        router.push('/')
        return
      }

      setAllowed(true)
      await loadPending()
      setChecking(false)
    }

    init()
  }, [router])

  // Fungsi memuatkan senarai perkataan menunggu semakan
  async function loadPending() {
    const { data } = await supabase
      .from('words')
      .select('id, word_rungus, part_of_speech, meaning_ms')
      .eq('status', 'pending')

    setPending(data || [])
  }

  // Fungsi meluluskan atau menolak sumbangan
  async function handleAction(id: number, action: 'published' | 'rejected') {
    await supabase
      .from('words')
      .update({ status: action })
      .eq('id', id)

    setPending((prev) => prev.filter((w) => w.id !== id))
  }

  if (checking || !allowed) return null

  return (
    <main className="min-h-screen bg-[#EDE6D6] text-[#221F1B] px-4 py-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-xl font-bold mb-1">Panel Moderator</h1>
        <p className="text-sm text-[#6b6355] mb-4">
          {pending.length} sumbangan menunggu semakan
        </p>

        {pending.length === 0 && (
          <p className="text-[#8a7f68]">Tiada sumbangan tertunggak.</p>
        )}

        {/* Senarai Perkataan Menunggu Semakan */}
        <div className="space-y-3">
          {pending.map((w) => (
            <div
              key={w.id}
              className="bg-[#F7F3E9] border border-[#D8CDB4] rounded p-4"
            >
              <div className="font-bold text-lg">{w.word_rungus}</div>

              {w.part_of_speech && (
                <div className="text-xs italic text-[#8a7f68]">
                  {w.part_of_speech}
                </div>
              )}

              <div className="mt-1">{w.meaning_ms}</div>

              {/* Butang Tindakan */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleAction(w.id, 'published')}
                  className="bg-[#221F1B] text-[#EDE6D6] px-3 py-1.5 rounded text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Luluskan
                </button>

                <button
                  onClick={() => handleAction(w.id, 'rejected')}
                  className="bg-[#A63A32] text-white px-3 py-1.5 rounded text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Tolak
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}