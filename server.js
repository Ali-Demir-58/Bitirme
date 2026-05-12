const express = require('express');
const cors = require('cors');
const XLSX = require('xlsx');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();

app.use(cors());
app.use(express.json());

// Statik dosyaları yayınla: html, js, css, resources, data vs.
app.use(express.static(__dirname));

const FILE_PATH = path.join(__dirname, 'data', 'data.xlsx');

// =========================
// PAGE ROUTES
// =========================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/analysis', (req, res) => {
    res.sendFile(path.join(__dirname, 'analysis.html'));
});

app.get('/guide', (req, res) => {
    res.sendFile(path.join(__dirname, 'guide.html'));
});

app.get('/iletisim', (req, res) => {
    res.sendFile(path.join(__dirname, 'iletisim.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

// =========================
// EXCEL PARSE HELPERS
// =========================

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
    if (!sheet) return {};

    const rows = XLSX.utils.sheet_to_json(sheet);
    const obj = {};

    rows.forEach(row => {
        const key = String(row['Column1'] || '').trim();
        obj[key] = parseNumber(row['Column2']);
    });

    return obj;
}

function parseStocks(sheet) {
    if (!sheet) return [];

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
    if (!sheet) return [];

    const rows = XLSX.utils.sheet_to_json(sheet);

    return rows.map(row => ({
        name: row['BIST'] || row['BORSA'],
        value: parseNumber(row['SON']),
        change: parseNumber(row['%']),
        diff: parseNumber(row['FARK'])
    }));
}

// =========================
// MARKET DATA API ROUTE
// =========================

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

        res.json(data);
    } catch (err) {
        console.error('Excel okunamadı:', err);
        res.status(500).json({ error: 'Excel okunamadı' });
    }
});

// =========================
// CONTACT FORM MAIL ROUTE
// =========================

const contactTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                error: 'Tüm alanlar zorunludur.'
            });
        }

        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.error('SMTP_USER veya SMTP_PASS eksik.');
            return res.status(500).json({
                success: false,
                error: 'Mail ayarları eksik.'
            });
        }

        await contactTransporter.sendMail({
            from: `"Finansal Analiz Platformu" <${process.env.SMTP_USER}>`,
            to: process.env.CONTACT_TO_EMAIL || 'alidemir200258@gmail.com',
            replyTo: email,
            subject: `[Finansal Analiz Platformu] ${subject}`,
            text: `
Yeni iletişim formu mesajı

Ad Soyad: ${name}
E-posta: ${email}
Konu: ${subject}

Mesaj:
${message}
            `,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Yeni İletişim Formu Mesajı</h2>
                    <p><strong>Ad Soyad:</strong> ${escapeHtml(name)}</p>
                    <p><strong>E-posta:</strong> ${escapeHtml(email)}</p>
                    <p><strong>Konu:</strong> ${escapeHtml(subject)}</p>
                    <hr>
                    <p><strong>Mesaj:</strong></p>
                    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
                </div>
            `
        });

        res.json({
            success: true,
            message: 'Mesaj başarıyla gönderildi.'
        });

    } catch (err) {
        console.error('Mail gönderilemedi:', err);

        res.status(500).json({
            success: false,
            error: 'Mail gönderilemedi.'
        });
    }
});

// Basit HTML escape helper
function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// =========================
// START SERVER
// =========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});