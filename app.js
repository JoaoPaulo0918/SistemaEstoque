const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const flash = require('connect-flash');
const multer = require('multer');
const session = require('express-session');
const mongoose = require('mongoose');
const Handlebars = require('handlebars');
const passport = require('passport');
require('dotenv').config();
//require('./config/alth')(passport)


const app = express();

// Conecta ao MongoDB

/*const connectDB = async () => {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_CONNECT_URI).then( async () => {
    console.log("Connected to MongoDB successfully");

  }).catch((error) => {
    console.log("Connection failed: " + error);
  });
}
connectDB();

console.log("MongoDB URI:", process.env.MONGODB_CONNECT_URI);
*/


mongoose.connect('mongodb://localhost/estoque', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Conectado ao MongoDB");
}).catch((err) => {
  console.log("Erro ao se conectar ao MongoDB: " + err);
});


// Configuração do Body-Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuração do Express-Session
app.use(session({
  secret: 'segredo',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize())
app.use(passport.session())
// Middleware para mensagens flash
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null
  next();
});

// Configuração do Handlebars

const hbs = engine({
  defaultLayout: 'main',
  extname: '.handlebars',
  helpers: {
    eq: function (a, b) {
      return a === b;
    },
    json: function(context) {
      return JSON.stringify(context);
    }
  },
  runtimeOptions: {
    allowProtoMethodsByDefault: true,
    allowProtoPropertiesByDefault: true
  }
});

app.engine('handlebars', hbs);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Serve a pasta "uploads" como estática
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve a pasta "views/img" como estática
app.use('/img', express.static(path.join(__dirname, 'views/img')));

// Serve a pasta "public" como estática
app.use(express.static(path.join(__dirname, 'public')));

// Importa e usa as rotas do administrador e usuarios
const adminRoutes = require('./routes/admin');
//const usuarios = require('./routes/usuario')
app.use('/admin', adminRoutes);
//app.use('/usuarios', usuarios);

// Inicia o servidor
const PORT = process.env.PORT || 8081
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
  
});
