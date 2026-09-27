'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '@/lib/supabase'

type AdminSession = { sala_id:string; codigo:string; admin_token:string }
type Room = { sala_id:string; codigo:string; nome:string; status:string; rodada_atual:number; total_rodadas:number; duracao_rodada:number; meta_cpk:number; limite_alunos:number; cenario:string }
type Player = { id:string; nome:string; linha_numero:number; score:number; cpk:number|null; refugo:number; producao:number; custo:number; conectado:boolean; rodada:number }

export default function ProfessorPage(){
  const [admin,setAdmin]=useState<AdminSession|null>(null)
  const [room,setRoom]=useState<Room|null>(null)
  const [players,setPlayers]=useState<Player[]>([])
  const [msg,setMsg]=useState('')
  const [loading,setLoading]=useState(false)
  const [form,setForm]=useState({nome:'Desafio CEP — Envase de Cerveja',rodadas:3,duracao:90,cpk:1.33,limite:50})

  useEffect(()=>{try{const raw=localStorage.getItem('cep_admin'); if(raw)setAdmin(JSON.parse(raw))}catch{}},[])

  async function load(){
    if(!admin)return
    const {data:r,error:er}=await supabase.rpc('dados_sala_professor',{p_sala_id:admin.sala_id,p_admin_token:admin.admin_token})
    const {data:p,error:ep}=await supabase.rpc('listar_jogadores_professor',{p_sala_id:admin.sala_id,p_admin_token:admin.admin_token})
    if(er||ep){setMsg((er||ep)?.message||'Erro ao carregar sala');return}
    setRoom(r?.[0]||null); setPlayers((p||[]) as Player[])
  }

  useEffect(()=>{ if(!admin)return; load(); const id=setInterval(load,1500); return()=>clearInterval(id)},[admin])

  async function create(){
    setLoading(true);setMsg('')
    const {data,error}=await supabase.rpc('criar_sala',{
      p_nome:form.nome,p_total_rodadas:form.rodadas,p_duracao_rodada:form.duracao,p_meta_cpk:form.cpk,p_limite_alunos:form.limite,p_cenario:'beer',p_pontuacao:{qualidade:true,estabilidade:true,produtividade:true,custo:true}
    })
    setLoading(false)
    if(error){setMsg(error.message);return}
    const a=data?.[0] as AdminSession|undefined
    if(!a){setMsg('Sala não criada.');return}
    localStorage.setItem('cep_admin',JSON.stringify(a));setAdmin(a)
  }

  async function start(){
    if(!admin)return
    setMsg('Iniciando…')
    const {error}=await supabase.rpc('iniciar_partida',{p_sala_id:admin.sala_id,p_admin_token:admin.admin_token})
    setMsg(error?error.message:'Partida iniciada.'); load()
  }

  async function end(){
    if(!admin)return
    const ok=confirm('Encerrar a partida para todos os alunos?')
    if(!ok)return
    const {error}=await supabase.rpc('encerrar_partida',{p_sala_id:admin.sala_id,p_admin_token:admin.admin_token})
    setMsg(error?error.message:'Partida encerrada.'); load()
  }

  function leave(){ localStorage.removeItem('cep_admin'); setAdmin(null); setRoom(null); setPlayers([]); setMsg('') }

  const joinUrl=useMemo(()=> typeof window!=='undefined'&&room?`${window.location.origin}/aluno?codigo=${room.codigo}`:'',[room])

  return <main className="page"><div className="container stack">
    <nav className="nav"><Link href="/">Início</Link><Link href="/aluno">Tela do aluno</Link></nav>
    <section className="panel"><div className="kicker">Modo professor</div><h1>Painel da partida</h1><p className="muted">Crie a sala e acompanhe a turma em tempo real.</p></section>

    {!admin && <section className="panel stack">
      <h2>Configuração</h2>
      <div className="grid2">
        <label style={{gridColumn:'1/-1'}}><span>Nome da partida</span><input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})}/></label>
        <label><span>Rodadas</span><select value={form.rodadas} onChange={e=>setForm({...form,rodadas:+e.target.value})}><option>2</option><option>3</option><option>4</option></select></label>
        <label><span>Duração por rodada</span><select value={form.duracao} onChange={e=>setForm({...form,duracao:+e.target.value})}><option value="60">60 s</option><option value="90">90 s</option><option value="120">120 s</option></select></label>
        <label><span>Meta Cpk</span><input type="number" step="0.01" value={form.cpk} onChange={e=>setForm({...form,cpk:+e.target.value})}/></label>
        <label><span>Limite de alunos</span><input type="number" value={form.limite} onChange={e=>setForm({...form,limite:+e.target.value})}/></label>
      </div>
      <button className="btn primary" onClick={create} disabled={loading}>{loading?'Criando…':'Criar sala'}</button>
      {msg&&<div className="notice warn">{msg}</div>}
    </section>}

    {admin && room && <>
      <section className="grid2">
        <div className="panel center"><div className="kicker">Código da sala</div><div className="bigcode">{room.codigo}</div><p className="muted">Os alunos podem digitar o código ou escanear o QR Code.</p></div>
        <div className="panel center"><QRCodeSVG value={joinUrl} size={180}/><p className="muted" style={{marginTop:10}}>Entrada direta na sala</p></div>
      </section>

      <section className="grid4">
        <div className="metric"><div className="muted">Conectados</div><div className="v">{players.length}</div></div>
        <div className="metric"><div className="muted">Status</div><div className="v" style={{fontSize:'1rem'}}>{room.status.replaceAll('_',' ')}</div></div>
        <div className="metric"><div className="muted">Rodada</div><div className="v">{room.rodada_atual}/{room.total_rodadas}</div></div>
        <div className="metric"><div className="muted">Meta Cpk</div><div className="v">{Number(room.meta_cpk).toFixed(2)}</div></div>
      </section>

      <section className="panel">
        <div className="row between wrap"><div><h2>Alunos</h2><div className="muted">Atualização automática a cada 1,5 s</div></div><div className="row wrap"><button className="btn primary" onClick={start} disabled={!players.length||room.status!=='aguardando'}>Iniciar partida</button><button className="btn danger" onClick={end} disabled={room.status==='encerrada'}>Encerrar</button><button className="btn" onClick={leave}>Sair</button></div></div>
        <div style={{overflowX:'auto',marginTop:12}}><table className="table"><thead><tr><th>#</th><th>Aluno</th><th>Linha</th><th>Score</th><th>Cpk</th><th>Produção</th><th>Refugo</th><th>Custo</th></tr></thead><tbody>{players.length?players.map((p,i)=><tr key={p.id}><td>{i+1}</td><td>{p.nome}</td><td>{String(p.linha_numero).padStart(2,'0')}</td><td>{Number(p.score).toFixed(0)}</td><td>{p.cpk==null?'—':Number(p.cpk).toFixed(2)}</td><td>{p.producao}</td><td>{(Number(p.refugo)*100).toFixed(1)}%</td><td>R$ {Number(p.custo).toFixed(0)}</td></tr>):<tr><td colSpan={8} className="muted">Nenhum aluno conectado.</td></tr>}</tbody></table></div>
      </section>
      {msg&&<div className="notice">{msg}</div>}
    </>}
  </div></main>
}
