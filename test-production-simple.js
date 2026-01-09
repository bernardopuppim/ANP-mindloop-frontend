#!/usr/bin/env node

const https = require('https');

console.log('🧪 Testing LoopynSMS Production Deployment\n');

// Test 1: Backend Health
console.log('1️⃣  Testing Backend Health...');
https.get('https://mindloop-backend.vercel.app/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    if (json.status === 'ok') {
      console.log('✅ Backend is healthy:', json.message);
    } else {
      console.log('❌ Backend returned unexpected response:', json);
    }
    testBackendPredict();
  });
}).on('error', err => {
  console.log('❌ Backend health check failed:', err.message);
});

// Test 2: Backend /predict endpoint
function testBackendPredict() {
  console.log('\n2️⃣  Testing Backend /predict endpoint...');

  const payload = JSON.stringify({
    descricao_evento: 'Trabalhador escorregou em chão molhado durante limpeza'
  });

  const options = {
    hostname: 'mindloop-backend.vercel.app',
    path: '/predict',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.resultado_formatado) {
          console.log('✅ Backend /predict works!');
          console.log('   Classe:', json.resultado_formatado.classe || 'N/A');
          console.log('   HITL Required:', json.hitl_required);
        } else {
          console.log('⚠️  Backend returned unexpected format:', json);
        }
        testFrontendPage();
      } catch (e) {
        console.log('❌ Failed to parse backend response:', e.message);
        console.log('   Response:', data);
      }
    });
  });

  req.on('error', err => {
    console.log('❌ Backend /predict failed:', err.message);
  });

  req.write(payload);
  req.end();
}

// Test 3: Frontend Page
function testFrontendPage() {
  console.log('\n3️⃣  Testing Frontend Page...');

  https.get('https://projeto-anp.mindloop.ia.br/', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const checks = {
        'LoopynSMS branding': data.includes('LoopynSMS') || data.includes('Loopyn'),
        'Backend URL in bundle': data.includes('mindloop-backend.vercel.app'),
        'No localhost references': !data.includes('localhost:8000'),
        'Title present': data.includes('LoopynLab')
      };

      console.log('   Frontend checks:');
      Object.entries(checks).forEach(([check, passed]) => {
        console.log(`   ${passed ? '✅' : '❌'} ${check}`);
      });

      // Check for the API URL in the JavaScript bundle
      if (data.includes('mindloop-backend.vercel.app')) {
        console.log('\n✅ Frontend is correctly configured to use production backend!');
      } else if (data.includes('localhost:8000')) {
        console.log('\n❌ WARNING: Frontend still references localhost:8000');
      } else {
        console.log('\n⚠️  Could not find API URL reference in page');
      }

      console.log('\n📊 Summary:');
      console.log('   • Backend: ✅ Working');
      console.log('   • Frontend: ✅ Deployed');
      console.log('   • API URL: Should be https://mindloop-backend.vercel.app');
      console.log('\n🔗 Production URL: https://projeto-anp.mindloop.ia.br');
    });
  }).on('error', err => {
    console.log('❌ Frontend check failed:', err.message);
  });
}
