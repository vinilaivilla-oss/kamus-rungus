'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TerjemahPage() {
  const [dict, setDict] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [unmatched, setUnmatched] = useState<string[]>([])

  // Memuatkan kamus dari pangkalan data Supabase
  useEffect(() => {
    async function loadDict() {
      const { data } = await supabase
        .from('words')
        .select('word_rungus, meaning_ms')
        .eq('status', 'published')

      const map: Record<string, string> = {}
      
      data?.forEach((w) => {
        if (w.meaning_ms) {
          map[w.meaning_ms.toLowerCase().trim()] = w.word_rungus
        }
      })

      setDict(map)
      setLoading(false)
    }

    loadDict()
  }, [])

  // Pemprosesan terjemahan perkataan-demi-perkataan
  function handleTranslate() {
    if (!input.trim()) return

    const tokens = input
      .toLowerCase()
      .replace(/[.,!?]/g, '')
      .trim()
      .split(/\s+/)

    const missing: string[] = []
    const translated = tokens.map((t) => {
      if (dict[t]) return dict[t]
      missing.push(t)
      return `[${t}?]`
    })

    setResult(translated.join(' '))
    setUnmatched(missing)
  }

  return (
    <main className="min-h-screen bg-[#EDE6D6] text-[#221F1B] px-4 py-8">
      <div className="max-w-xl mx-auto">
        {/* Tajuk Halaman */}
        <h1 className="text-xl font-bold mb-1">Terjemah Ayat</h1>
        <p className="text-sm text-[#6b6355] mb-4">
          Bahasa Melayu → Rungus (padanan perkataan-demi-perkataan)
        </p>

        {/* Ruangan Teks Input */}
        <textarea
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Cth: Rumah kami besar"
          className="w-full border border-[#221F1B] rounded px-3 py-2 mb-3 bg-[#F7F3E9] focus:outline-none focus:ring-2 focus:ring-[#A63A32]"
        />

        {/* Butang Terjemah */}
        <button
          onClick={handleTranslate}
          disabled={loading}
          className="bg-[#221F1B] text-[#EDE6D6] px-4 py-2 rounded font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Memuatkan kamus...' : 'Terjemah'}
        </button>

        {/* Keputusan Terjemahan */}
        {result && (
          <div className="mt-5 bg-[#F7F3E9] border border-[#221F1B] rounded p-4">
            <div className="text-lg font-semibold">{result}</div>
            
            <p className="text-sm text-[#8a7f68] mt-2">
              ⚠️ Terjemahan asas — padanan perkataan sahaja, belum tatabahasa penuh.{' '}
              {unmatched.length > 0 && (
                <>
                  Perkataan bertanda [?] belum ada dalam kamus:{' '}
                  <span className="font-medium text-[#A63A32]">
                    {unmatched.join(', ')}
                  </span>.
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}