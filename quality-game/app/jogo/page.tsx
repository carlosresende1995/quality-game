'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

type StudentSession={jogador_id:string;player_token:string;sala_id:string;linha_numero:number;nome_sala:string;total_rodadas:number;duracao_rodada:number;meta_cpk:number;nome?:string}

function gauss(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function mean(a:number[]){return a.length?a.reduce((s,x)=>s+x,0)/a.length:null}
function sd(a:number[]){if(a.length<2)return null;const m=mean(a)!;return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1))}

export default function JogoPage(){
  const router=useRouter(); const sessionRef=useRef<StudentSession|null>(null)
  const [student,setStudent]=useState<StudentSession|null>(null); const [status,setStatus]=useState('em_andamento'); const [round,setRound]=useState(1)
  const [temp,setTemp]=useState(3); const [pressure,setPressure]=useState(50); const [co2,setCo2]=useState(50); const [speed,setSpeed]=useState(65)
  const [filter,setFilter]=useState(2); const [valve,setValve]=useState(3); const [sensorBias,setSensorBias]=useState(0); const [cost,setCost]=useState(0); const [vals,setVals]=useState<number[]>([]); const [elapsed,setElapsed]=useState(0); const [msg,setMsg]=useState('')
  const [actions,setActions]=useState(0)

  useEffect(()=>{try{const raw=localStorage.getItem('cep_student'); if(!raw){router.replace('/aluno');return} const s=JSON.parse(raw); sessionRef.current=s; setStudent(s)}catch{router.replace('/aluno')}},[router])

  const stats=useMemo(()=>{const m=mean(vals),s=sd(vals);const scrap=vals.length?vals.filter(v=>v<347||v>353).length/vals.length:0;const cp=s?6/(6*s):null;const cpk=s&&m!=null?Math.min((353-m)/(3*s),(m-347)/(3*s)):null;return{m,s,scrap,cp,cpk}},[vals])
  const quality=Math.max(0,Math.min(100,((stats.cpk||0)/1.67)*100-stats.scrap*80)); const productivity=Math.max(0,Math.min(100,(speed-35)/65*100)); const stability=Math.max(0,100-Math.max(0,Math.abs(temp-3)-.5)*35-Math.max(0,Math.abs(pressure-50)-2)*8-Math.max(0,Math.abs(co2-50)-2)*8); const costEff=Math.max(0,100-Math.min(100,cost/15)); const score=Math.round(.38*quality+.28*stability+.22*productivity+.12*costEff)

  useEffect(()=>{if(!student)return; const poll=async()=>{const {data}=await supabase.rpc('status_sala',{p_sala_id:student.sala_id}); const s=data?.[0]; if(!s)return; setStatus(s.status); setRound(s.rodada_atual||1); if(s.status==='encerrada')setMsg('Partida encerrada pelo professor.')}; poll(); const id=setInterval(poll,1500); return()=>clearInterval(id)},[student])

  useEffect(()=>{if(!student||status!=='em_andamento')return; const id=setInterval(()=>{
    setElapsed(x=>x+1)
    setTemp(t=>Math.max(1.5,Math.min(5.5,t+.005+gauss()*.015)))
    setPressure(p=>Math.max(40,Math.min(60,p-.003-filter*.001+gauss()*.035)))
    setCo2(c=>Math.max(43,Math.min(57,c+.002+gauss()*.025)))
    setFilter(f=>Math.min(100,f+.025*(speed/55)))
    setValve(v=>Math.min(100,v+.015))
    setVals(a=>{const sigma=.42+.0014*(speed-55)**2+Math.max(0,Math.abs(temp-3)-.5)*1.1+Math.max(0,Math.abs(pressure-50)-2)*.17+Math.max(0,Math.abs(co2-50)-2)*.13+valve*.023+filter*.03; const mu=350+(pressure-50)*.20-(temp-3)*.5+(co2-50)*.07-(speed-60)*.018-valve*.025-filter*.055+sensorBias; const add=Math.max(1,Math.round(speed/20)); const next=[...a]; for(let i=0;i<add;i++)next.push(mu+gauss()*sigma+gauss()*Math.abs(sensorBias)*.08); return next.slice(-900)})
  },1000); return()=>clearInterval(id)},[student,status,temp,pressure,co2,speed,filter,valve,sensorBias])

  useEffect(()=>{if(!student)return; const id=setInterval(async()=>{await supabase.rpc('atualizar_resultado_jogador',{p_jogador_id:student.jogador_id,p_player_token:student.player_token,p_score:score,p_cpk:stats.cpk,p_refugo:stats.scrap,p_producao:vals.length,p_custo:cost,p_rodada:round})},2500); return()=>clearInterval(id)},[student,score,stats.cpk,stats.scrap,vals.length,cost,round])

  function act(fn:()=>void,c:number){fn();setActions(x=>x+1);setCost(x=>x+c)}
  function cleanValve(){act(()=>setValve(0),180);setMsg('Válvula limpa.')}
  function replaceFilter(){act(()=>{setFilter(0);setPressure(p=>Math.max(48,p))},260);setMsg('Filtro substituído.')}
  function calibrate(){act(()=>setSensorBias(0),140);setMsg('Sensor calibrado.')}

  const chart=vals.slice(-70); const points=chart.map((v,i)=>{const x=12+(i/Math.max(1,chart.length-1))*676; const y=20+((356-v)/12)*260; return `${x},${y}`}).join(' ')

  if(!student)return <main className="page"><div className="container"><div className="panel">Carregando…</div></div></main>

  return <main className="page"><div className="container stack">
    <nav className="nav"><Link href="/">Início</Link><Link href="/aluno">Sala do aluno</Link></nav>
    <section className="panel"><div className="row between wrap"><div><div className="kicker">Linha {String(student.linha_numero).padStart(2,'0')} · {student.nome}</div><h1>{student.nome_sala}</h1><div className="muted">Rodada {round}/{student.total_rodadas}</div></div><div className="row wrap"><span className="badge">Score {score}</span><span className="badge">Cpk {stats.cpk==null?'—':stats.cpk.toFixed(2)}</span><span className="badge">Produção {vals.length}</span></div></div></section>

    {status!=='em_andamento'&&<div className="notice warn">A partida não está em andamento. {msg}</div>}

    <section className="game-grid">
      <div className="stack">
        <div className="panel controls">
          <div className="control"><div className="control-head"><div><strong>Temperatura</strong><div className="muted">Ideal 2,5–3,5 °C</div></div><strong>{temp.toFixed(1)} °C</strong></div><div className="control-actions"><button className="btn" onClick={()=>act(()=>setTemp(t=>t-.3),8)}>↑ Refrigeração</button><button className="btn" onClick={()=>act(()=>setTemp(t=>t+.3),8)}>↓ Refrigeração</button></div></div>
          <div className="control"><div className="control-head"><div><strong>Pressão de enchimento</strong><div className="muted">Ideal 48–52%</div></div><strong>{pressure.toFixed(1)}%</strong></div><div className="control-actions"><button className="btn" onClick={()=>act(()=>setPressure(p=>p+1.3),8)}>+ Pressão</button><button className="btn" onClick={()=>act(()=>setPressure(p=>p-1.3),8)}>− Pressão</button></div></div>
          <div className="control"><div className="control-head"><div><strong>Pressão de CO₂</strong><div className="muted">Ideal 48–52%</div></div><strong>{co2.toFixed(1)}%</strong></div><div className="control-actions"><button className="btn" onClick={()=>act(()=>setCo2(c=>c+1.2),8)}>+ CO₂</button><button className="btn" onClick={()=>act(()=>setCo2(c=>c-1.2),8)}>− CO₂</button></div></div>
          <div className="control"><div className="control-head"><div><strong>Velocidade da linha</strong></div><strong>{speed}%</strong></div><input type="range" min={35} max={100} value={speed} onChange={e=>setSpeed(+e.target.value)}/></div>
        </div>
        <div className="panel"><h2>Manutenção</h2><div className="grid3"><button className="btn" onClick={cleanValve}>Limpar válvula<br/><small>R$ 180</small></button><button className="btn" onClick={replaceFilter}>Trocar filtro<br/><small>R$ 260</small></button><button className="btn" onClick={calibrate}>Calibrar sensor<br/><small>R$ 140</small></button></div>{msg&&<div className="notice" style={{marginTop:12}}>{msg}</div>}</div>
      </div>

      <div className="stack">
        <div className="panel"><div className="row between wrap"><div><h2>Volume medido</h2><div className="muted">Especificação: 347–353 mL</div></div><div className="grid4" style={{flex:1,minWidth:420}}><div className="metric"><div className="muted">Média</div><div className="v">{stats.m==null?'—':stats.m.toFixed(2)}</div></div><div className="metric"><div className="muted">σ</div><div className="v">{stats.s==null?'—':stats.s.toFixed(2)}</div></div><div className="metric"><div className="muted">Cpk</div><div className="v">{stats.cpk==null?'—':stats.cpk.toFixed(2)}</div></div><div className="metric"><div className="muted">Refugo</div><div className="v">{(stats.scrap*100).toFixed(1)}%</div></div></div></div>
          <svg viewBox="0 0 700 300" className="chart" style={{marginTop:14}}><rect x="0" y="0" width="700" height="300" fill="white"/>{[347,350,353].map(v=>{const y=20+((356-v)/12)*260;return <g key={v}><line x1="12" x2="688" y1={y} y2={y} stroke="#9ca3af" strokeDasharray="6 5"/><text x="685" y={y-6} fontSize="11" textAnchor="end" fill="#6b7280">{v===350?'Alvo':v===347?'LIE':'LSE'}</text></g>})}<polyline points={points} fill="none" stroke="#111827" strokeWidth="2"/></svg>
        </div>
        <section className="grid4"><div className="metric"><div className="muted">Qualidade</div><div className="v">{Math.round(quality)}%</div></div><div className="metric"><div className="muted">Estabilidade</div><div className="v">{Math.round(stability)}%</div></div><div className="metric"><div className="muted">Produtividade</div><div className="v">{Math.round(productivity)}%</div></div><div className="metric"><div className="muted">Custo extra</div><div className="v">R$ {cost.toFixed(0)}</div></div></section>
        <div className="panel"><div className="muted">Tempo de jogo</div><strong>{elapsed}s</strong> · <span className="muted">Intervenções</span> <strong>{actions}</strong></div>
      </div>
    </section>
  </div></main>
}
