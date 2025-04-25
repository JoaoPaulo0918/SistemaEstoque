async function carregarTempos() {
    try {
      const res = await fetch('/admin/carregar-tempos?periodo=mes');
      const data = await res.json();
  
      console.log("Dados recebidos:", data); // depuração
  
      const horasExtras = parseFloat(data.horaExtra) || 0;
      horasExtrasGlobais = horasExtras;
  
      // Função para formatar decimal para HH:mm
      function formatarDecimalParaHorasMinutos(decimal) {
        const numero = parseFloat(decimal);
        if (isNaN(numero)) return '00:00';
  
        const horas = Math.floor(numero);
        const minutos = Math.round((numero - horas) * 60);
  
        return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
      }
  
      // Preenche os totais, extras e faltas
      if (data.total !== undefined) {
        const total = parseFloat(data.total) || 0;
        const extra = parseFloat(data.horaExtra) || 0;
        const falta = parseFloat(data.horaFalta) || 0;
  
        preencherBarraHorasExtras(extra);
  
        document.getElementById('totalHoarasTrabalhadas').textContent = formatarDecimalParaHorasMinutos(total);
        document.getElementById('totalTrabalhado').textContent = formatarDecimalParaHorasMinutos(total);
        document.getElementById('horaExtra').textContent = formatarDecimalParaHorasMinutos(extra);
        document.getElementById('horaFalta').textContent = formatarDecimalParaHorasMinutos(falta);
      }
  
    } catch (err) {
      console.error('Erro ao carregar horas:', err);
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    carregarTempos();
  });
  
  
  // Função para calcular hora extra      
  function somando(horasExtras) {
    console.log("Horas extras recebidas:", horasExtras);
    const valorSomado = document.getElementById('somaTotal');
    const input = parseFloat(document.getElementById('valorSalario').value);
  
    if (isNaN(horasExtras) || isNaN(input)) {
      alert("Valores inválidos. Verifique os dados inseridos.");
      return;
    }
  
    const valorHora = input / 220;
    const valorComExtras = valorHora + (valorHora * 1.5 * horasExtras);
  
    valorSomado.innerText = "Valor: " + valorComExtras.toFixed(2) + " R$";
    document.getElementById('valorSalario').value = "";
  }
  
  
  // Função para preencher barra total de horas
  function preencherBarraHorasExtras(horasExtras) {
    const valorNumerico = parseFloat(horasExtras) || 0;
    const maxHorasExtras = 12;
    const percentual = Math.min((valorNumerico / maxHorasExtras) * 100, 100);
  
    const barra = document.getElementById('divCarregamento');
    barra.style.width = `${percentual}%`;
    barra.textContent = `${valorNumerico.toFixed(2)}h`;
  }
  