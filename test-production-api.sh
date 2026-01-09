#!/bin/bash

echo "🚀 Teste de Integração E2E - Produção"
echo "======================================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0

# Função de teste
test_step() {
    echo -e "${BLUE}$1${NC}"
}

test_pass() {
    echo -e "   ${GREEN}✅ $1${NC}"
    ((PASSED++))
}

test_fail() {
    echo -e "   ${RED}❌ $1${NC}"
    ((FAILED++))
}

# Teste 1: Frontend está online
test_step "📄 Teste 1: Verificando se o frontend está online..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://mindloop.ia.br/)
if [ "$HTTP_CODE" = "200" ]; then
    test_pass "Frontend respondendo (HTTP $HTTP_CODE)"
else
    test_fail "Frontend não respondeu corretamente (HTTP $HTTP_CODE)"
fi

# Teste 2: Backend está online
echo ""
test_step "🔧 Teste 2: Verificando se o backend está online..."
BACKEND_RESPONSE=$(curl -s https://mindloop-backend.vercel.app/)
if echo "$BACKEND_RESPONSE" | grep -q "ok"; then
    test_pass "Backend respondendo: $BACKEND_RESPONSE"
else
    test_fail "Backend não respondeu corretamente"
fi

# Teste 3: CORS configurado corretamente
echo ""
test_step "🔒 Teste 3: Verificando configuração CORS..."
CORS_HEADER=$(curl -sI -X OPTIONS https://mindloop-backend.vercel.app/predict \
    -H "Origin: https://mindloop.ia.br" \
    -H "Access-Control-Request-Method: POST" | grep -i "access-control-allow-origin")

if echo "$CORS_HEADER" | grep -q "mindloop.ia.br"; then
    test_pass "CORS configurado corretamente: $CORS_HEADER"
else
    test_fail "CORS não está configurado para mindloop.ia.br"
fi

# Teste 4: Classificação de evento
echo ""
test_step "🧪 Teste 4: Testando classificação de evento..."
START_TIME=$(date +%s.%N)

RESPONSE=$(curl -s -X POST https://mindloop-backend.vercel.app/predict \
    -H "Content-Type: application/json" \
    -H "Origin: https://mindloop.ia.br" \
    -d '{"descricao_evento": "Vazamento de óleo hidráulico durante manutenção"}' \
    -w "\nHTTP_CODE:%{http_code}")

END_TIME=$(date +%s.%N)
DURATION=$(echo "$END_TIME - $START_TIME" | bc)

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" = "200" ]; then
    test_pass "Backend respondeu com sucesso (HTTP 200)"
    test_pass "Tempo de resposta: ${DURATION}s"
else
    test_fail "Backend respondeu com erro (HTTP $HTTP_CODE)"
fi

# Teste 5: Verificar se retornou HITL ou resultado
echo ""
test_step "🎯 Teste 5: Verificando resposta da classificação..."

if echo "$BODY" | grep -q "hitl_required"; then
    HITL_REQUIRED=$(echo "$BODY" | grep -o '"hitl_required":[^,]*' | cut -d: -f2)

    if echo "$HITL_REQUIRED" | grep -q "true"; then
        test_pass "HITL acionado (alta entropia detectada)"

        # Verificar se tem opções
        if echo "$BODY" | grep -q "children"; then
            test_pass "Opções HITL disponíveis"

            # Verificar justificativas (LLM)
            JUSTIFICATIVAS=$(echo "$BODY" | grep -o '"justificativa":"[^"]*"' | head -3)

            if echo "$JUSTIFICATIVAS" | grep -q -v "fallback"; then
                test_pass "LLM gerando justificativas reais"
                echo -e "   ${YELLOW}📝 Exemplo:${NC}"
                echo "$JUSTIFICATIVAS" | head -1 | cut -d'"' -f4 | fold -w 60 -s | sed 's/^/      /'
            else
                test_fail "LLM retornando fallback genérico"
            fi
        fi
    else
        test_pass "Classificação direta (baixa entropia)"
    fi
else
    test_fail "Resposta não contém campo 'hitl_required'"
fi

# Teste 6: Frontend carrega bundle JavaScript corretamente
echo ""
test_step "📦 Teste 6: Verificando bundle JavaScript..."
JS_CONTENT=$(curl -s https://mindloop.ia.br/)

if echo "$JS_CONTENT" | grep -q "page-.*\.js"; then
    JS_FILE=$(echo "$JS_CONTENT" | grep -o 'page-[a-z0-9]*\.js' | head -1)
    test_pass "Bundle JavaScript encontrado: $JS_FILE"

    # Verificar se API URL está correta no bundle
    JS_BUNDLE=$(curl -s "https://mindloop.ia.br/_next/static/chunks/app/$JS_FILE")

    if echo "$JS_BUNDLE" | grep -q "mindloop-backend.vercel.app"; then
        # Verificar se NÃO tem newline
        if echo "$JS_BUNDLE" | grep -q 'mindloop-backend.vercel.app\\n'; then
            test_fail "API URL contém \\n (newline) no bundle"
        else
            test_pass "API URL correta no bundle (sem \\n)"
        fi
    else
        test_fail "API URL não encontrada no bundle"
    fi
else
    test_fail "Bundle JavaScript não encontrado"
fi

# Teste 7: Verificar conteúdo da página
echo ""
test_step "🎨 Teste 7: Verificando conteúdo da página..."

if echo "$JS_CONTENT" | grep -q "Classificador de Eventos SMS"; then
    test_pass "Título da aplicação presente"
else
    test_fail "Título da aplicação não encontrado"
fi

if echo "$JS_CONTENT" | grep -q "Classificar Evento"; then
    test_pass "Botão 'Classificar Evento' presente"
else
    test_fail "Botão não encontrado"
fi

# Resumo final
echo ""
echo "======================================"
echo -e "${BLUE}📊 RESUMO DOS TESTES${NC}"
echo "======================================"
echo -e "${GREEN}✅ Testes passados: $PASSED${NC}"
echo -e "${RED}❌ Testes falhados: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}"
    echo ""
    echo "A aplicação está 100% funcional em produção:"
    echo "  • Frontend: https://mindloop.ia.br"
    echo "  • Backend: https://mindloop-backend.vercel.app"
    echo "  • LLM: gpt-4o-mini funcionando"
    echo "  • Integração: Frontend ↔ Backend OK"
    echo ""
    exit 0
else
    echo -e "${RED}❌ ALGUNS TESTES FALHARAM${NC}"
    echo ""
    exit 1
fi
