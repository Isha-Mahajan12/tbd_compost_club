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
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.values || [];
    } catch (error) {
        console.error('Error fetching sheet data:', error);
        throw error;
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
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error appending to sheet:', error);
        throw error;
    }
}

// Household functions
async function getHouseholds() {
    try {
        const data = await fetchSheetData(SHEETS.HOUSEHOLDS);
        return data.slice(1).map(row => ({
            householdName: row[0],
            address: row[1],
            rep1Name: row[2],
            rep1Phone: row[3],
            rep1WhatsApp: row[4] === 'TRUE',
            rep2Name: row[5],
            rep2Phone: row[6],
            rep2WhatsApp: row[7] === 'TRUE',
            timestamp: row[8]
        }));
    } catch (error) {
        console.error('Error getting households:', error);
        throw error;
    }
}

async function addHousehold(household) {
    try {
        // Validate required fields
        if (!household.householdName || !household.address || !household.rep1Name || !household.rep1Phone) {
            throw new Error('Missing required fields');
        }

        const row = [
            household.householdName,
            household.address,
            household.rep1Name,
            household.rep1Phone,
            household.rep1WhatsApp ? 'TRUE' : 'FALSE',
            household.rep2Name || '',
            household.rep2Phone || '',
            household.rep2WhatsApp ? 'TRUE' : 'FALSE',
            new Date().toISOString()
        ];
        
        await appendToSheet(SHEETS.HOUSEHOLDS, row);
        return { success: true, message: 'Household added successfully' };
    } catch (error) {
        console.error('Error adding household:', error);
        throw error;
    }
}

// Collection functions
async function getCollections() {
    try {
        const data = await fetchSheetData(SHEETS.COLLECTIONS);
        return data.slice(1).map(row => ({
            householdName: row[0],
            date: row[1],
            amount: parseFloat(row[2]),
            binCondition: row[3],
            notes: row[4],
            timestamp: row[5]
        }));
    } catch (error) {
        console.error('Error getting collections:', error);
        throw error;
    }
}

async function addCollection(collection) {
    try {
        // Validate required fields
        if (!collection.householdName || !collection.date || !collection.amount || !collection.binCondition) {
            throw new Error('Missing required fields');
        }

        // Validate amount
        if (isNaN(collection.amount) || collection.amount <= 0) {
            throw new Error('Invalid amount');
        }

        const row = [
            collection.householdName,
            collection.date,
            collection.amount,
            collection.binCondition,
            collection.notes || '',
            new Date().toISOString()
        ];
        
        await appendToSheet(SHEETS.COLLECTIONS, row);
        return { success: true, message: 'Collection logged successfully' };
    } catch (error) {
        console.error('Error adding collection:', error);
        throw error;
    }
}

// Export functions
window.sheetsAPI = {
    getHouseholds,
    addHousehold,
    getCollections,
    addCollection
}; 