# Desafio CEP — Multiplayer

Aplicação web para dinâmica de sala de aula em Gestão da Qualidade / Controle Estatístico do Processo.

## O que já funciona

- Professor cria uma sala no Supabase.
- Código de 6 dígitos e QR Code.
- Aluno entra sem cadastro.
- Professor vê os alunos conectados.
- Professor inicia e encerra a partida.
- Cada aluno recebe uma linha de envase individual.
- Jogo envia score, Cpk, refugo, produção e custo ao painel do professor.
- Dados ficam sincronizados por polling curto no Supabase.

## 1. Configurar variáveis locais

Copie `.env.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lencuatmlbufezfgqcrn.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICAVEL
```

A chave `NEXT_PUBLIC_...` deve ser a chave **publishable** do projeto Supabase. Não use `service_role` nem secret key no navegador.

## 2. Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## 3. Subir para GitHub

Crie um repositório novo no GitHub e envie todos os arquivos desta pasta.

## 4. Importar no Vercel

No Vercel:

1. New Project
2. Import Git Repository
3. Escolha o repositório `quality-game`
4. Framework: Next.js (detectado automaticamente)
5. Antes de Deploy, adicione as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
6. Clique em Deploy.

## Fluxo de teste

1. Abra `/professor`.
2. Crie uma sala.
3. Em outro celular/navegador, abra `/aluno` ou escaneie o QR Code.
4. Entre com o código.
5. O aluno aparecerá no painel do professor.
6. Professor clica em **Iniciar partida**.
7. O aluno é encaminhado automaticamente para `/jogo`.

## Observação

O backend Supabase já contém as funções RPC necessárias (`criar_sala`, `entrar_sala`, `iniciar_partida`, `status_sala`, `dados_sala_professor`, `listar_jogadores_professor`, `atualizar_resultado_jogador`, `encerrar_partida`).
