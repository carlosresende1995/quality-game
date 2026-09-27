'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

type StudentSession={jogador_id:string;player_token:string;sala_id:string;linha_numero:number;nome_sala:string;total_rodadas:number;duracao_rodada:number;meta_cpk:number;status:string;nome?:string}

function AlunoContent(){
  const router=useRouter(); const qs=useSearchParams()
  const [codigo,setCodigo]=useState(''); const [nome,setNome]=useState(''); const [student,setStudent]=useState<StudentSession|null>(null); const [msg,setMsg]=useState(''); const [status,setStatus]=useState('aguardando')

  useEffect(()=>{const c=(qs.get('codigo')||'').replace(/\D/g,'').slice(0,6); if(c)setCodigo(c); try{const raw=localStorage.getItem('cep_student'); if(raw)setStudent(JSON.parse(raw))}catch{}},[qs])

  async function join(){
    setMsg('Entrando…')
    if(codigo.length!==6){setMsg('Digite um código de 6 números.');return}
    if(nome.trim().length<2){setMsg('Digite seu nome.');return}
    const {data,error}=await supabase.rpc('entrar_sala',{p_codigo:codigo,p_nome:nome.trim()})
    if(error){setMsg(error.message);return}
    const s={...(data?.[0]||{}),nome:nome.trim()} as StudentSession
    localStorage.setItem('cep_student',JSON.stringify(s)); setStudent(s); setMsg('')
  }

  useEffect(()=>{if(!student)return; const poll=async()=>{const {data,error}=await supabase.rpc('status_sala',{p_sala_id:student.sala_id}); if(error){setMsg(error.message);return} const s=data?.[0]; if(!s)return; setStatus(s.status); if(s.status==='em_andamento') router.push('/jogo'); if(s.status==='encerrada') setMsg('A partida foi encerrada pelo professor.')}; poll(); const id=setInterval(poll,1500); return()=>clearInterval(id)},[student,router])

  function reset(){localStorage.removeItem('cep_student'); setStudent(null); setMsg(''); setStatus('aguardando')}

  return <main className="page"><div className="container stack">
    <nav className="nav"><Link href="/">Início</Link><Link href="/professor">Professor</Link></nav>
    <section className="panel"><div className="kicker">Modo aluno</div><h1>Entrar na partida</h1><p className="muted">Digite o código mostrado pelo professor.</p></section>

    {!student?<section className="panel stack" style={{maxWidth:620,margin:'0 auto',width:'100%'}}>
      <label><span>Código da sala</span><input inputMode="numeric" maxLength={6} value={codigo} onChange={e=>setCodigo(e.target.value.replace(/\D/g,'').slice(0,6))} style={{textAlign:'center',fontSize:'2rem',letterSpacing:'.18em',fontWeight:800}} placeholder="483921"/></label>
      <label><span>Seu nome</span><input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Ex.: Ana" maxLength={40}/></label>
      <button className="btn primary" onClick={join}>Entrar na sala</button>
      {msg&&<div className="notice warn">{msg}</div>}
    </section>:
    <section className="panel center stack" style={{maxWidth:720,margin:'0 auto',width:'100%'}}>
      <div className="kicker">Você entrou</div><h1>{student.nome}</h1><p className="muted">{student.nome_sala}</p>
      <div className="grid3"><div className="metric"><div className="muted">Linha</div><div className="v">{String(student.linha_numero).padStart(2,'0')}</div></div><div className="metric"><div className="muted">Rodadas</div><div className="v">{student.total_rodadas}</div></div><div className="metric"><div className="muted">Meta Cpk</div><div className="v">{Number(student.meta_cpk).toFixed(2)}</div></div></div>
      <div className={status==='em_andamento'?'notice good':'notice'}>{status==='em_andamento'?'Partida iniciada. Abrindo sua linha…':status==='encerrada'?'Partida encerrada.':'Aguardando o professor iniciar a partida.'}</div>
      <button className="btn" onClick={reset}>Sair da sala</button>
      {msg&&<div className="notice warn">{msg}</div>}
    </section>}
  </div></main>
}

export default function AlunoPage(){
  return <Suspense fallback={<main className="page"><div className="container"><div className="panel">Carregando…</div></div></main>}><AlunoContent/></Suspense>
}
