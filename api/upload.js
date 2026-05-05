const { put } = require('@vercel/blob');

async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    const { file, filename } = req.body;

    if (!file || !filename) {
      return res.status(400).json({ error: 'Arquivo e nome do arquivo são obrigatórios.' });
    }

    // O arquivo vem em formato Base64 do frontend: "data:image/jpeg;base64,/9j/4AAQ..."
    const base64Data = file.split(',')[1];
    
    if (!base64Data) {
      return res.status(400).json({ error: 'Formato de arquivo inválido.' });
    }

    // Converte o Base64 em um Buffer binário
    const buffer = Buffer.from(base64Data, 'base64');

    // Gera um nome de arquivo único para não sobrescrever
    const uniqueFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '')}`;

    // Envia para o Vercel Blob
    const blob = await put(uniqueFilename, buffer, {
      access: 'public',
      contentType: file.split(';')[0].split(':')[1] // Extrai o mime-type ex: "image/jpeg"
    });

    // Retorna a URL pública gerada
    return res.status(200).json({ url: blob.url });

  } catch (error) {
    console.error('Erro no upload para o Blob:', error);
    return res.status(500).json({ error: 'Erro interno no servidor de upload.', details: error.message });
  }
}

module.exports = handler;
