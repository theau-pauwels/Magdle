import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// --- CONFIGURATION DES CHEMINS ---
// Ces lignes servent à se repérer correctement dans tes dossiers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// On pointe vers le fichier champions.json (on remonte d'un dossier avec '..')
const championsPath = path.join(__dirname, '../data/champions.json');
const planningPath = path.join(__dirname, '../data/planning.json');

// --- CHARGEMENT DES DONNÉES ---
let championsData;
try {
  championsData = require(championsPath);
} catch (error) {
  console.error("❌ Erreur : Impossible de trouver champions.json !");
  console.error("Vérifie que le fichier est bien ici : " + championsPath);
  process.exit(1);
}

// --- LOGIQUE DE GÉNÉRATION ---
const planning = {};
const today = new Date();

// Fonction pour "crypter" en Base64
const encryptName = (name) => {
  return Buffer.from(name).toString('base64');
};

console.log(`🎲 Génération du planning avec ${championsData.length} champions...`);

// Génération pour 365 jours
for (let i = 0; i < 365; i++) {
  const date = new Date(today);
  date.setDate(today.getDate() + i);
  
  // Format YYYY-MM-DD (ex: 2025-12-10)
  const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  
  const year = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;
  const dateStr = `${year}-${month}-${day}`;

  // Vrai aléatoire
  const randomIndex = Math.floor(Math.random() * championsData.length);
  const selectedChampion = championsData[randomIndex];

  // Sauvegarde cryptée
  planning[dateStr] = encryptName(selectedChampion.name);
}

// --- ÉCRITURE DU FICHIER ---
try {
  fs.writeFileSync(planningPath, JSON.stringify(planning, null, 2));
  console.log("✅ SUCCÈS ! Planning généré et crypté.");
  console.log(`📁 Fichier créé ici : ${planningPath}`);
  console.log("Exemple crypté pour aujourd'hui : " + Object.values(planning)[0]);
} catch (error) {
  console.error("❌ Erreur lors de l'écriture du fichier :", error);
}