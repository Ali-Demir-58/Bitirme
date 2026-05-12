const express = require('express');
const cors = require('cors');
const XLSX = require('xlsx');
const path = require('path');

const app = express();
app.use(cors());

const FILE_PATH = path.join(__dirname, 'data', 'data.xlsx');

function parseNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return value;

    const cleaned = String(value)
        .trim()
        .replace(/\./g, '')
        .replace(',', '.');

    const num = Number(cleaned);
    return Number.isNaN(num) ? null : num;
}

function parseKeyValue(sheet) {
    const rows = XLSX.utils.sheet_to_json(sheet);
    const obj = {};

    rows.forEach(row => {
        const key = String(row['Column1'] || '').trim();
        obj[key] = parseNumber(row['Column2']);
    });

    return obj;
}

function parseStocks(sheet) {
    const rows = XLSX.utils.sheet_to_json(sheet);

    return rows.map(row => {
        let symbol = String(row['Column1'] || '').trim();
        let name = String(row['Column2'] || '').trim();

        if (!name && symbol.includes('\n')) {
            const parts = symbol
                .split('\n')
                .map(x => x.trim())
                .filter(Boolean);

            symbol = parts[0] || '';
            name = parts[1] || '';
        }

        return {
            symbol,
            name,
            last: parseNumber(row['Son']),
            high: parseNumber(row['En Yüksek']),
            low: parseNumber(row['En Düşük']),
            volume: parseNumber(row['Hacim(TL)']),
            change: parseNumber(row['Değişim']),
            time: row['_1'] || ''
        };
    });
}

function parseIndex(sheet) {
    const rows = XLSX.utils.sheet_to_json(sheet);

    return rows.map(row => ({
        name: row['BIST'] || row['BORSA'],
        value: parseNumber(row['SON']),
        change: parseNumber(row['%']),
        diff: parseNumber(row['FARK'])
    }));
}

app.get('/api/market-data', (req, res) => {
    try {
        const workbook = XLSX.readFile(FILE_PATH);

        const data = {
            stocks: parseStocks(workbook.Sheets['Hisse Senedleri']),
            dollar: parseKeyValue(workbook.Sheets['Dolar']),
            gold: parseKeyValue(workbook.Sheets['Altın']),
            euro: parseKeyValue(workbook.Sheets['Euro']),
            bist100: parseIndex(workbook.Sheets['BIST100']),
            sp500: parseIndex(workbook.Sheets['S&P'])
        };

        console.log('Okunan Excel:', FILE_PATH);
        console.log('FROTO kontrol:', data.stocks.find(s => s.symbol === 'FROTO'));

        res.json(data);
    } catch (err) {
        console.error('Excel okunamadı:', err);
        res.status(500).json({ error: 'Excel okunamadı' });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});