'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Header() {
  const [email, setEmail] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    // Semak pengguna sedia ada semasa 'mount'
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? null)
        
        supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) setRole(profile.role)
          })
      }
    })

    // Dengar perubahaaan status autentikasi
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null)
      if (!session?.user) {
        setRole(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="bg-[#EDE6D6] border-b border-[#D8CDB4] px-4 py-3">
      <div className="max-w-xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <Link href="/" className="text-lg font-bold text-[#221F1B]">
          Kamus Bahasa Rungus
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link href="/" className="hover:underline">
            Kamus
          </Link>

          {email && (
            <Link href="/sumbang" className="hover:underline">
              Sumbang
            </Link>
          )}

          {role && ['moderator', 'admin'].includes(role) && (
            <Link href="/moderator" className="hover:underline">
              Moderator
            </Link>
          )}

          {email ? (
            <>
              <span className="text-[#6b6355] hidden sm:inline">
                {email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-[#A63A32] text-[#EDE6D6] px-3 py-1 rounded hover:opacity-90 transition-opacity"
              >
                Log Keluar
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-[#221F1B] text-[#EDE6D6] px-3 py-1 rounded hover:opacity-90 transition-opacity"
            >
              Log Masuk
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}