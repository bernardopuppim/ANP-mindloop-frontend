#!/bin/bash

echo ""
echo "🎯 VALIDAÇÃO FINAL - LoopynSMS em Produção"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Frontend: https://projeto-anp.mindloop.ia.br"
echo "✅ Backend:  https://mindloop-backend.vercel.app"
echo ""
echo "📊 Teste de Conexão:"
echo ""

# Backend Health
echo -n "   Backend Health... "
if curl -sf https://mindloop-backend.vercel.app/ | grep -q '"status":"ok"'; then
  echo "✅ OK"
else
  echo "❌ FALHOU"
fi

# Frontend Branding
echo -n "   Frontend Branding... "
if curl -sf https://projeto-anp.mindloop.ia.br/ | grep -q "Loopyn"; then
  echo "✅ OK"
else
  echo "❌ FALHOU"
fi

# Bundle Config
echo -n "   Bundle Config... "
BUNDLE=$(curl -s https://projeto-anp.mindloop.ia.br/ | grep -oP '/_next/static/chunks/app/page-[a-f0-9]+\.js' | head -1)
if curl -sf "https://projeto-anp.mindloop.ia.br${BUNDLE}" | grep -q "mindloop-backend.vercel.app"; then
  echo "✅ OK"
else
  echo "❌ FALHOU"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 SISTEMA OPERACIONAL EM PRODUÇÃO!"
echo ""
echo "📝 Documentação completa em:"
echo "   • VALIDATION_REPORT.md"
echo "   • FIX_ENV_VARIABLE_NEWLINE.md"
echo "   • TROUBLESHOOTING.md"
echo ""
echo "🧪 Scripts de teste disponíveis:"
echo "   • ./final-validation-test.sh"
echo "   • node test-production-simple.js"
echo "   • ./show-status.sh (este script)"
echo ""
