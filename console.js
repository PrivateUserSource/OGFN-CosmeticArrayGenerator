const { createInterface } = require('readline');
const fetch = require('node-fetch');
const fs = require('fs');

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

const cosmetics = [];
let shopLayout = {
    featured: [],
    daily: []
};

function getPriceFromRarity(backendValue, cosmeticType) {
    const type = cosmeticType.toLowerCase();
    
    if (type.startsWith('athenadance')) {
        if (backendValue.endsWith('Common')) return 0;
        if (backendValue.endsWith('Uncommon')) return 200;
        if (backendValue.endsWith('Rare')) return 500;
        if (backendValue.endsWith('Epic')) return 800;
        if (backendValue.endsWith('Legendary')) return 1000;
    }
    else if (type.startsWith('athenacharacter')) {
        if (backendValue.endsWith('Common')) return 0;
        if (backendValue.endsWith('Uncommon')) return 800;
        if (backendValue.endsWith('Rare')) return 1200;
        if (backendValue.endsWith('Epic')) return 1500;
        if (backendValue.endsWith('Legendary')) return 2000;
    }
    else if (type.startsWith('athenapickaxe')) {
        if (backendValue.endsWith('Common')) return 0;
        if (backendValue.endsWith('Uncommon')) return 500;
        if (backendValue.endsWith('Rare')) return 800;
        if (backendValue.endsWith('Epic')) return 1500;
        if (backendValue.endsWith('Legendary')) return 2000;
    }
    else if (type.startsWith('athenaglider')) {
        if (backendValue.endsWith('Common')) return 0;
        if (backendValue.endsWith('Uncommon')) return 500;
        if (backendValue.endsWith('Rare')) return 800;
        if (backendValue.endsWith('Epic')) return 1200;
        if (backendValue.endsWith('Legendary')) return 1500;
    }
    
    return 800;
}

async function fetchCosmeticData(name) {
    console.log('Fetching Cosmetic Data...');
    try {
        const response = await fetch(`https://fortnite-api.com/v2/cosmetics/br/search?name=${encodeURIComponent(name)}`);
        const data = await response.json();
        
        if (data.status === 200 && data.data) {
            console.log('Found cosmetic data');
            const backendValue = data.data.type.backendValue;
            const cosmeticToPush = backendValue + ":" + data.data.id;
            const price = getPriceFromRarity(data.data.rarity.backendValue, backendValue);
            console.log(`Type: ${backendValue}, Rarity: ${data.data.rarity.backendValue}, Price: ${price}`);
            return { id: cosmeticToPush, price };
        } else {
            console.log('Cosmetic not found');
            return null;
        }
    } catch (error) {
        console.log('Error fetching cosmetic:', error.message);
        return null;
    }
}

function askForOption() {
    console.log('Cosmetic Array Generator');
    console.log('By @privateuserttv');
    console.log('discord.gg/rewindogfn');
    console.log('------------------------');
    console.log('[1] Cosmetic Array Generator');
    console.log('[2] Shop Layout Generator');
    
    rl.question('Select an option (1 or 2): ', (answer) => {
        if (answer === '1') {
            askForCosmetic();
        } else if (answer === '2') {
            rl.question('Would you like to add to an existing JSON? (Y/N): ', (useExisting) => {
                if (useExisting.toLowerCase() === 'y') {
                    askForShopLayout();
                } else {
                    askForNextItem();
                }
            });
        } else {
            console.log('Invalid option. Please select 1 or 2.');
            askForOption();
        }
    });
}

async function askForCosmetic() {
    rl.question('Enter cosmetic name (or "done" to finish): ', async (name) => {
        if (name.toLowerCase() === 'done') {
            console.log('Final Cosmetic Array:', JSON.stringify(cosmetics).replace('[', '{').replace(']', '}'));
            console.log('\nReturning to main menu...\n');
            askForOption();
            return;
        }

        const cosmeticData = await fetchCosmeticData(name);
        if (cosmeticData) {
            cosmetics.push(cosmeticData.id);
        }
        askForCosmetic();
    });
}

async function askForShopLayout() {
    rl.question('Enter the path to your shop layout JSON file: ', (filePath) => {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            shopLayout = JSON.parse(fileContent);
            console.log('Shop layout loaded successfully!');
            askForNextItem();
        } catch (error) {
            console.error('Error reading or parsing the file:', error.message);
            askForShopLayout();
        }
    });
}

async function askForNextItem() {
    rl.question('Enter item name (or "done" to finish): ', async (name) => {
        if (name.toLowerCase() === 'done') {
            console.log('Final Shop Layout:', JSON.stringify(shopLayout, null, 2));
            console.log('\nReturning to main menu...\n');
            shopLayout = { featured: [], daily: [] }; // Reset shop layout
            askForOption();
            return;
        }

        const cosmeticData = await fetchCosmeticData(name);
        if (cosmeticData) {
            rl.question('Add to featured [1] or daily [2] section?: ', (section) => {
                const item = {
                    itemGrants: [cosmeticData.id],
                    price: cosmeticData.price
                };
                
                if (section === '1') {
                    shopLayout.featured.push(item);
                    console.log(`Added to featured section with price ${cosmeticData.price}`);
                } else if (section === '2') {
                    shopLayout.daily.push(item);
                    console.log(`Added to daily section with price ${cosmeticData.price}`);
                } else {
                    console.log('Invalid section. Item not added.');
                }
                askForNextItem();
            });
        } else {
            askForNextItem();
        }
    });
}

try {
    require.resolve('node-fetch');
} catch (e) {
    const { execSync } = require('child_process');
    execSync('npm install node-fetch');
}

askForOption();
