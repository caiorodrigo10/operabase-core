# Obsidian Guidelines — Boas Praticas de Conexoes

Orientacoes para agentes Operabase ao trabalhar com notas no Obsidian vault.

---

## Filosofia de Linking

**Linke com intencao, nao com obsessao.**

Links (`[[nota]]`) conectam ideias. Tags (`#tag`) categorizam. Use ambos — sao complementares.

---

## Regras de Linking por Tipo de Nota

| Tipo de nota | Links recomendados | Exemplos |
|---|---|---|
| Entrada de diario | 0-2 links | So se naturalmente relevante. Ex: "estudei [[React]] hoje" |
| Mood check-in | 0 links | Nao precisa linkar, e um registro pontual |
| Brain dump | 0-1 links | So se o usuario mencionar algo especifico |
| Win / conquista | 0-1 links | Opcional se conecta a um projeto |
| TIL (aprendizado) | 1-3 links | Tema principal + conceitos relacionados + [[Home]] |
| Link/video salvo | 1-2 links | Tema principal + [[Home]] |
| Ideia | 1-3 links | Area relacionada + inspiracoes + [[Home]] |
| Livro | 2-4 links | Autor, temas, area + [[Home]] |
| Weekly review | 1-2 links | [[Home]] + semana anterior se existir |

---

## Quando Linkar

- **Voce pensa em outra nota ao escrever** — Se o cerebro fez a conexao, registre
- **A nota ja existe no vault** — Linkar para notas existentes fortalece a rede
- **A nota NAO existe mas e um conceito relevante** — Crie o [[link]] mesmo assim. Links para notas que ainda nao existem sao "sementes" — criam pontos de entrada para conteudo futuro e aparecem no Graph View como nos prontos para serem preenchidos
- **E um conceito recorrente** — Temas que aparecem varias vezes merecem link
- **Faz sentido em 2 segundos** — Se precisa pensar muito, nao linke

## Quando NAO Linkar

- **Nao force conexoes** — Se precisa mais de 5 segundos para justificar, pule
- **Nao linke tudo para tudo** — Uma nota com 20+ links perde utilidade
- **Nao linke em mood/dump** — Preservar palavras exatas e mais importante que conectar

---

## Hub Obrigatorio: [[Home]]

Toda nota de **conhecimento** (TIL, link, ideia, livro) deve linkar para `[[Home]]` na secao "Conexoes". Isso garante que nenhuma nota fique orfa no Graph View.

Notas de **diario** (entradas, mood, dump, win) NAO precisam linkar para Home — elas vivem no fluxo temporal.

---

## Tags vs Links — Quando Usar Cada Um

| Use Tag (`#tag`) | Use Link (`[[nota]]`) |
|---|---|
| Categorizar tipo de conteudo | Conectar uma ideia a outra |
| Agrupar notas similares | Criar caminho entre notas |
| Filtrar no Dataview | Navegar entre conceitos |
| Metadata (front matter `tags:`) | Inline no texto |

### Exemplos

```markdown
# Bom uso de tag + link combinados
---
tags: [til, react, frontend]
---
# TIL: React 19 Server Components
Aprendi que [[React]] 19 tem server components nativos...
## Conexoes
- [[Home]]
```

```markdown
# Bom uso em diario (minimo)
## 14:30 — entrada
to cansado, estudei demais [[React]] e nao deu tempo do [[Projeto X]]
```

```markdown
# Bom uso sem links (mood)
## 09:00 — mood
energia: 7/10
dia tranquilo
```

---

## Notas como Hubs

Com o tempo, algumas notas acumulam muitos backlinks naturalmente. Essas se tornam **hubs** — pontos de convergencia no Graph View.

**Hubs esperados no vault:**
- `[[Home]]` — Hub central
- Notas de tecnologias recorrentes (`[[React]]`, `[[ADHD]]`, etc.)
- Notas de projetos ativos

**Nao force hubs** — Deixe emergirem naturalmente pelo uso.

---

## Regras para Agentes Operabase

1. **Conhecimento (TIL, link, ideia, livro):**
   - SEMPRE adicionar `## Conexoes` com `[[Home]]`
   - Adicionar 1-3 links relevantes para conceitos relacionados (mesmo que a nota ainda nao exista — links sao sementes para conteudo futuro)
   - Adicionar tags no YAML front matter

2. **Diario (entrada, mood, dump, win, reflexao):**
   - Preservar palavras exatas do usuario (NUNCA editar para adicionar links)
   - Se o usuario ja escreveu `[[algo]]`, manter
   - NAO adicionar links que o usuario nao escreveu
   - NAO adicionar secao "Conexoes"

3. **Deteccao automatica:**
   - Se o usuario menciona um topico relevante, adicionar [[link]] automaticamente em notas de conhecimento
   - Nao precisa verificar se a nota existe — links para notas inexistentes sao sementes validas
   - Exemplo: usuario salva link sobre Remotion → adicionar `[[React]]`, `[[TypeScript]]`, `[[Video]]` nas conexoes

4. **Manutencao:**
   - Weekly review deve listar notas orfas (sem nenhum link)
   - Insights deve considerar padroes de conexao

---

*Operabase — Obsidian Guidelines v1.0*
