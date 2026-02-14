// Direct test bez Express servera
const { executeRAG } = require('./rag/index.js');

console.log('Starting direct RAG test...');

async function test() {
    try {
        console.log('\n🧪 Testing with ch9_p5_pr1...\n');

        const result = await executeRAG(
            'ch9_p5_pr1', // Prompt koji pada
            {}, // Prazan userData
            'mock', // Mock mode
            {} // No options
        );

        console.log('\n✅ SUCCESS!');
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.log('\n❌ ERROR!');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Full error:', error);
    }
}

test();
