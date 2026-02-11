#!/usr/bin/env node

/**
 * Quick Test Script
 * Testing API endpoints after fixes
 */

const http = require('http');

function testEndpoint(path, port = 5000) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('AISBS API TEST SUITE');
  console.log('='.repeat(70));

  const tests = [
    { name: 'Health Check', path: '/api/health' },
    { name: 'List Chapters', path: '/api/chapters' },
    { name: 'Get Chapter 1', path: '/api/chapters/ch1' },
    { name: 'Get Problem 1.1 (with safe defaults)', path: '/api/chapters/ch1/problems/ch1_p1' }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n📝 Testing: ${test.name}`);
      console.log(`   URL: ${test.path}`);

      const result = await testEndpoint(test.path);

      if (result.status === 200) {
        console.log(`   ✅ Status: ${result.status}`);
        
        try {
          const body = JSON.parse(result.body);
          console.log(`   ✅ Valid JSON response`);
          
          // Show preview
          if (test.path.includes('problems')) {
            console.log(`   Details:`);
            console.log(`     - ID: ${body.id}`);
            console.log(`     - Title: ${body.title}`);
            console.log(`     - Prompts: ${body.prompts?.length || 0}`);
            console.log(`     - Failure Modes: ${body.failureModes?.length || 0}`);
            console.log(`     - Sections: ${Object.keys(body.sections || {}).length}`);
            
            // Check for undefined errors
            if (body.prompts === undefined || body.failureModes === undefined) {
              console.log(`   ⚠️  Missing required arrays!`);
              failed++;
            } else {
              console.log(`   ✅ All required fields present`);
              passed++;
            }
          } else {
            console.log(`   ✅ Response data received`);
            passed++;
          }
        } catch (parseErr) {
          console.log(`   ❌ Invalid JSON: ${parseErr.message}`);
          failed++;
        }
      } else {
        console.log(`   ❌ Status: ${result.status}`);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log(`   (Make sure backend is running on :5000)`);
      failed++;
    }
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`TEST RESULTS: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(70) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Wait a moment before running tests
setTimeout(runTests, 1000);
