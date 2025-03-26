const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('express-flash');
require('dotenv').config();

// Configurações de autenticação
require('./config/alth2')(passport);
//require('./config/alth')(passport);



const app = express();

// Conecta ao MongoDB
const connectDB = async () => {

    process.on('warning', (warning) => {
        if (warning.name === 'DeprecationWarning') {
          return; // Ignora os avisos de depreciação
        }
        console.warn(warning.name, warning.message);
      });
      
    try {
        console.log("Conectando ao MongoDB...");
        await mongoose.connect(process.env.MONGODB_CONNECT_URI);
        console.log("Conexão com o MongoDB realizada com sucesso");
        
    } catch (error) {
        console.error("Erro ao conectar ao MongoDB:", error);
        process.exit(1); // Encerra o servidor em caso de falha na conexão
    }
};

connectDB();


// Middleware de Body-Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuração da sessão
app.use(session({
    secret: 'seuSegredoAqui',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,  // Defina `secure: true` somente se estiver usando HTTPS
        httpOnly: true  // Impede o acesso via JavaScript no lado do cliente
    }
}));

// Inicialização do Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware de mensagens flash
app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Configuração do Handlebars
const hbs = engine({
    defaultLayout: 'main',
    extname: '.handlebars',
    helpers: {
        eq: (a, b) => a === b,
        json: (context) => JSON.stringify(context),
    },
    runtimeOptions: {
        allowProtoMethodsByDefault: true,
        allowProtoPropertiesByDefault: true,
    },
});

app.engine('handlebars', hbs);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Configuração do Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Servir pastas estáticas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/img', express.static(path.join(__dirname, 'views/img')));
app.use(express.static(path.join(__dirname, 'public')));

// Importar e usar rotas


    // Importa as rotas corretamente
const adminRoutes = require('./routes/admin');
const usuarioRoutes = require('./routes/usuario');

// Usa as rotas no Express
app.use('/admin', adminRoutes);
app.use('/usuarios', usuarioRoutes);


// Tratamento de erros genéricos
app.use((err, req, res, next) => {
    console.error("Erro no servidor:", err.stack);
    res.status(500).send("Erro interno do servidor");
});


// Definindo a porta para o servidor
const PORT = process.env.PORT || 8081;
const HOST = '0.0.0.0';  // Permitir conexões de qualquer IP

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
