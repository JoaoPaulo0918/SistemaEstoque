const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const passport = require('passport');
const bcrypt = require("bcryptjs");
const { eAdmin } = require('../helpers/eAdmin');
const moment = require("moment-timezone");// pega hora e data atual
require('../modules/Equipamentos'); // Carrega o módulo Equipamentos
require('../modules/Materiais'); // Carrega o módulo Materiais
require('../modules/OS'); // Carrega o módulo de OS
require('../modules/Horas'); //Carrega o módulo de horas


const Material = mongoose.model('Material');
const Produto = mongoose.model('Produto');
const OrdemServico = mongoose.model('OrdemServico');
const Usuario = require('../modules/Usuario'); // ✅ Forma correta
const Tempo = mongoose.model('Tempo');




// Configuração do multer para salvar as imagens na pasta 'uploads'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Pasta onde as imagens serão salvas
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Nome único para o arquivo
  }
});

const upload = multer({ storage: storage });


router.get('/', (req, res) => {
    res.render('index')
});

router.get('/inicio', eAdmin, async (req, res) => {
  res.render('admin/inicio')
});


//Rota da pagina de materiais
router.get('/estoqueMateriais', eAdmin, (req, res) => {
  res.render('admin/materiais', { usuario: req.user });
});


// Rota para processar o cadastro de materiais
router.post("/estoqueMateriais/cadastrar", eAdmin, async (req, res) => {
  const erros = [];

  if (!req.body.nome) erros.push({ texto: "Nome inválido" });
  if (!req.body.marca) erros.push({ texto: "Marca inválida" });
  if (!req.body.qtd || req.body.qtd <= 0) erros.push({ texto: "Quantidade inválida" });

  if (erros.length > 0) {
      return res.render("admin/estoqueMateriais", { erros });
  }

  try {
      const novoMaterial = new Material({
          nome: req.body.nome,
          marca: req.body.marca,
          observacao: req.body.observacao || "",
          qtd: req.body.qtd,
          salvarEstoque: req.body.salvarEstoque === "on",
          usuario: req.user._id  // Associando ao usuário logado
      });

      await novoMaterial.save();
      req.flash("success_msg", "Material cadastrado com sucesso!");
      res.redirect("/admin/estoqueMateriais");

  } catch (error) {
      console.error("Erro ao cadastrar material:", error);
      req.flash("error_msg", "Houve um erro ao salvar o material, tente novamente!");
      res.redirect("/admin/estoqueMateriais");
  }
});


// Rota para listar materiais
router.get("/estoqueMateriais/json", eAdmin, async (req, res) => {
  try {
    const materiais = await Material.find({ usuario: req.user._id }).lean();
    res.json(materiais);
  } catch (error) {
    console.error("Erro ao buscar materiais:", error);
    res.status(500).json({ error: "Erro ao carregar os materiais." });
  }
});



//Rotas para edição dos materiais
router.get("/editMateriais", (req, res) => {
  res.render("admin/editMateriais");
});


//Rotas para editar os materiais
router.get("/materiais/edit/:id", async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      req.flash("error_msg", "Produto não encontrado");
      return res.redirect("/admin/estoqueMateriais");
    }
    res.render("admin/editMateriais", { material });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Erro ao buscar o material");
    res.redirect("/admin/estoqueMateriais");
  }
});

router.post("/materiais/update/:id", eAdmin, async (req, res) => {
  try {
    const material = await Material.findOne({ _id: req.params.id, usuario: req.user._id });

    if (!material) {
      req.flash("error_msg", "Você não tem permissão para editar este material.");
      return res.redirect("/admin/estoqueMateriais");
    }

    await Material.findByIdAndUpdate(req.params.id, {
      nome: req.body.nome,
      marca: req.body.marca,
      qtd: req.body.qtd,
      observacao: req.body.observacao
    });

    req.flash("success_msg", "Material atualizado com sucesso!");
    res.redirect("/admin/estoqueMateriais");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Erro ao atualizar o material");
    res.redirect("/admin/materiais/edit/" + req.params.id);
  }
});

//Rota para deletar 
router.post('/materiais/deletar', eAdmin, async (req, res) => {
  try {
    const material = await Material.findOne({ _id: req.body.id, usuario: req.user._id });

    if (!material) {
      req.flash("error_msg", "Você não tem permissão para deletar este material.");
      return res.redirect('/admin/estoqueMateriais');
    }

    await Material.deleteOne({ _id: req.body.id });
    req.flash('success_msg', 'Material deletado com sucesso!');
    res.redirect('/admin/estoqueMateriais');
  } catch (error) {
    req.flash('error_msg', 'Erro ao deletar o material');
    res.redirect('/admin/inicio');
  }
});





// Rota para renderizar o formulário
router.get("/estoqueEquipamentos", eAdmin, (req, res) => {
  res.render("admin/equipamentos", { usuario: req.user });
});

// Rota para processar o cadastro dos equipamentos
router.post("/estoqueEquipamentos/cadastrar", eAdmin, async (req, res) => {
  const erros = [];

  if (!req.body.marca) erros.push({ texto: "Marca inválida" });
  if (!req.body.mac) erros.push({ texto: "MAC inválido" });
  if (!req.body.qtd || req.body.qtd <= 0) erros.push({ texto: "Quantidade inválida" });

  if (erros.length > 0) {
      return res.render("admin/estoqueEquipamentos", { erros });
  }

  try {
      const novoProduto = new Produto({
          marca: req.body.marca,
          mac: req.body.mac,
          observacao: req.body.observacao || "",
          qtd: req.body.qtd,
          salvarEstoque: req.body.salvarEstoque === "on",
          usuario: req.user._id  // Associando ao usuário logado
      });

      await novoProduto.save();
      req.flash("success_msg", "Equipamento cadastrado com sucesso!");
      res.redirect("/admin/estoqueEquipamentos");

  } catch (error) {
      console.error("Erro ao cadastrar equipamento:", error);
      req.flash("error_msg", "Houve um erro ao salvar o Equipamento, tente novamente!");
      res.redirect("/admin/estoqueEquipamentos");
  }
});


// Rota para listar produtos
router.get("/estoqueEquipamentos/json", eAdmin, async (req, res) => {
  try {
    const produtos = await Produto.find({ usuario: req.user._id }).lean();
    res.json(produtos);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ error: "Erro ao carregar os produtos." });
  }
});


router.get("/editEquipamentos", (req, res) => {
  res.render("admin/editEquipamentos");
});

//Rota para editar os produtos
router.get("/produtos/edit/:id", async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);
    if (!produto) {
      req.flash("error_msg", "Produto não encontrado");
      return res.redirect("/admin/estoqueEquipamentos");
    }
    res.render("admin/editEquipamentos", { produto });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Erro ao buscar o produto");
    res.redirect("/admin/estoqueEquipamentos");
  }
});

//Rota post de atualização
router.post("/estoqueEquipamentos/update/:id", eAdmin, async (req, res) => {
  try {
    const produto = await Produto.findOne({ _id: req.params.id, usuario: req.user._id });

    if (!produto) {
      req.flash("error_msg", "Você não tem permissão para editar este produto.");
      return res.redirect("/admin/estoqueEquipamentos");
    }

    await Produto.findByIdAndUpdate(req.params.id, req.body);
    req.flash("success_msg", "Produto atualizado com sucesso!");
    res.redirect("/admin/estoqueEquipamentos");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Erro ao atualizar o produto.");
    res.redirect("/admin/estoqueEquipamentos");
  }
});


//Rota para deletar 
router.post("/estoqueEquipamentos/deletar", eAdmin, async (req, res) => {
  try {
    const produto = await Produto.findOneAndDelete({ _id: req.body.id, usuario: req.user._id });

    if (!produto) {
      req.flash("error_msg", "Você não tem permissão para deletar este produto.");
    } else {
      req.flash("success_msg", "Produto deletado com sucesso!");
    }

    res.redirect("/admin/estoqueEquipamentos");
  } catch (error) {
    req.flash("error_msg", "Erro ao deletar o produto.");
    res.redirect("/admin/estoqueEquipamentos");
  }
});



//Rota para ordem de serviço
router.get("/OrdemServico", eAdmin, (req, res) => {
  res.render("admin/os", { usuario: req.user });
});



router.post("/ordemServico/cadastrar", eAdmin, async (req, res) => {
  try {
    const novaOS = new OrdemServico({
      diaSemana: req.body.diaSemana,
      qtd: req.body.qtd,
      pontuacao: req.body.pontuacao,
      observacao: req.body.observacao || "", // Se não for informado, fica como string vazia
      usuario: req.user._id // Vínculo com o usuário logado
    });

    await novaOS.save();
    req.flash("success_msg", "Ordem de Serviço criada com sucesso!");
    res.redirect("/admin/ordemServico");
  } catch (error) {
    console.error("Erro ao cadastrar OS:", error);
    req.flash("error_msg", "Erro ao criar a OS.");
    res.redirect("/admin/ordemServico");
  }
});




// Rota para buscar as ordens de serviço em JSON
router.get("/ordemServico/dados", eAdmin, async (req, res) => {
  try {
    const ordemServico = await OrdemServico.find({ usuario: req.user._id }).lean();
    res.json(ordemServico);
  } catch (error) {
    console.error("Erro ao buscar ordens de serviço:", error);
    res.status(500).json({ error: "Erro ao carregar as ordens de serviço." });
  }
});


router.get("/editOrdem", (req, res) => {
  res.render("admin/editOrdem")
});

//Rotas para editar as os
router.get("/ordemServico/edit/:id", async (req, res) => {
  try {
    const ordem = await OrdemServico.findById(req.params.id);
    if (!ordem) {
      req.flash("error_msg", "Ordem não encontrado");
      return res.redirect("/admin/OrdemServico");
    }
    res.render("admin/editOrdem", { ordem });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Erro ao buscar a ordem");
    res.redirect("/admin/OrdemServico");
  }
});

router.post("/ordemServico/update/:id", eAdmin, async (req, res) => {
  try {
    const ordemServico = await OrdemServico.findOne({ _id: req.params.id, usuario: req.user._id });

    if (!ordemServico) {
      req.flash("error_msg", "Você não tem permissão para editar esta ordem de serviço.");
      return res.redirect("/admin/ordemServico");
    }

    // Atualiza apenas os campos permitidos
    ordemServico.pontuacao = req.body.pontuacao;
    ordemServico.observacao = req.body.observacao || ""; // Se não vier nada, mantém vazio

    await ordemServico.save();
    req.flash("success_msg", "Ordem de Serviço atualizada com sucesso!");
    res.redirect("/admin/ordemServico");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Erro ao atualizar a Ordem de Serviço.");
    res.redirect("/admin/ordemServico");
  }
});



//Rota para deletar tudo na tabela
router.post("/ordemServico/deletar-tudo", async (req, res) => {
  try {
    // Deleta todas as ordens de serviço associadas ao usuário logado
    const resultado = await OrdemServico.deleteMany({ usuario: req.user._id });

    if (resultado.deletedCount === 0) {
      req.flash("error_msg", "Nenhuma Ordem de Serviço encontrada para deletar.");
    } else {
      req.flash("success_msg", "Todas as Ordens de Serviço foram deletadas com sucesso!");
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Erro ao deletar as Ordens de Serviço.");
    res.status(500).json({ success: false });
  }
});



//Rota get de formulario do usuario
router.get('/dados/add', (req, res) => {
  res.render('admin/formulario');
});


//Rota para cadastrar usuarios
router.post('/dados/nova', (req, res) => {
  var erros = [];

  if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
    erros.push({ texto: 'Nome inválido' });
  }

  if (!req.body.usuario || typeof req.body.usuario == undefined || req.body.usuario == null) {
    erros.push({ texto: 'Usuario inválido' });
  }

  if (!req.body.telefone || typeof req.body.telefone == undefined || req.body.telefone == null) {
    erros.push({ texto: 'Telefone inválido' });
  }

  if (!req.body.funcao || typeof req.body.funcao == undefined || req.body.funcao == null) {
    erros.push({ texto: 'Função inválida' });
  }
  
  if (!req.body.veiculo || typeof req.body.veiculo == undefined || req.body.veiculo == null) {
    erros.push({ texto: 'Veículo inválido' });
  }
  

  const bcrypt = require('bcryptjs');

  // Se houver erros, renderiza a página de registro com erros
if (erros.length > 0) {
  console.log(erros); // Exibe erros de validação para depuração
  res.render("usuarios/registro", { erros: erros });
} else {
  // Verifica se já existe um usuário com o nome de usuário fornecido
  Usuario.findOne({ usuario: req.body.usuario }).then((usuario) => {
      if (usuario) {
          req.flash("error_msg", "Já existe uma conta com este nome de usuário no nosso sistema");
          res.redirect("/usuarios/registro");
      } else {
          console.log(req.body); // Exibe os dados do corpo da requisição para depuração
          const novoUsuario = new Usuario({
            nome: req.body.nome,
            usuario: req.body.usuario,
            senha: req.body.senha,
            telefone: req.body.telefone,
            funcao: req.body.funcao,
            veiculo: req.body.veiculo,
          });

          // Hash da senha do usuário antes de salvar
          bcrypt.genSalt(10, (erro, salt) => {
              bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                  if (erro) {
                      console.log(erro); // Exibe erro de hashing para depuração
                      req.flash("error_msg", "Houve um erro durante o salvamento do usuário");
                      res.redirect("/");
                  }

                  novoUsuario.senha = hash; // Substitui a senha em texto puro pelo hash

                  // Salva o novo usuário no banco de dados
                  novoUsuario.save().then(() => {
                      req.flash("success_msg", "Usuário criado com sucesso!");
                      res.redirect("/admin");
                  }).catch((error) => {
                      console.log(error); // Exibe erro ao salvar o usuário para depuração
                      req.flash("error_msg", "Houve um erro ao criar o usuário, tente novamente!");
                      res.redirect("/usuarios/registro");
                  });
              });
          });
      }
  }).catch((error) => {
      req.flash("error_msg", "Houve um erro interno!");
      res.redirect("/");
  });
}

});


//Rota get para editar usuario a partir do id
router.get('/dados/edit/:id', (req, res) => {
  Usuario.findOne({ _id: req.params.id }).lean().then((dados) => {
    if (!dados) {
      req.flash('error_msg', 'Estes dados não existem!');
      return res.redirect('/admin/inicio');
    }
    res.render('admin/editPerfil', { dados: dados });
  }).catch((error) => {
    req.flash('error_msg', 'Houve um erro ao carregar os dados para edição!');
    res.redirect('/admin/inicio');
  });
});



//Rota post para editar usuario
router.post('/dados/edit', async (req, res) => {
  console.log("Dados recebidos:", req.body);  // Verifique se os dados estão chegando no servidor

  if (!req.body.id) {
    req.flash('error_msg', 'ID não foi enviado corretamente.');
    return res.redirect('/admin/inicio');
  }

  const usuarioAtualizado = {
    nome: req.body.nome,
    telefone: req.body.telefone,
    funcao: req.body.funcao,
    veiculo: req.body.veiculo
  };

  try {
    await Usuario.updateOne({ _id: req.body.id }, usuarioAtualizado);
    req.flash('success_msg', 'Dados editados com sucesso!');
    res.redirect('/admin/perfil');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Houve um erro interno ao salvar os dados!');
    res.redirect('/admin/inicio');
  }
});



//Rota para deletar usuarios / so administrador 
router.post('/dados/deletar', (req, res) => {
  console.log('User eAdmin:', req.user.eAdmin);
  Usuario.deleteOne({ _id: req.body.id }).lean().then(() => {
    req.flash('success_msg', 'Dados deletados com sucesso!');
    res.redirect('/admin/perfil');
  }).catch((error) => {
    req.flash('error_msg', 'Erro ao deletar os dados');
    res.redirect('/admin/perfil');
  });
});


router.get('/acesso', (req, res) => {
  res.render('admin/acesso', { messages: req.flash() }); // Passa as mensagens flash para a view
});



router.post('/acesso', async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ usuario: req.body.usuario });  // Substituir pelo campo desejado
    if (!usuario) {
      req.flash("error_msg", "Usuário não encontrado");
      return res.redirect("/admin/acesso");
    }

    // Aqui você já pode comparar a senha com a senha armazenada
    const senhaValida = await bcrypt.compare(req.body.senha, usuario.senha);
    console.log("Senha válida?", senhaValida); // Adicione um log aqui
    if (!senhaValida) {
      req.flash("error_msg", "Senha incorreta");
      return res.redirect("/admin/acesso");
    }

    // Senha válida, usuário autenticado
    req.flash("success_msg", "Login realizado com sucesso");
    req.login(usuario, (erro) => { // Adicionando a parte do login com Passport
      if (erro) {
        req.flash("error_msg", "Erro ao realizar login");
        return res.redirect("/admin/acesso");
      }
      res.redirect("/admin/perfil");  // Ou a página para a qual você deseja redirecionar após login
    });
  } catch (erro) {
    console.log(erro);
    req.flash("error_msg", "Houve um erro no processo de login");
    res.redirect("/admin/acesso");
  }
});



// Rota para exibir o perfil do usuário autenticado
router.get('/perfil', async (req, res) => {
  try {
    // Verifica se o usuário está autenticado
    if (!req.isAuthenticated()) {  // Melhor usar isAuthenticated() do Passport
      return res.redirect('/admin/acesso'); // Redireciona para a página de login se não estiver autenticado
    }

    // Se o usuário estiver autenticado, exibe os dados
    console.log('Usuário autenticado:', req.user); // Verifique se o usuário está autenticado

    // Obtém os dados do usuário do banco de dados usando o identificador do usuário autenticado
    const dados = await Usuario.findOne({ usuario: req.user.usuario }).exec();  // Usando async/await com exec()
    
    if (dados) {
      res.render('admin/perfil', { dados });
    } else {
      res.render('admin/perfil', { dados: [] }); // Caso não tenha dados
    }

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).send('Erro interno do servidor');
  }
});


// Rota GET para realizar logout do usuário
router.get('/logout', (req, res) => {
  req.logout((err) => {
      if (err) {
          return next(err); // Passa o erro para o próximo middleware
      }
      req.flash('success_msg', "Deslogado com sucesso");
      res.redirect('/admin'); // Redireciona para a página de administração após o logout
  });
});


//Rota para ver banco de horas e hora extra
router.get('/horas', eAdmin, (req, res) => {
  res.render('admin/horas')
})

//Rota post para salvar as horas 
router.post('/salvar-tempo', async (req, res) => {
  try {
    const { tipo } = req.body;
    const usuarioId = req.user ? req.user._id : null;

    console.log('Tipo recebido no backend:', tipo);

    if (!usuarioId) {
      return res.status(401).send('Erro: Usuário não autenticado!');
    }

    const agora = new Date();
    let registro = await Tempo.findOne({
      usuario: usuarioId,
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });

    if (!registro) {
      registro = new Tempo({ usuario: usuarioId });
    }

    switch (tipo) {
      case 'entrada':
        registro.horaEntrada = agora;
        break;
      case 'pausa':
        registro.horaPausa = agora;
        break;
      case 'retorno':
        registro.horaRetorno = agora;
        break;
      case 'saida':
        registro.horaSaida = agora;
        break;
      default:
        return res.status(400).send('Tipo inválido');
    }

    // Verifica se todas as horas foram preenchidas para calcular o total
    if (registro.horaEntrada && registro.horaPausa && registro.horaRetorno && registro.horaSaida) {
      const antesDaPausa = registro.horaPausa - registro.horaEntrada;
      const depoisDaPausa = registro.horaSaida - registro.horaRetorno;
      const totalTrabalhadoMs = antesDaPausa + depoisDaPausa;

      const totalHoras = totalTrabalhadoMs / (1000 * 60 * 60); // converte para horas
      registro.total = parseFloat(totalHoras.toFixed(2));

      if (totalHoras > 8) {
        registro.horaExtra = parseFloat((totalHoras - 8).toFixed(2));
        registro.horaFalta = 0;
      } else if (totalHoras < 8) {
        registro.horaFalta = parseFloat((8 - totalHoras).toFixed(2));
        registro.horaExtra = 0;
      } else {
        registro.horaExtra = 0;
        registro.horaFalta = 0;
      }
    }

    await registro.save();

    const horaFormatada = agora.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    res.json({
      [`hora${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Formatada`]: horaFormatada
    });

  } catch (err) {
    console.error('Erro ao salvar tempo:', err);
    res.status(500).send('Erro interno ao salvar o tempo');
  }
});

//Rota para receber as horas salvas via json
router.get('/carregar-tempos', async (req, res) => {
  try {
    const usuarioId = req.user ? req.user._id : null;
    if (!usuarioId) return res.status(401).json({ erro: 'Não autenticado' });

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Busca o registro do dia atual
    const registroHoje = await Tempo.findOne({
      usuario: usuarioId,
      createdAt: { $gte: hoje }
    });

    // Se tiver registro de hoje, usamos ele
    if (registroHoje) {
      return res.json({
        horaEntrada: registroHoje.horaEntrada,
        horaPausa: registroHoje.horaPausa,
        horaRetorno: registroHoje.horaRetorno,
        horaSaida: registroHoje.horaSaida,
        total: registroHoje.total,
        horaExtra: registroHoje.horaExtra,
        horaFalta: registroHoje.horaFalta
      });
    }

    // Caso contrário, buscamos o último registro para mostrar SOMENTE os totais
    const ultimoRegistro = await Tempo.findOne({
      usuario: usuarioId
    }).sort({ createdAt: -1 });

    res.json({
      total: ultimoRegistro?.total || 0,
      horaExtra: ultimoRegistro?.horaExtra || 0,
      horaFalta: ultimoRegistro?.horaFalta || 0
      // Não retorna horários (entrada, pausa...) pois não são do dia atual
    });

  } catch (error) {
    console.error('Erro ao carregar tempos:', error);
    res.status(500).json({ erro: 'Erro ao carregar tempos' });
  }
});



// Rota para limpar todos os registros de horas


//rota para limpar o banco 
router.delete("/zerarTudoHoras", async (req, res) => {
  try {
    await Tempo.deleteMany();  // remove todos os documentos da coleção Tempo
    res.json({ sucesso: true, mensagem: "Todos os dados da tabela de tempo foram zerados." });
  } catch (error) {
    console.error("Erro ao zerar a tabela tempo:", error);
    res.status(500).json({ sucesso: false, mensagem: "Erro ao zerar os dados." });
  }
});



module.exports = router;