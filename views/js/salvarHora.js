document.querySelectorAll('.btn-tempo').forEach(botao => {
    botao.addEventListener('click', async () => {
        const tipo = botao.getAttribute('data-tipo'); // pega o tipo (entrada, pausa, etc.)

        // Função para obter a hora atual formatada
        function obterHoraAtualFormatada() {
            const dataAtual = new Date();
            return dataAtual.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        const horaFormatada = obterHoraAtualFormatada();

        // Preencher o campo correspondente com base no tipo
        switch (tipo) {
            case 'entrada':
                document.getElementById('inputHoraEntrada').value = horaFormatada;
                break;
            case 'pausa':
                document.getElementById('inputPausa').value = horaFormatada;
                break;
            case 'retorno':
                document.getElementById('inputRetorno').value = horaFormatada;
                break;
            case 'saida':
                document.getElementById('inputHoraSaida').value = horaFormatada;
                break;
        }

        // Enviar para o backend
        try {
            const resposta = await fetch('/admin/salvar-tempo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tipo })
            });

            if (!resposta.ok) throw new Error('Erro ao salvar tempo');

            const dados = await resposta.json();
            console.log('Tempo salvo:', dados);

            // Atualizar os tempos exibidos na página após o envio
            window.location.reload();  // Atualiza os tempos na página

        } catch (error) {
            console.error('Erro ao salvar hora:', error);
        }
    });
});
