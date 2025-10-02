const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Verificar si el dist existe
const distPath = path.join(__dirname, 'dist/frontend/browser');
const indexPath = path.join(distPath, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('❌ Build files not found. Please run: npm run build:prod');
  process.exit(1);
}

// Servir archivos estáticos del dist
app.use(express.static(distPath));

// Manejar rutas de Angular (SPA)
app.get('*', (req, res) => {
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Serving files from: ${distPath}`);
});