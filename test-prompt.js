// Test script to trigger prompt execution and capture detailed logs
const http = require('http');

const postData = JSON.stringify({
    promptId: 'ch9_p5_pr1',
    userData: {},
    mode: 'mock'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/rag/execute',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('========== SENDING REQUEST ==========');
console.log('URL:', `http://${options.hostname}:${options.port}${options.path}`);
console.log('Body:', postData);
console.log('=====================================\n');

const req = http.request(options, (res) => {
    console.log(`\n========== RESPONSE RECEIVED ==========`);
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers:`, JSON.stringify(res.headers, null, 2));
    console.log('=======================================\n');

    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('========== RESPONSE BODY ==========');
        try {
            const parsed = JSON.parse(data);
            console.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.log('Raw response:', data);
        }
        console.log('===================================\n');
    });
});

req.on('error', (e) => {
    console.error(`\n========== REQUEST ERROR ==========`);
    console.error(`Error: ${e.message}`);
    console.error('===================================\n');
});

req.write(postData);
req.end();
