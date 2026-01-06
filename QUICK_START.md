# ⚡ Quick Start - MindLoop Frontend

## 🏃 Rodar Agora (Local)

```bash
cd /home/puppyn/projects/mindloop-frontend
npm run dev
```

**URL**: http://localhost:3000

**Pré-requisito**: Backend em http://localhost:8000

---

## 🔧 Configurar API (Produção)

Edite [.env.local](.env.local):

```bash
NEXT_PUBLIC_API_URL=https://seu-backend.vercel.app
```

---

## 🚀 Deploy Vercel (1 minuto)

```bash
npx vercel --prod
```

Quando perguntar **Environment Variables**:
```
NEXT_PUBLIC_API_URL=https://seu-backend.vercel.app
```

---

## 📦 Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento (porta 3000)
npm run build    # Build de produção
npm start        # Rodar build
npm run lint     # Verificar código
```

---

## 📁 Arquivos Importantes

- [README.md](README.md) - Documentação completa
- [lib/config.ts](lib/config.ts) - Configuração de API
- [app/page.tsx](app/page.tsx) - Página principal
- [.env.local](.env.local) - Variáveis de ambiente

---

## 🐛 Problemas Comuns

### Erro: "Failed to fetch"
**Causa**: Backend não está rodando
**Solução**:
```bash
cd /home/puppyn/projects/ANP_classifier
./start_backend.sh
```

### Erro: API retorna 404
**Causa**: URL errada no .env.local
**Solução**: Verificar `NEXT_PUBLIC_API_URL`

---

## 💡 Dica Pro

Para testar com backend em produção localmente:

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://seu-backend.vercel.app
```

Assim você testa o frontend local contra backend em produção!

---

**Tudo pronto!** 🎉
