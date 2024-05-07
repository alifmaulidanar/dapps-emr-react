import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function untuk membaca baris terakhir dari file
function readLastLine(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                return reject(err);
            }
            const lines = data.toString().trim().split('\n');
            resolve(lines[lines.length - 1]);
        });
    });
}

// Function untuk parse kode
function parseCode(code) {
    const indexFront = parseInt(code.slice(0, 3));
    const region = code.slice(3, 4);
    const indexBack = parseInt(code.slice(4, 7));
    return [indexFront, region, indexBack];
}

// Function untuk format kode berdasarkan index dan kode wilayah
function formatCode(indexFront, regionCode, indexBack) {
    const regionMap = { '1': 'H', '2': 'M', '3': 'P', '4': 'L' };
    const region = regionMap[regionCode];
    return `${indexFront.toString().padStart(3, '0')}${region}${indexBack.toString().padStart(3, '0')}`;
}

// Function untuk generate kode pasien
async function generatePatientDMR(regionCode) {
    const filePath = path.join(__dirname, 'dmrList.txt');
    try {
        const lastLine = await readLastLine(filePath);
        let [indexFront, region, indexBack] = parseCode(lastLine);

        indexBack++;
        if (indexBack > 999) {
            indexBack = 0;
            indexFront++;
        }

        const newCode = formatCode(indexFront, regionCode, indexBack);
        // Append the new code to the file
        fs.appendFileSync(filePath, `\n${newCode}`);
        return newCode;
    } catch (error) {
        console.error('Failed to generate patient code:', error);
        throw error;
    }
}

// Function untuk membaca dan increment 16 digit angka
async function generatePatientEMR() {
    const filePath = path.join(__dirname, 'emrList.txt');
    try {
        // Membaca data dari file
        const data = fs.readFileSync(filePath, 'utf8').trim();
        let currentNumber = data ? BigInt(data.split('\n').pop()) : BigInt(0); // Ambil angka terakhir atau mulai dari 0 jika file kosong

        currentNumber++; // Increment angka

        // Menformat angka ke string dengan panjang 16 karakter, diisi '0' di depan jika perlu
        const formattedNumber = currentNumber.toString().padStart(16, '0');

        // Menulis angka baru ke file di baris baru
        fs.appendFileSync(filePath, `\n${formattedNumber}`);
        return formattedNumber; // Mengembalikan angka yang telah diincrement dan diformat
    } catch (error) {
        console.error('Failed to increment EMR number:', error);
        throw error;
    }
}

export { generatePatientDMR, generatePatientEMR };
