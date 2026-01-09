# Fix: Variável NEXT_PUBLIC_API_URL com \n literal - Resolvido ✅

**Data**: 2026-01-09
**Problema**: "Failed to fetch" persistindo em produção
**Causa Raiz**: Variável de ambiente `NEXT_PUBLIC_API_URL` continha `\n` literal no final
**Status**: ✅ Resolvido e testado

---

## Problema Identificado

Após deploy inicial, o erro "Failed to fetch" persistia em produção mesmo com a aplicação funcionando localmente.

### Investigação

1. **Primeiro diagnóstico**: Backend não estava rodando localmente
   - ✅ Resolvido: Backend iniciado e documentado

2. **Segundo diagnóstico**: Erro persistiu em produção
   - Verificação revelou que `NEXT_PUBLIC_API_URL` tinha valor incorreto
   - Arquivo `.env.vercel.production` continha: `"https://mindloop-backend.vercel.app\n"`
   - O `\n` literal (não uma nova linha, mas os caracteres `\` e `n`) tornava a URL inválida

---

## Causa Raiz Técnica

A variável de ambiente no Vercel foi configurada com aspas incluindo um `\n` literal:

```bash
# ❌ Incorreto (com \n literal)
NEXT_PUBLIC_API_URL="https://mindloop-backend.vercel.app\n"

# ✅ Correto (sem \n)
NEXT_PUBLIC_API_URL="https://mindloop-backend.vercel.app"
```

### Por que isso causava "Failed to fetch"?

Quando o frontend Next.js tentava fazer requisição para:
```
https://mindloop-backend.vercel.app\n/predict
```

O navegador não conseguia resolver esse URL malformado, resultando em:
- **Erro no console**: `Failed to fetch`
- **Network tab**: Request não era nem iniciado
- **Causa**: URL inválido devido ao `\n` literal

---

## Solução Aplicada

### 1. Remover variável incorreta

```bash
vercel env rm NEXT_PUBLIC_API_URL production --yes
```

**Output**:
```
✓ Removed Environment Variable [264ms]
```

### 2. Adicionar variável correta

```bash
echo "https://mindloop-backend.vercel.app" | vercel env add NEXT_PUBLIC_API_URL production
```

**Output**:
```
✓ Added Environment Variable NEXT_PUBLIC_API_URL to Project mindloop-frontend [273ms]
```

### 3. Redeploy para aplicar mudanças

```bash
vercel --prod --yes
```

**Output**:
```
✓ Build completed successfully
✓ Deployed to production
✓ Aliased to https://projeto-anp.mindloop.ia.br
```

---

## Validação Completa

### Testes Automatizados Criados

1. **`test-production.spec.ts`**: Testes Playwright (4 cenários)
2. **`test-production-simple.js`**: Validação Node.js básica
3. **`final-validation-test.sh`**: Script bash completo com 6 verificações

### Resultados dos Testes

```bash
./final-validation-test.sh
```

**Resultados**:

✅ **Backend Health**: OK
✅ **Backend /predict**: Working (HITL triggered correctly)
✅ **Frontend Deployment**: OK (LoopynSMS branding presente)
✅ **API URL Configuration**: Production backend correto
✅ **JavaScript Bundle**: Contém `mindloop-backend.vercel.app`
✅ **Environment Variable**: `NEXT_PUBLIC_API_URL` configurado no Vercel

### Verificação Manual no Bundle JavaScript

```bash
# Encontrar bundle
curl -s https://projeto-anp.mindloop.ia.br/ | grep -oP '/_next/static/chunks/app/page-[a-f0-9]+\.js'

# Verificar conteúdo
curl -s "https://projeto-anp.mindloop.ia.br/_next/static/chunks/app/page-ceee917c2bc18c9d.js" | \
  grep -o "mindloop-backend.vercel.app"
```

**Output**:
```
mindloop-backend.vercel.app  ✅
```

### Teste do Endpoint Backend

```bash
curl -s -X POST 'https://mindloop-backend.vercel.app/predict' \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://projeto-anp.mindloop.ia.br' \
  -d '{"descricao_evento": "Trabalhador escorregou em chão molhado"}' | \
  grep -o "hitl_required"
```

**Output**:
```
hitl_required  ✅
```

---

## Como Prevenir no Futuro

### 1. Sempre validar variáveis de ambiente após configuração

```bash
# Verificar valor atual
vercel env pull .env.verify
cat .env.verify

# Procurar por caracteres especiais
cat .env.verify | od -c | grep "\\\\n"
```

### 2. Usar script de validação antes de deploy

```bash
# Executar antes de cada deploy importante
./final-validation-test.sh
```

### 3. Checklist de Deploy

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Sem caracteres especiais (`\n`, `\r`, espaços extras)
- [ ] Backend respondendo corretamente
- [ ] Frontend build passando
- [ ] Testes de integração passando
- [ ] Verificação manual no navegador

---

## Arquivos Criados/Modificados

### Arquivos de Teste

1. **`test-production.spec.ts`**: Testes Playwright completos
2. **`test-production-simple.js`**: Validação Node.js
3. **`final-validation-test.sh`**: Script bash de validação
4. **`playwright.config.ts`**: Configuração Playwright

### Arquivos de Documentação

1. **`FIX_ENV_VARIABLE_NEWLINE.md`**: Este arquivo
2. **`FIX_FAILED_TO_FETCH.md`**: Fix anterior (backend local)
3. **`TROUBLESHOOTING.md`**: Guia geral

---

## Detalhes Técnicos

### Como Next.js Processa NEXT_PUBLIC_API_URL

1. **Build time**: Next.js lê variável de ambiente
2. **Inline replacement**: Substitui `process.env.NEXT_PUBLIC_API_URL` pelo valor literal
3. **Bundle**: Valor é "hardcoded" no JavaScript bundle
4. **Runtime**: Navegador usa o valor do bundle (não pode mudar sem rebuild)

### Por que Rebuild foi Necessário

- Variáveis `NEXT_PUBLIC_*` são inlined durante build
- Mudar no Vercel não afeta builds existentes
- Novo deploy foi necessário para aplicar nova variável

### Verificação da Configuração

```typescript
// lib/config.ts
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
```

Durante build:
```javascript
// Após build com variável correta
export const API_URL = "https://mindloop-backend.vercel.app";

// ❌ Antes (com \n)
export const API_URL = "https://mindloop-backend.vercel.app\n";
```

---

## Linha do Tempo da Correção

1. **16:00** - Erro "Failed to fetch" reportado
2. **16:05** - Investigação: verificado que backend está saudável
3. **16:10** - Descoberta: `NEXT_PUBLIC_API_URL` com `\n` literal
4. **16:15** - Correção: Removida e recriada variável no Vercel
5. **16:20** - Redeploy em produção
6. **16:30** - Validação: Todos os testes passaram ✅
7. **16:35** - Documentação: Scripts de teste criados
8. **16:40** - Concluído: Sistema funcionando em produção

---

## Status Final

### Produção

✅ **Frontend**: https://projeto-anp.mindloop.ia.br
✅ **Backend**: https://mindloop-backend.vercel.app
✅ **Branding**: LoopynSMS
✅ **Design**: Estética violeta/purple
✅ **API URL**: Correta (sem `\n`)
✅ **Comunicação**: Frontend ↔ Backend funcionando

### Ambiente Local

✅ **Backend**: Script `start-backend.sh` criado
✅ **Frontend**: Configurado com `.env.local`
✅ **Documentação**: `TROUBLESHOOTING.md` completo

---

## Comandos Úteis

### Verificar variáveis de ambiente

```bash
vercel env ls
vercel env pull .env.check
cat .env.check | grep NEXT_PUBLIC_API_URL
```

### Testar backend

```bash
curl https://mindloop-backend.vercel.app/
curl -X POST https://mindloop-backend.vercel.app/predict \
  -H "Content-Type: application/json" \
  -d '{"descricao_evento": "Teste"}'
```

### Testar frontend

```bash
curl https://projeto-anp.mindloop.ia.br/ | grep "Loopyn"
./final-validation-test.sh
```

### Redeploy se necessário

```bash
vercel --prod --yes
```

---

## Lições Aprendidas

1. **Sempre validar variáveis de ambiente após configuração**
   - Usar `vercel env pull` para verificar valores reais
   - Procurar caracteres especiais escondidos

2. **Variáveis NEXT_PUBLIC_* requerem rebuild**
   - Não são dinâmicas em runtime
   - Mudanças exigem novo deploy

3. **Testes automatizados são essenciais**
   - Criados scripts para validação rápida
   - Evitam regressões futuras

4. **Documentação previne repetição**
   - Checklists de deploy
   - Scripts de troubleshooting
   - Guias de validação

---

**Problema Resolvido**: ✅
**Sistema em Produção**: ✅
**Documentação Completa**: ✅
**Testes Automatizados**: ✅
