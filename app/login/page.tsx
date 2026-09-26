'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      })

      if (error) {
        setMessage(error.message)
      } else {
        setMessage('Pendaftaran berjaya! Anda kini log masuk.')
        router.push('/')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
      } else {
        router.push('/')
      }
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#EDE6D6] text-[#221F1B] px-4 py-8 flex items-center justify-center">
      <form 
        onSubmit={handleSubmit} 
        className="bg-[#F7F3E9] border border-[#D8CDB4] rounded p-6 w-full max-w-sm"
      >
        <h1 className="text-xl font-bold mb-4">
          {mode === 'login' ? 'Log Masuk' : 'Daftar Akaun'}
        </h1>

        {mode === 'signup' && (
          <input
            type="text"
            placeholder="Nama"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-[#221F1B] rounded px-3 py-2 mb-3 bg-white"
            required
          />
        )}

        <input
          type="email"
          placeholder="Emel"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-[#221F1B] rounded px-3 py-2 mb-3 bg-white"
          required
        />

        <input
          type="password"
          placeholder="Kata Laluan"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-[#221F1B] rounded px-3 py-2 mb-4 bg-white"
          required
        />

        {message && (
          <p className="text-sm text-[#A63A32] mb-3">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#221F1B] text-[#EDE6D6] rounded py-2 font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Tunggu...' : mode === 'login' ? 'Log Masuk' : 'Daftar'}
        </button>

        <p className="text-sm text-center mt-4">
          {mode === 'login' ? 'Belum ada akaun?' : 'Sudah ada akaun?'}{' '}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="underline font-medium"
          >
            {mode === 'login' ? 'Daftar di sini' : 'Log masuk di sini'}
          </button>
        </p>
      </form>
    </main>
  )
}