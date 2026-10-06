import Link from 'next/link'

export default function Home() {
  return (
    <main className="page">
      <div className="container stack">
        <section className="panel hero">
          <div className="kicker">Gestão da Qualidade · CEP</div>
          <h1>Desafio da Linha de Envase</h1>
          <p className="muted">Ambiente multiplayer para ensinar capabilidade, estabilidade, variabilidade, diagnóstico de processo e tomada de decisão.</p>
          <div className="row wrap" style={{marginTop:18}}>
            <Link className="btn primary" href="/professor">Sou professor</Link>
            <Link className="btn" href="/aluno">Sou aluno</Link>
          </div>
        </section>

        <section className="grid3">
          <div className="panel"><h2>Professor</h2><p className="muted">Cria sala, acompanha alunos, inicia a partida e monitora resultados.</p></div>
          <div className="panel"><h2>Aluno</h2><p className="muted">Entra pelo código da sala e recebe uma linha produtiva individual.</p></div>
          <div className="panel"><h2>Jogo</h2><p className="muted">Gerencia temperatura, pressão, CO₂, velocidade, manutenção, custo e Cpk.</p></div>
        </section>
      </div>
    </main>
  )
}
