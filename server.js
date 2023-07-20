const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/productModel');
const User = require('./models/userModel');
const cors = require('cors');
const app = express();
const qrcode = require('qrcode');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const jwtSecret = 'total123';


// *************************** FUNÇÕES *********************
function generateRandomString(length) {
   return crypto.randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
}

function generateToken(user) {
   const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });
   return token;
}

function authenticateToken(req, res, next) {
   const authHeader = req.headers['authorization'];
   const token = authHeader && authHeader.split(' ')[1];

   if (token == null) {
      return res.sendStatus(401);
   }

   jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
         return res.sendStatus(403);
      }

      req.user = user;
      next();
   });
}

async function generateRandomQRCode() {
   const randomString = generateRandomString(10);

   try {
      const qrCodeDataURL = await qrcode.toDataURL(randomString);
      const base64Image = qrCodeDataURL.split(',')[1];
      return base64Image;
   } catch (error) {
      console.error('Erro ao gerar o QRCode:', error);
      return null;
   }
}
// *************************** FIM FUNÇÕES *********************

// *************************** ESSENCIAL ***********************
mongoose.set("strictQuery", false);
mongoose.connect('mongodb+srv://hfazollo:ms2xojhc@nodejscluster.obgocjh.mongodb.net/Node-API?retryWrites=true&w=majority')
   .then(() => {
      console.log('Connected to MongoDB');
      app.listen(3030, () => {
         console.log(`Node API is now running on port 3030`);
      });
   }).catch((error) => {
      console.log(error);
   });

app.use(express.json());
app.use(cors());
// *************************** FIM ESSENCIAL *******************

// *************************** ROTAS ***************************
// Registro
app.post('/register', async (req, res) => {
   try {
      const { username, password } = req.body;

      const existingUser = await User.findOne({ username });
      if (existingUser) {
         return res.status(400).json({ message: 'Usuário já existe' });
      }

      const user = await User.create({ username, password });
      const token = generateToken(user);

      res.status(200).json({ token });
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
});

// Autenticação
app.post('/auth', async (req, res) => {
   try {
      const { username, password } = req.body;

      const user = await User.findOne({ username });
      if (!user) {
         return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      if (user.password !== password) {
         return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const token = generateToken(user);

      res.status(201).json({ token });
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
});

// Buscar todos
app.get('/products', authenticateToken, async (req, res) => {
   try {
      const products = await Product.find({});
      res.status(200).json(products);
   } catch (error) {
      res.status(500).json({ message: error.message })
   }
});

// Gerar QRCode
app.get('/qrcode', authenticateToken, async (req, res) => {
   try {
      const qrCode = await generateRandomQRCode();
      if (qrCode) {
         res.status(200).json({ qrCode });
      } else {
         res.status(404).json({ message: 'QR Code not found' });
      }
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
});

// Filtrar
app.get('/products/:id', authenticateToken, async (req, res) => {
   try {
      const { id } = req.params;
      const product = await Product.findById(id);
      res.status(200).json(product);
   } catch (error) {
      res.status(500).json({ message: error.message })
   }
});

// Adicionar
app.post('/products', authenticateToken, async (req, res) => {
   try {
      const product = await Product.create(req.body);
      res.status(200).json(product);
   } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: error.message });
   }
});

// Editar
app.put('/products/:id', authenticateToken, async (req, res) => {
   try {
      const { id } = req.params;
      const product = await Product.findByIdAndUpdate(id, req.body);
      if (!product)
         return res.status(404).json({ message: `Cannot find any product with ID ${id}` });
      const updatedProduct = await Product.findById(id);
      res.status(200).json(updatedProduct);
   } catch (error) {
      res.status(500).json({ message: error.message })
   }
});

// Delete
app.delete('/products/:id', authenticateToken, async (req, res) => {
   try {
      const { id } = req.params;
      const product = await Product.findByIdAndDelete(id);
      if (!product)
         return res.status(404).json({ message: `Cannot find any product with ID ${id}` });
      res.status(200).json(product);
   } catch (error) {
      res.status(500).json({ message: error.message })
   }
});
