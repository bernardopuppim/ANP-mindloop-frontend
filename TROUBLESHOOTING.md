# Troubleshooting - MindLoop Frontend

## Erro: "Failed to fetch"

### Causa
Esse erro ocorre quando o frontend não consegue se comunicar com o backend.

### Soluções

#### 1. Backend não está rodando (MAIS COMUM ✅)

**Verificar se backend está ativo:**
```bash
curl http://localhost:8000/
```

Se retornar erro, o backend não está rodando.

**Iniciar o backend:**
```bash
cd /home/puppyn/projects/mindloop-backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**OU use o script facilitador:**
```bash
cd /home/puppyn/projects/mindloop-backend
./start-backend.sh
```

#### 2. URL incorreta

Verifique se o `.env.local` tem a URL correta:
```bash
# /home/puppyn/projects/mindloop-frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### 3. CORS bloqueado

Se o backend está rodando mas ainda dá erro, verifique o console do browser para mensagens de CORS.

O backend deve ter configuração CORS permitindo `localhost:3000`:
```python
# app/main.py deve ter:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "..."],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 4. Porta 8000 ocupada

Se outra aplicação está usando a porta 8000:
```bash
# Verificar o que está usando a porta
lsof -i :8000

# Matar processo na porta 8000
pkill -f "uvicorn"
```

---

## Checklist de Verificação

Quando encontrar "Failed to fetch", siga esta ordem:

1. ✅ **Backend está rodando?**
   ```bash
   curl http://localhost:8000/
   ```
   Deve retornar: `{"status":"ok","message":"MindLoop Backend API"}`

2. ✅ **Frontend está apontando para URL correta?**
   - Verificar `.env.local`
   - Deve ser `http://localhost:8000` (sem trailing slash)

3. ✅ **Console do browser mostra erros?**
   - Abrir DevTools (F12)
   - Ver aba Console
   - Ver aba Network

4. ✅ **Testar endpoint diretamente:**
   ```bash
   curl -X POST http://localhost:8000/predict \
     -H "Content-Type: application/json" \
     -d '{"descricao_evento": "Teste"}'
   ```

---

## Comandos Úteis

### Verificar status dos serviços

```bash
# Backend está rodando?
curl http://localhost:8000/

# Frontend está rodando?
curl http://localhost:3000/

# Ver processos
ps aux | grep -E "(uvicorn|next)" | grep -v grep
```

### Iniciar serviços

```bash
# Backend
cd /home/puppyn/projects/mindloop-backend
./start-backend.sh

# Frontend (em outro terminal)
cd /home/puppyn/projects/mindloop-frontend
npm run dev
```

### Parar serviços

```bash
# Parar backend
pkill -f "uvicorn app.main:app"

# Parar frontend
pkill -f "next dev"
```

---

## Logs

### Ver logs do backend

Se iniciou com `./start-backend.sh`, os logs aparecem no terminal.

Para debug mais detalhado:
```bash
cd /home/puppyn/projects/mindloop-backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level debug
```

### Ver logs do frontend

```bash
cd /home/puppyn/projects/mindloop-frontend
npm run dev
```

Logs aparecem no terminal e no console do browser (F12).

---

## Problemas Conhecidos

### 1. "Module not found" no backend
**Causa**: Dependências não instaladas
**Solução**:
```bash
cd /home/puppyn/projects/mindloop-backend
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. "EADDRINUSE: address already in use" no frontend
**Causa**: Porta 3000 já está em uso
**Solução**:
```bash
pkill -f "next dev"
# Ou usar outra porta:
npm run dev -- -p 3001
```

### 3. Variáveis de ambiente não carregam
**Causa**: Mudanças em `.env.local` requerem restart
**Solução**:
```bash
# Parar o frontend (Ctrl+C)
# Reiniciar:
npm run dev
```

---

## Teste de Integração Completo

Execute este teste para verificar que tudo está funcionando:

```bash
# 1. Testar backend
curl http://localhost:8000/
# Esperado: {"status":"ok","message":"MindLoop Backend API"}

# 2. Testar endpoint de predict
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"descricao_evento": "Trabalhador caiu de escada"}' | jq

# 3. Testar frontend
curl http://localhost:3000/ | grep "LoopynLab"
# Deve encontrar o título da página
```

Se todos os testes passarem, o sistema está funcionando! ✅

---

## Contato de Suporte

Se o problema persistir após seguir este guia:
1. Verificar logs completos do backend e frontend
2. Verificar console do browser (F12)
3. Testar com eventos diferentes
4. Verificar conectividade de rede

---

**Última atualização**: 2026-01-08
