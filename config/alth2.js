// Importa a estratégia local do Passport para autenticação
const LocalStrategy = require('passport-local').Strategy;

// Importa o Mongoose para interagir com o banco de dados MongoDB
const mongoose = require('mongoose');

const Usuario = require('../modules/Usuario'); // ✅ Forma correta

const bcrypt = require('bcryptjs'); // Para comparar senhas

// Exporta a configuração do Passport para autenticação
module.exports = function(passport) {
  
  // Define uma nova estratégia de autenticação local utilizando "usuario" como identificador
  passport.use(new LocalStrategy({
    usernameField: 'usuario',
    passwordField: 'senha'
    
  }, async (usuario, senha, done) => {
    try {
      const user = await Usuario.findOne({ usuario: usuario });
  
      if (!user) {
        return done(null, false, { message: 'Usuário não encontrado' });
      }
  
      const isMatch = await bcrypt.compare(senha, user.senha);
  
      if (isMatch) {
        return done(null, user);  // Autenticação bem-sucedida
      } else {
        return done(null, false, { message: 'Senha incorreta' });
      }
    } catch (err) {
      console.log(err);  // Logando o erro
      return done(err);  // Passando o erro para o Passport
    }
  }));
  
  

 // No seu arquivo de configuração do Passport (geralmente em passport.js ou no arquivo onde você configura as estratégias):
passport.serializeUser((usuario, done) => {
  done(null, usuario.id); // Armazenando o ID do usuário na sessão
});

passport.deserializeUser(async (id, done) => {
  try {
    const usuario = await Usuario.findById(id); // Busca o usuário com base no ID armazenado
    done(null, usuario);
  } catch (erro) {
    done(erro, null);
  }
});

};
