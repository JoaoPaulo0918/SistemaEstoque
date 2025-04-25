async function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Busca os dados da API
    const res = await fetch('/admin/horas-pdf');
    const { registros, totais } = await res.json();

    const formatarHora = data => data ? new Date(data).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }) : "-";
    const formatarData = data => data ? new Date(data).toLocaleDateString("pt-BR") : "-";

    const colunas = [
      "Dia",
      "Entrada",
      "Pausa",
      "Retorno",
      "Saída",
      "Total (h)",
      "Hora Extra",
      "Hora Falta"
    ];

    const linhas = registros.map(r => [
      formatarData(r.dataCriacao),
      formatarHora(r.horaEntrada),
      formatarHora(r.horaPausa),
      formatarHora(r.horaRetorno),
      formatarHora(r.horaSaida),
      r.total ?? "-",
      r.horaExtra ?? "-",
      r.horaFalta ?? "-"
    ]);

    doc.text("Relatório de Horas - Mês Atual", 14, 15);
    doc.autoTable({
      head: [colunas],
      body: linhas,
      startY: 20,
      styles: { fontSize: 9 }
    });

    // Totais no final
    const posY = doc.lastAutoTable.finalY + 10;
    doc.text(`Total de Horas: ${totais.total}`, 14, posY);
    doc.text(`Hora Extra: ${totais.horaExtra}`, 14, posY + 6);
    doc.text(`Hora Falta: ${totais.horaFalta}`, 14, posY + 12);

    doc.save("relatorio-tempos.pdf");
  }
   