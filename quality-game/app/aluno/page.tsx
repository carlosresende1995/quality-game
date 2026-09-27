'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

function AlunoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [codigo, setCodigo] = useState('')
  const [nome, setNome] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    const codigoUrl = searchParams.get('codigo')
    if (codigoUrl) {
      setCodigo(codigoUrl)
    }
  }, [searchParams])

  async function entrarSala() {
    if (codigo.length !== 6) {
      setMensagem('Digite um código de sala válido com 6 números.')
      return
    }

    if (nome.trim().length < 2) {
      setMensagem('Digite seu nome.')
      return
    }

    setCarregando(true)
    setMensagem('Entrando na sala...')

    const { data, error } = await supabase.rpc('entrar_sala', {
      p_codigo: codigo,
      p_nome: nome.trim(),
    })

    if (error) {
      setMensagem(error.message)
      setCarregando(false)
      return
    }

    const jogador = data?.[0]

    if (!jogador) {
      setMensagem('Não foi possível entrar na sala.')
      setCarregando(false)
      return
    }

    localStorage.setItem(
      'quality-game-player',
      JSON.stringify(jogador)
    )

    router.push('/jogo')
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
          Desafio CEP
        </p>

        <h1 className="mt-2 text-2xl font-semibold">
          Entrar na partida
        </h1>

        <p className="mt-2 text-sm text-neutral-400">
          Digite o código fornecido pelo professor.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm">
              Código da sala
            </label>

            <input
              value={codigo}
              onChange={(e) =>
                setCodigo(
                  e.target.value.replace(/\D/g, '').slice(0, 6)
                )
              }
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-4 text-center text-2xl tracking-[0.3em] outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">
              Seu nome
            </label>

            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Carlos"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-white"
            />
          </div>

          <button
            onClick={entrarSala}
            disabled={carregando}
            className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black disabled:opacity-50"
          >
            {carregando ? 'Entrando...' : 'Entrar na sala'}
          </button>

          {mensagem && (
            <p className="text-sm text-neutral-400">
              {mensagem}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

export default function AlunoPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
          <p className="text-neutral-400">Carregando...</p>
        </main>
      }
    >
      <AlunoContent />
    </Suspense>
  )
}
