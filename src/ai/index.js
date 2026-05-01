const express = require('express');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({
  path: require('path').join(__dirname, '../../.env'),
});
const app = express();
app.use(express.json());

const PDFParser = require('pdf2json');

async function extractTextFromPdf(filePath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      const text = pdfData.Pages.flatMap((page) => page.Texts)
        .map((t) => decodeURIComponent(t.R[0].T))
        .join(' ');
      resolve(text);
    });

    pdfParser.on('pdfParser_dataError', reject);
    pdfParser.loadPDF(filePath);
  });
}
// Analyse le CV
const Groq = require('groq-sdk');

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function analyzeCvWithAI(filePath) {
  const absolutePath = path.join(__dirname, '../../uploads', filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error('Fichier introuvable: ' + absolutePath);
  }

  const cvText = await extractTextFromPdf(absolutePath);
  console.log('📝 Texte extrait:', cvText.substring(0, 100));

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile', // ✅ gratuit et très puissant
    messages: [
      {
        role: 'user',
        content: `Tu es un expert RH. Analyse ce CV et réponds UNIQUEMENT en JSON avec ce format exact :

{
  "isValid": true ou false,
  "reason": "explication courte",
  "score": nombre entre 0 et 100
}

Critères de validation :
- Contient un nom
- Contient des expériences ou formations
- Le contenu est cohérent (pas du Lorem Ipsum, pas du texte aléatoire)

CV à analyser :
${cvText}`,
      },
    ],
  });

  const rawText = response.choices[0].message.content;
  const clean = rawText.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

// Endpoint appelé par NestJS
app.post('/analyze', async (req, res) => {
  const { cvId, filePath } = req.body;
  console.log(`📄 CV reçu : cvId=${cvId}, file=${filePath}`);

  // Répondre immédiatement
  res.sendStatus(200);

  try {
    // Analyse IA réelle
    console.log(`🤖 Analyse en cours...`);
    const result = await analyzeCvWithAI(filePath);
    console.log(`✅ Résultat IA :`, result);

    // Rappeler NestJS avec le résultat
    await axios.post(
      'http://localhost:3000/webhooks/cv-validation',
      {
        cvId,
        isValid: result.isValid,
        reason: result.reason,
        score: result.score,
      },
      {
        headers: { 'x-webhook-secret': 'mon-secret-1234' },
      },
    );

    console.log(`🔔 Webhook envoyé : cvId=${cvId}, isValid=${result.isValid}`);
  } catch (err) {
    console.error(`❌ Erreur analyse :`, err);

    // En cas d'erreur, notifier NestJS quand même
    await axios.post(
      'http://localhost:3000/webhooks/cv-validation',
      {
        cvId,
        isValid: false,
        reason: 'Erreur lors de l analyse',
        score: 0,
      },
      {
        headers: { 'x-webhook-secret': 'mon-secret-1234' },
      },
    );
  }
});

app.listen(4000, () => {
  console.log('🤖 AI CV Service running on http://localhost:4000');
});
