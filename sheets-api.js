// Google Sheets API configuration
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Replace with your spreadsheet ID
const API_KEY = 'YOUR_API_KEY'; // Replace with your API key

// Sheet names
const SHEETS = {
    HOUSEHOLDS: 'Households',
    COLLECTIONS: 'Collections'
};

// Helper function to make API requests
async function fetchSheetData(sheetName) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}?key=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.values || [];
    } catch (error) {
        console.error('Error fetching sheet data:', error);
        return [];
    }
}

// Helper function to append data to a sheet
async function appendToSheet(sheetName, data) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: [data]
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Error appending to sheet:', error);
        throw error;
    }
}

// Household functions
async function getHouseholds() {
    const data = await fetchSheetData(SHEETS.HOUSEHOLDS);
    return data.slice(1).map(row => ({
        householdName: row[0],
        address: row[1],
        rep1Name: row[2],
        rep1Phone: row[3],
        rep2Name: row[4],
        rep2Phone: row[5],
        timestamp: row[6]
    }));
}

async function addHousehold(household) {
    const row = [
        household.householdName,
        household.address,
        household.rep1Name,
        household.rep1Phone,
        household.rep2Name || '',
        household.rep2Phone || '',
        new Date().toISOString()
    ];
    return await appendToSheet(SHEETS.HOUSEHOLDS, row);
}

// Collection functions
async function getCollections() {
    const data = await fetchSheetData(SHEETS.COLLECTIONS);
    return data.slice(1).map(row => ({
        householdName: row[0],
        date: row[1],
        amount: parseFloat(row[2]),
        binCondition: row[3],
        notes: row[4],
        timestamp: row[5]
    }));
}

async function addCollection(collection) {
    const row = [
        collection.householdName,
        collection.date,
        collection.amount,
        collection.binCondition,
        collection.notes || '',
        new Date().toISOString()
    ];
    return await appendToSheet(SHEETS.COLLECTIONS, row);
}

// Export functions
window.sheetsAPI = {
    getHouseholds,
    addHousehold,
    getCollections,
    addCollection
}; 