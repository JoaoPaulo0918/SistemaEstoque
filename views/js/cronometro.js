document.addEventListener("DOMContentLoaded", function () {
    const cronometroElemento = document.getElementById("cronometro");
    let tempoInicio = 0; // Hora de início do cronômetro
    let tempoPausado = 0; // Tempo acumulado durante a pausa
    let intervalo; // Para armazenar o intervalo do cronômetro
    let cronometroAtivo = false; // Flag para verificar se o cronômetro está ativo
    let tempoDecorrido = 0; // Tempo total decorrido (contagem real)

    // Função para formatar o tempo em HH:MM:SS
    function formatarTempo(ms) {
        const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
        const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
        const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    // Função para atualizar o cronômetro
    function atualizarCronometro() {
        const agora = new Date().getTime();
        const tempoTotal = agora - tempoInicio + tempoPausado;
        cronometroElemento.textContent = formatarTempo(tempoTotal);
        tempoDecorrido = tempoTotal; // Atualiza o tempo decorrido para a lógica de pausa e retorno
    }

    // Função para iniciar o cronômetro
    function iniciarCronometro() {
        tempoInicio = new Date().getTime(); // Marca o tempo de início
        intervalo = setInterval(atualizarCronometro, 1000); // Atualiza o cronômetro a cada segundo
        cronometroAtivo = true;
        localStorage.setItem("cronometroAtivo", "true");
        localStorage.setItem("tempoInicio", tempoInicio);
        localStorage.setItem("tempoPausado", tempoPausado);
        document.getElementById("btnEntrada").disabled = true; // Desativa o botão de iniciar enquanto ativo
    }

    // Função para pausar o cronômetro
    function pausarCronometro() {
        clearInterval(intervalo); // Para o cronômetro
        tempoPausado += new Date().getTime() - tempoInicio; // Acumula o tempo de pausa
        cronometroAtivo = false;
        localStorage.setItem("cronometroAtivo", "false");
        localStorage.setItem("tempoPausado", tempoPausado); // Armazena o tempo pausado
        document.getElementById("btnEntrada").disabled = false; // Reativa o botão de iniciar
    }

    // Função para continuar o cronômetro
    function continuarCronometro() {
        tempoInicio = new Date().getTime(); // Ajusta o tempo de início com a hora atual
        intervalo = setInterval(atualizarCronometro, 1000); // Continua o cronômetro
        cronometroAtivo = true;
        localStorage.setItem("cronometroAtivo", "true");
        localStorage.setItem("tempoInicio", tempoInicio);
        document.getElementById("btnEntrada").disabled = true; // Desativa o botão de iniciar enquanto ativo
    }

    // Função para parar o cronômetro (resetar)
    function pararCronometro() {
        clearInterval(intervalo); // Para o cronômetro
        cronometroAtivo = false;
        tempoPausado = 0; // Reseta o tempo pausado
        tempoInicio = 0; // Reseta o tempo de início
        cronometroElemento.textContent = "00:00:00"; // Reseta o cronômetro na tela
        localStorage.removeItem("cronometroAtivo");
        localStorage.removeItem("tempoInicio");
        localStorage.removeItem("tempoPausado");
        document.getElementById("btnEntrada").disabled = false; // Reativa o botão de iniciar
    }

    // Verifica se há um cronômetro ativo no localStorage
    const cronometroAtivoStorage = localStorage.getItem("cronometroAtivo");
    const tempoInicioStorage = localStorage.getItem("tempoInicio");
    const tempoPausadoStorage = localStorage.getItem("tempoPausado");

    if (cronometroAtivoStorage === "true") {
        tempoInicio = parseInt(tempoInicioStorage);
        tempoPausado = parseInt(tempoPausadoStorage) || 0; // Se não houver tempo de pausa armazenado, considera 0
        intervalo = setInterval(atualizarCronometro, 1000);
        document.getElementById("btnEntrada").disabled = true;
    } else if (cronometroAtivoStorage === "false" && tempoPausadoStorage) {
        // Se o cronômetro foi pausado, retome o tempo acumulado da pausa
        tempoPausado = parseInt(tempoPausadoStorage) || 0;
        cronometroElemento.textContent = formatarTempo(tempoPausado); // Exibe o tempo pausado
    }

    // Ação dos botões
    document.getElementById("btnEntrada").addEventListener("click", function () {
        if (!cronometroAtivo) {
            iniciarCronometro(); // Inicia o cronômetro se não estiver ativo
        }
    });

    document.getElementById("btnPausa").addEventListener("click", function () {
        if (cronometroAtivo) {
            pausarCronometro(); // Pausa o cronômetro se estiver ativo
        }
    });

    document.getElementById("btnVolta").addEventListener("click", function () {
        if (!cronometroAtivo) {
            continuarCronometro(); // Continua o cronômetro se estiver pausado
        }
    });

    document.getElementById("btnSaida").addEventListener("click", function () {
        pararCronometro(); // Para o cronômetro
    });
});
