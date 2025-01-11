const { createInterface } = require('readline');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

const cosmetics = {};

async function fetchCosmeticData(name) {
    console.log('Fetching Cosmetic Data...');
    try {
        // change the url to whatever you want ig? just recommend using this fortnite api.
        const response = await fetch(`https://fortnite-api.com/v2/cosmetics/br/search?name=${encodeURIComponent(name)}`); 
        const data = await response.json();
        
        if (data.status === 200 && data.data) {
            console.log('Found backendValue');
            console.log('Found id');
            const backendValue = data.data.id;
            cosmetics[backendValue] = data.data.id;
            console.log(`Added "${backendValue}:${data.data.id}" to the array.`);
        } else {
            console.log('Cosmetic not found');
        }
    } catch (error) {
        console.log('Error fetching cosmetic:', error.message);
    }
}

async function askForCosmetic() {
    rl.question('Enter cosmetic name (or type "finish" to generate array): ', async (answer) => {
        if (answer.toLowerCase() === 'finish') {
            console.log('\nGenerated Array:');
            console.log(JSON.stringify(cosmetics, null, 2));
            rl.close();
        } else {
            await fetchCosmeticData(answer);
            askForCosmetic();
        }
    });
}

console.log('Cosmetic Array Generator');
console.log('By @privateuserttv');
console.log('discord.gg/rewindogfn');
console.log('------------------------');

try {
    require.resolve('node-fetch');
} catch {
    console.log('Installing required dependencies...');
    const { execSync } = require('child_process');
    execSync('npm install node-fetch');
}

askForCosmetic();
