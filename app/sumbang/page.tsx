'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SumbangPage() {
  const router = useRouter()
  
  const [userId, setUserId] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  
  const [word, setWord] = useState('')
  const [pos, setPos] = useState('kata nama')
  const [meaning, setMeaning] = useState('')
  const [exRn, setExRn] = useState('')
  const [exMs, setExMs] = useState('')
  
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Semak pengesahan sesi pengguna (Authentication check)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login')
      } else {
        setUserId(data.user.id)
      }
      setChecking(false)
    })
  }, [router])

  // Pemprosesan hantar borang
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return

    setLoading(true)
    setMessage('')

    // Insert perkataan baharu ke dalam jadual 'words'
    const { data: newWord, error } = await supabase
      .from('words')
      .insert({
        word_rungus: word,
        part_of_speech: pos,
        meaning_ms: meaning,
        status: 'pending',
        submitted_by: userId,
      })
      .select()
      .single()

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    // Insert contoh ayat jika diisi
    if (exRn && newWord) {
      await supabase.from('example_sentences').insert({
        word_id: newWord.id,
        sentence_rungus: exRn,
        sentence_ms: exMs,
      })
    }

    setMessage('Terima kasih! Perkataan anda dihantar untuk semakan.')
    
    // Tetapkan semula borang
    setWord('')
    setMeaning('')
    setExRn('')
    setExMs('')
    setLoading(false)
  }

  if (checking) return null

  return (
    <main className="min-h-screen bg-[#EDE6D6] text-[#221F1B] px-4 py-8 flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-[#F7F3E9] border border-[#D8CDB4] rounded p-6 w-full max-w-md"
      >
        <h1 className="text-xl font-bold mb-4">Sumbang Perkataan Baru</h1>

        {/* Perkataan Rungus */}
        <label className="block text-sm font-semibold mb-1">
          Perkataan (Rungus)
        </label>
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          required
          className="w-full border border-[#221F1B] rounded px-3 py-2 mb-3 bg-white"
        />

        {/* Jenis Kata */}
        <label className="block text-sm font-semibold mb-1">
          Jenis kata
        </label>
        <select
          value={pos}
          onChange={(e) => setPos(e.target.value)}
          className="w-full border border-[#221F1B] rounded px-3 py-2 mb-3 bg-white"
        >
          <option value="kata nama">kata nama</option>
          <option value="kata kerja">kata kerja</option>
          <option value="kata sifat">kata sifat</option>
          <option value="lain-lain">lain-lain</option>
        </select>

        {/* Makna Bahasa Melayu */}
        <label className="block text-sm font-semibold mb-1">
          Makna (Bahasa Melayu)
        </label>
        <input
          type="text"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          required
          className="w-full border border-[#221F1B] rounded px-3 py-2 mb-3 bg-white"
        />

        {/* Contoh Ayat Rungus */}
        <label className="block text-sm font-semibold mb-1">
          Contoh ayat (Rungus) - opsyenal
        </label>
        <input
          type="text"
          value={exRn}
          onChange={(e) => setExRn(e.target.value)}
          className="w-full border border-[#221F1B] rounded px-3 py-2 mb-3 bg-white"
        />

        {/* Terjemahan Ayat BM */}
        <label className="block text-sm font-semibold mb-1">
          Terjemahan ayat (BM) - opsyenal
        </label>
        <input
          type="text"
          value={exMs}
          onChange={(e) => setExMs(e.target.value)}
          className="w-full border border-[#221F1B] rounded px-3 py-2 mb-4 bg-white"
        />

        {/* Mesej Ralat / Kejayaan */}
        {message && (
          <p className="text-sm text-[#A63A32] mb-3">{message}</p>
        )}

        {/* Butang Hantar */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#221F1B] text-[#EDE6D6] rounded py-2 font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Menghantar...' : 'Hantar untuk Semakan'}
        </button>
      </form>
    </main>
  )
}