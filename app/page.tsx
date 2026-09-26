'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Example = {
  sentence_rungus: string
  sentence_ms: string
}

type Word = {
  id: number
  word_rungus: string
  pronunciation: string | null
  part_of_speech: string | null
  meaning_ms: string
  example_sentences: Example[]
}

export default function Home() {
  const [words, setWords] = useState<Word[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWords() {
      setLoading(true)
      let q = supabase
        .from('words')
        .select('*, example_sentences(*)')
        .eq('status', 'published')
        .order('word_rungus')

      if (query) {
        q = q.or(`word_rungus.ilike.%${query}%,meaning_ms.ilike.%${query}%`)
      }

      const { data, error } = await q
      if (!error && data) setWords(data as Word[])
      setLoading(false)
    }

    fetchWords()
  }, [query])

  return (
    <main className="min-h-screen bg-[#EDE6D6] text-[#221F1B] px-4 py-8">
      <div className="max-w-xl mx-auto">
        <p className="text-sm text-[#6b6355] mb-4">
          {words.length} perkataan diterbitkan
        </p>

        <input
          placeholder="Cari perkataan Rungus atau Melayu..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-[#221F1B] rounded px-3 py-2 mb-6 bg-[#F7F3E9] focus:outline-none focus:ring-2 focus:ring-[#A63A32]"
        />

        {loading && <p className="text-[#8a7f68]">Memuatkan...</p>}
        {!loading && words.length === 0 && (
          <p className="text-[#8a7f68]">
            Tiada perkataan dijumpai. Cuba kata kunci lain.
          </p>
        )}

        <div className="space-y-3">
          {words.map((w) => (
            <div
              key={w.id}
              className="bg-[#F7F3E9] border border-[#D8CDB4] border-l-4 border-l-[#A63A32] rounded p-4"
            >
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-bold">{w.word_rungus}</span>
                {w.pronunciation && (
                  <span className="text-sm text-[#8a7f68]">
                    {w.pronunciation}
                  </span>
                )}
              </div>

              {w.part_of_speech && (
                <div className="text-xs italic text-[#8a7f68]">
                  {w.part_of_speech}
                </div>
              )}

              <div className="mt-1">{w.meaning_ms}</div>

              {w.example_sentences?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-dashed border-[#D8CDB4] text-sm text-[#4a453c]">
                  {w.example_sentences.map((ex, i) => (
                    <div key={i} className="mb-1">
                      <div className="italic">"{ex.sentence_rungus}"</div>
                      <div>→ {ex.sentence_ms}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}