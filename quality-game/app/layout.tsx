import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Desafio CEP',
  description: 'Jogo multiplayer de Controle Estatístico do Processo',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
