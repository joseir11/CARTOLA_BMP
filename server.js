const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve os arquivos da pasta atual
app.use(express.static(__dirname));

// Fallback para o index.html (importante para PWA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta 3000`);
});
