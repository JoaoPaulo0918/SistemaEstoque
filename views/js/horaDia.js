async function carregarTempos() {
    try {
      const res = await fetch('/admin/carregar-tempos?periodo=dia'); // Mudou de 'mes' para 'dia'
      const data = await res.json();
  
      console.log("Dados recebidos:", data);
  
      // Se não houver nenhum registro no dia
      if (!data.registros || data.registros.length === 0) {
        console.log("Nenhum registro encontrado para hoje.");
        return;
      }
  
      // Pega o primeiro (e único) registro do dia
      const ultimoRegistro = data.registros[0];  // Apenas o primeiro registro, conforme seu caso
  
      // Formatação da hora de entrada
      if (ultimoRegistro.horaEntrada) {
        const entradaFormatada = new Date(ultimoRegistro.horaEntrada).toLocaleTimeString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('entradaP').textContent = entradaFormatada;
      }

      // Formatação da hora do intervalo
      if (ultimoRegistro.horaPausa) {
        const intervaloFormatado = new Date(ultimoRegistro.horaPausa).toLocaleTimeString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('intervaloP').textContent = intervaloFormatado;
      }

      if (ultimoRegistro.horaRetorno) {
        const retornoFormatado = new Date(ultimoRegistro.horaRetorno).toLocaleTimeString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('retornoP').textContent = retornoFormatado;
      }
      
      // Formatação da hora de saída
      if (ultimoRegistro.horaSaida) {
        const saidaFormatada = new Date(ultimoRegistro.horaSaida).toLocaleTimeString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('saidaP').textContent = saidaFormatada;  // Alterei de `value` para `textContent`
      }
      
    } catch (error) {
      console.error('Erro ao carregar os tempos:', error);
    }
}

// Chama a função ao carregar a página
window.onload = carregarTempos;
