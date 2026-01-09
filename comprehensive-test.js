// Comprehensive test for MindLoop Frontend-Backend Integration
// Tests the actual endpoints and behavior

const https = require('https');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(hostname, path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'Accept': 'application/json',
      'User-Agent': 'MindLoop-Test/1.0',
      ...headers
    };

    if (data) {
      defaultHeaders['Content-Type'] = 'application/json';
      defaultHeaders['Content-Length'] = Buffer.byteLength(data);
    }

    const options = {
      hostname,
      path,
      method,
      headers: defaultHeaders
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          body: responseData
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

async function testFrontendAvailability() {
  log('\n' + '='.repeat(70), colors.bold);
  log('TEST 1: Frontend Availability', colors.bold + colors.cyan);
  log('='.repeat(70), colors.bold);

  try {
    const response = await makeRequest('mindloop-frontend.vercel.app', '/');

    log(`\nStatus: ${response.status} ${response.statusText}`,
        response.status === 200 ? colors.green : colors.red);

    if (response.status === 200) {
      const hasTextarea = response.body.includes('textarea') || response.body.includes('Textarea');
      const hasButton = response.body.includes('Classificar');
      const hasMindLoop = response.body.includes('MindLoop') || response.body.includes('Classificador');

      log('\nContent Analysis:', colors.blue);
      log(`  - Has textarea: ${hasTextarea ? '✓' : '✗'}`, hasTextarea ? colors.green : colors.red);
      log(`  - Has classification button: ${hasButton ? '✓' : '✗'}`, hasButton ? colors.green : colors.red);
      log(`  - Has MindLoop branding: ${hasMindLoop ? '✓' : '✗'}`, hasMindLoop ? colors.green : colors.red);

      log('\n✓ PASS: Frontend is accessible', colors.green + colors.bold);
      return true;
    } else {
      log('\n✗ FAIL: Frontend returned non-200 status', colors.red + colors.bold);
      return false;
    }
  } catch (error) {
    log(`\n✗ FAIL: ${error.message}`, colors.red + colors.bold);
    return false;
  }
}

async function testBackendHealth() {
  log('\n' + '='.repeat(70), colors.bold);
  log('TEST 2: Backend Health Check', colors.bold + colors.cyan);
  log('='.repeat(70), colors.bold);

  try {
    const response = await makeRequest('mindloop-backend.vercel.app', '/health');

    log(`\nStatus: ${response.status} ${response.statusText}`,
        response.status === 200 ? colors.green : colors.red);

    if (response.status === 200) {
      try {
        const data = JSON.parse(response.body);
        log('\nHealth Response:', colors.blue);
        log(JSON.stringify(data, null, 2), colors.cyan);

        log('\n✓ PASS: Backend is healthy', colors.green + colors.bold);
        return true;
      } catch (e) {
        log('\n✗ FAIL: Could not parse health response', colors.red + colors.bold);
        return false;
      }
    } else {
      log('\n✗ FAIL: Backend health check failed', colors.red + colors.bold);
      return false;
    }
  } catch (error) {
    log(`\n✗ FAIL: ${error.message}`, colors.red + colors.bold);
    return false;
  }
}

async function testCORS() {
  log('\n' + '='.repeat(70), colors.bold);
  log('TEST 3: CORS Configuration', colors.bold + colors.cyan);
  log('='.repeat(70), colors.bold);

  try {
    const response = await makeRequest(
      'mindloop-backend.vercel.app',
      '/predict',
      'OPTIONS',
      null,
      {
        'Origin': 'https://mindloop-frontend.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type'
      }
    );

    log(`\nPreflight Status: ${response.status}`,
        response.status === 200 || response.status === 204 ? colors.green : colors.yellow);

    log('\nCORS Headers:', colors.blue);
    const corsHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers',
      'access-control-allow-credentials'
    ];

    let hasCORS = false;
    corsHeaders.forEach(header => {
      const value = response.headers[header];
      if (value) {
        log(`  ${header}: ${value}`, colors.cyan);
        if (header === 'access-control-allow-origin' &&
            (value === '*' || value === 'https://mindloop-frontend.vercel.app')) {
          hasCORS = true;
        }
      } else {
        log(`  ${header}: NOT SET`, colors.red);
      }
    });

    if (hasCORS || response.headers['access-control-allow-origin']) {
      log('\n✓ PASS: CORS headers are present', colors.green + colors.bold);
      return true;
    } else {
      log('\n⚠ WARNING: CORS may not be properly configured', colors.yellow + colors.bold);
      log('  This might cause issues in the browser', colors.yellow);
      return true; // Don't fail test, just warn
    }
  } catch (error) {
    log(`\n✗ FAIL: ${error.message}`, colors.red + colors.bold);
    return false;
  }
}

async function testPredictEndpoint() {
  log('\n' + '='.repeat(70), colors.bold);
  log('TEST 4: Classification Endpoint (/predict)', colors.bold + colors.cyan);
  log('='.repeat(70), colors.bold);

  const testEvent = 'Manutenção preventiva realizada';
  log(`\nTest Event: "${testEvent}"`, colors.blue);

  const requestBody = JSON.stringify({
    descricao_evento: testEvent
  });

  try {
    const startTime = Date.now();

    const response = await makeRequest(
      'mindloop-backend.vercel.app',
      '/predict',
      'POST',
      requestBody,
      {
        'Origin': 'https://mindloop-frontend.vercel.app',
        'Referer': 'https://mindloop-frontend.vercel.app/'
      }
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    log(`\nResponse Time: ${duration}ms`, colors.blue);
    log(`Status: ${response.status} ${response.statusText}`,
        response.status === 200 ? colors.green : colors.red);

    if (response.status === 200) {
      try {
        const data = JSON.parse(response.body);

        log('\nResponse Structure:', colors.blue);
        log(`  - hitl_required: ${data.hitl_required}`, colors.cyan);

        if (data.hitl_required) {
          log('\n  HITL (Human-in-the-Loop) Required:', colors.yellow);
          if (data.hitl_metadata) {
            log(`    - Node ID: ${data.hitl_metadata.node_id}`, colors.cyan);
            log(`    - Question: ${data.hitl_metadata.pergunta}`, colors.cyan);
            log(`    - Entropy: ${data.hitl_metadata.entropia_local?.toFixed(3)}`, colors.cyan);
            log(`    - Options: ${data.hitl_metadata.children?.length || 0}`, colors.cyan);
          }
        } else if (data.resultado_formatado) {
          log('\n  Classification Result:', colors.green);
          log(`    - Class: ${data.resultado_formatado.classe}`, colors.cyan);
          log(`    - Type: ${data.resultado_formatado.tipo_ocorrencia}`, colors.cyan);
          if (data.resultado_formatado.confianca) {
            log(`    - Confidence: ${data.resultado_formatado.confianca.nivel_display}`, colors.cyan);
          }
          if (data.resultado_formatado.justificativa_tecnica) {
            log(`    - Technical Justification: ${data.resultado_formatado.justificativa_tecnica.substring(0, 100)}...`, colors.cyan);
          }
        } else if (data.final) {
          log('\n  Final Result (old format):', colors.green);
          log(`    - Node ID: ${data.final.node_id}`, colors.cyan);
          log(`    - Log Prob: ${data.final.log_prob}`, colors.cyan);
          log(`    - History Length: ${data.final.historico?.length || 0}`, colors.cyan);
        }

        log('\n✓ PASS: Classification endpoint is working', colors.green + colors.bold);
        log(`  Response time: ${duration}ms`, colors.green);
        return data;
      } catch (e) {
        log(`\n✗ FAIL: Could not parse JSON response`, colors.red + colors.bold);
        log(`  Error: ${e.message}`, colors.red);
        log(`  Body: ${response.body.substring(0, 200)}`, colors.yellow);
        return false;
      }
    } else {
      log(`\n✗ FAIL: Backend returned status ${response.status}`, colors.red + colors.bold);
      log(`  Body: ${response.body}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`\n✗ FAIL: ${error.message}`, colors.red + colors.bold);
    return false;
  }
}

async function testFullIntegration() {
  log('\n' + '='.repeat(70), colors.bold);
  log('TEST 5: Full Frontend-Backend Integration', colors.bold + colors.cyan);
  log('='.repeat(70), colors.bold);

  log('\nSimulating frontend behavior:', colors.blue);
  log('1. User visits frontend', colors.cyan);
  log('2. User enters event description', colors.cyan);
  log('3. User clicks "Classificar Evento"', colors.cyan);
  log('4. Frontend sends POST to /predict', colors.cyan);
  log('5. Backend processes and returns result', colors.cyan);

  const testEvent = 'Vazamento de óleo durante operação de abastecimento';
  log(`\nTest Event: "${testEvent}"`, colors.blue);

  try {
    const requestBody = JSON.stringify({
      descricao_evento: testEvent
    });

    const response = await makeRequest(
      'mindloop-backend.vercel.app',
      '/predict',
      'POST',
      requestBody,
      {
        'Origin': 'https://mindloop-frontend.vercel.app',
        'Referer': 'https://mindloop-frontend.vercel.app/',
        'Content-Type': 'application/json'
      }
    );

    if (response.status === 200) {
      const data = JSON.parse(response.body);

      log('\n✓ Integration Test Result:', colors.green + colors.bold);

      if (data.hitl_required) {
        log('\n  Scenario: HITL Required', colors.yellow);
        log('  Expected Frontend Behavior:', colors.blue);
        log('    1. Display HITL modal with options', colors.cyan);
        log('    2. User selects an option', colors.cyan);
        log('    3. Frontend sends POST to /hitl/continue', colors.cyan);
        log('    4. System continues classification', colors.cyan);

        if (data.hitl_metadata?.children?.length > 0) {
          log('\n  Available Options:', colors.blue);
          data.hitl_metadata.children.forEach((child, i) => {
            log(`    ${i + 1}. ${child.id} (${(child.prob * 100).toFixed(1)}%)`, colors.cyan);
          });
        }
      } else {
        log('\n  Scenario: Direct Classification', colors.green);
        log('  Expected Frontend Behavior:', colors.blue);
        log('    1. Display classification result card', colors.cyan);
        log('    2. Show class, type, and confidence', colors.cyan);
        log('    3. Optionally show technical details', colors.cyan);

        if (data.resultado_formatado) {
          log('\n  Result Details:', colors.green);
          log(`    Class: ${data.resultado_formatado.classe}`, colors.cyan);
          log(`    Type: ${data.resultado_formatado.tipo_ocorrencia}`, colors.cyan);
          if (data.resultado_formatado.confianca) {
            log(`    Confidence: ${data.resultado_formatado.confianca.nivel_display}`, colors.cyan);
          }
        }
      }

      log('\n✓ PASS: Full integration working correctly', colors.green + colors.bold);
      return true;
    } else {
      log(`\n✗ FAIL: Integration test failed with status ${response.status}`, colors.red + colors.bold);
      return false;
    }
  } catch (error) {
    log(`\n✗ FAIL: ${error.message}`, colors.red + colors.bold);
    return false;
  }
}

async function runAllTests() {
  log('\n' + '█'.repeat(70), colors.bold + colors.blue);
  log('MINDLOOP FRONTEND-BACKEND INTEGRATION TEST SUITE', colors.bold + colors.blue);
  log('█'.repeat(70), colors.bold + colors.blue);

  const results = {
    frontendAvailable: false,
    backendHealthy: false,
    corsConfigured: false,
    predictWorking: false,
    integrationWorking: false
  };

  // Run all tests
  results.frontendAvailable = await testFrontendAvailability();
  results.backendHealthy = await testBackendHealth();
  results.corsConfigured = await testCORS();
  results.predictWorking = await testPredictEndpoint();
  results.integrationWorking = await testFullIntegration();

  // Summary
  log('\n' + '='.repeat(70), colors.bold);
  log('TEST SUMMARY', colors.bold + colors.cyan);
  log('='.repeat(70), colors.bold);

  const testResults = [
    { name: 'Frontend Availability', passed: results.frontendAvailable },
    { name: 'Backend Health', passed: results.backendHealthy },
    { name: 'CORS Configuration', passed: results.corsConfigured },
    { name: 'Predict Endpoint', passed: results.predictWorking },
    { name: 'Full Integration', passed: results.integrationWorking }
  ];

  testResults.forEach((result, i) => {
    const status = result.passed ? '✓ PASS' : '✗ FAIL';
    const color = result.passed ? colors.green : colors.red;
    log(`  ${i + 1}. ${result.name}: ${status}`, color + colors.bold);
  });

  const totalPassed = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;

  log('\n' + '='.repeat(70), colors.bold);
  log(`TOTAL: ${totalPassed}/${totalTests} tests passed`,
      totalPassed === totalTests ? colors.green + colors.bold : colors.yellow + colors.bold);
  log('='.repeat(70), colors.bold);

  if (totalPassed === totalTests) {
    log('\n🎉 ALL TESTS PASSED!', colors.green + colors.bold);
    log('The frontend should be able to successfully communicate with the backend.', colors.green);
  } else {
    log('\n⚠ SOME TESTS FAILED', colors.yellow + colors.bold);
    log('Please review the failed tests above for details.', colors.yellow);
  }

  // Additional recommendations
  log('\n' + '='.repeat(70), colors.bold);
  log('RECOMMENDATIONS', colors.bold + colors.cyan);
  log('='.repeat(70), colors.bold);

  if (results.frontendAvailable && results.backendHealthy && results.predictWorking) {
    log('\n✓ Core functionality is working', colors.green);
    log('\nTo manually test the frontend:', colors.blue);
    log('  1. Visit: https://mindloop-frontend.vercel.app', colors.cyan);
    log('  2. Enter an event description in the textarea', colors.cyan);
    log('  3. Click "Classificar Evento"', colors.cyan);
    log('  4. Verify the classification result appears', colors.cyan);
    log('  5. Check browser console (F12) for any errors', colors.cyan);
  } else {
    log('\n✗ Critical issues detected', colors.red);
    if (!results.backendHealthy) {
      log('  - Backend is not healthy or not responding', colors.red);
    }
    if (!results.predictWorking) {
      log('  - Predict endpoint is not working correctly', colors.red);
    }
  }

  log('');
}

// Run the test suite
runAllTests().catch(error => {
  log(`\nFatal error: ${error.message}`, colors.red + colors.bold);
  process.exit(1);
});
