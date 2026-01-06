# 🎨 MindLoop Frontend

Frontend standalone para o sistema de classificação de eventos SMS da ANP (Agência Nacional do Petróleo).

---

## 📋 Sobre

Interface web desenvolvida em **Next.js 15** para classificação inteligente de eventos SMS utilizando o algoritmo **LATS-P (Language Agent Tree Search - Probabilistic)** com suporte a **HITL (Human-in-the-Loop)**.

Este projeto é **completamente independente** do backend, comunicando-se exclusivamente via API REST.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Linguagem**: TypeScript
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI**: [shadcn/ui](https://ui.shadcn.com/)
- **Cliente HTTP**: Fetch API nativa

---

## 📁 Estrutura do Projeto

```
mindloop-frontend/
├── app/
│   ├── layout.tsx          # Layout raiz
│   ├── page.tsx            # Página principal
│   └── globals.css         # Estilos globais
├── components/
│   └── ui/                 # Componentes shadcn/ui
├── lib/
│   ├── config.ts           # Configuração centralizada de API
│   └── utils.ts            # Utilitários
├── .env.example            # Exemplo de variáveis de ambiente
├── next.config.js          # Configuração Next.js
├── tailwind.config.ts      # Configuração Tailwind
├── tsconfig.json           # Configuração TypeScript
└── package.json            # Dependências do projeto
```

---

## ⚙️ Configuração

### 1. Pré-requisitos

- **Node.js** 18+ e npm
- Backend rodando (veja repositório do backend)

### 2. Instalação

```bash
# Clone o repositório
git clone <seu-repositorio>
cd mindloop-frontend

# Instale as dependências
npm install
```

### 3. Variáveis de Ambiente

Crie um arquivo `.env.local` baseado no `.env.example`:

```bash
cp .env.example .env.local
```

Configure a URL do backend:

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Importante**:
- Use `NEXT_PUBLIC_` prefix para variáveis acessíveis no cliente
- Para produção, aponte para a URL do backend em produção

---

## 🏃 Executando Localmente

### Modo Desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### Build de Produção

```bash
# Criar build otimizado
npm run build

# Executar build
npm start
```

---

## 🌐 Deploy

### Vercel (Recomendado)

1. **Via Dashboard**:
   - Acesse [vercel.com](https://vercel.com)
   - Import seu repositório
   - Configure a variável de ambiente:
     ```
     NEXT_PUBLIC_API_URL=https://seu-backend.vercel.app
     ```
   - Deploy

2. **Via CLI**:
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

### Outras Plataformas

Este projeto é compatível com qualquer plataforma que suporte Next.js:
- **Netlify**: Segue a [documentação oficial](https://docs.netlify.com/integrations/frameworks/next-js/)
- **Railway**: Deploy direto do Git
- **Docker**: Crie uma imagem Docker com Next.js

---

## 🔧 Configuração da API

Toda comunicação com o backend é gerenciada pelo arquivo `lib/config.ts`:

```typescript
// lib/config.ts
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const API_ENDPOINTS = {
  predict: `${API_BASE_URL}/predict`,
  hitlContinue: `${API_BASE_URL}/hitl/continue`,
  health: `${API_BASE_URL}/`,
} as const;
```

**Benefícios**:
- ✅ Nenhuma URL hardcoded no código
- ✅ Fácil troca entre ambientes (dev/staging/prod)
- ✅ Centralização da configuração

---

## 🎯 Funcionalidades

### Classificação de Eventos

- Input de descrição de evento SMS
- Classificação automática em tempo real
- Exibição de resultado com categoria e justificativa

### HITL (Human-in-the-Loop)

- Detecção automática de baixa confiança
- Modal de intervenção humana
- Seleção manual de categoria
- Feedback incorporado ao sistema

### Interface

- Design responsivo (mobile-first)
- Feedback visual de carregamento
- Tratamento de erros
- Tema claro (extensível para dark mode)

---

## 🧪 Validação

Antes de fazer deploy, valide o projeto:

```bash
# Verificar linting
npm run lint

# Build de produção
npm run build

# Testar build localmente
npm start
```

---

## 📦 Dependências Principais

```json
{
  "next": "^15.1.3",
  "react": "^19.0.0",
  "tailwindcss": "^3.4.17",
  "typescript": "^5.7.2"
}
```

---

## 🔗 Backend

Este frontend requer o backend FastAPI rodando.

**Repositório do Backend**: [mindloop-anp](https://github.com/bernardopuppim/mindloop-anp) (branch `serverless_mvp`)

**Endpoints utilizados**:
- `POST /predict` - Classificação de evento
- `POST /hitl/continue` - Intervenção humana
- `GET /` - Health check

---

## 📝 Licença

Este projeto é privado e proprietário.

---

## 👤 Autor

**Bernardo Puppim**

- GitHub: [@bernardopuppim](https://github.com/bernardopuppim)

---

## 🤝 Suporte

Para questões ou problemas:
1. Verifique a [documentação do backend](../ANP_classifier/README.md)
2. Confirme que o backend está rodando
3. Verifique as variáveis de ambiente

---

**Status**: ✅ Produção pronto
**Versão**: 1.0.0
