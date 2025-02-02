document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("formServico");
    const listaServicos = document.getElementById("listaServicos");
    const concluidos = document.getElementById("concluidos");
    const pendentes = document.getElementById("pendentes");
    const receitaMesAtual = document.getElementById("receitaMesAtual");
    const nomeMesAtual = document.getElementById("nomeMesAtual");
    const faturamentoAnual = document.getElementById("faturamentoAnual");
    const listaMesesFechados = document.getElementById("listaMesesFechados");
  
    let servicos = JSON.parse(localStorage.getItem("meusServicos")) || [];
    let mesesFechados = JSON.parse(localStorage.getItem("mesesFechados")) || [];
  
    atualizarTabela();
    atualizarResumo();
    atualizarMesesFechados();
    atualizarFaturamentoAnual();
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const cliente = document.getElementById("cliente").value;
      const data = document.getElementById("data").value;
      const servico = document.getElementById("servico").value;
      const valor = parseFloat(document.getElementById("valor").value);
      const status = document.getElementById("status").value;
  
      const servicoObj = {
        cliente,
        data,
        servico,
        valor,
        status,
      };
  
      servicos.push(servicoObj);
      salvarLocalStorage();
      atualizarTabela();
      atualizarResumo();
      form.reset();
    });
  
    function atualizarTabela() {
      listaServicos.innerHTML = "";
      servicos.sort((a, b) => new Date(a.data) - new Date(b.data)); // Ordena pela data
      servicos.forEach((servico, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${servico.cliente}</td>
          <td>${servico.data.split("-").reverse().join("/")}</td>
          <td>${servico.servico}</td>
          <td>R$ ${servico.valor.toFixed(2)}</td>
          <td class="${servico.status === "Concluído" ? "text-success" : "text-danger"}">${servico.status}</td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="editarServico(${index})">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="removerServico(${index})">Excluir</button>
          </td>
        `;
        listaServicos.appendChild(tr);
      });
    }
  
    function atualizarResumo() {
      const totalConcluidos = servicos.filter((s) => s.status === "Concluído").length;
      const totalPendentes = servicos.filter((s) => s.status === "Pendente").length;
      const totalReceitaMesAtual = servicos.reduce((acc, s) => acc + s.valor, 0);
  
      concluidos.textContent = totalConcluidos;
      pendentes.textContent = totalPendentes;
      receitaMesAtual.textContent = `R$ ${totalReceitaMesAtual.toFixed(2)}`;
      nomeMesAtual.textContent = `Receita ${formatarMes(new Date().toISOString().slice(0, 7))}`;
    }
  
    window.editarServico = function (index) {
      const novoStatus = prompt("Digite o novo status (Concluído ou Pendente):");
      if (novoStatus && (novoStatus === "Concluído" || novoStatus === "Pendente")) {
        servicos[index].status = novoStatus;
        salvarLocalStorage();
        atualizarTabela();
        atualizarResumo();
      }
    };
  
    window.removerServico = function (index) {
      servicos.splice(index, 1);
      salvarLocalStorage();
      atualizarTabela();
      atualizarResumo();
    };
  
    function salvarLocalStorage() {
      localStorage.setItem("meusServicos", JSON.stringify(servicos));
      localStorage.setItem("mesesFechados", JSON.stringify(mesesFechados));
    }
  
    window.fecharMes = function () {
      const mesAtual = new Date().toISOString().slice(0, 7); // Formato YYYY-MM
      const servicosMes = servicos.filter((s) => s.data.startsWith(mesAtual));
  
      if (servicosMes.length === 0) {
        alert("Nenhum serviço encontrado para fechar o mês atual.");
        return;
      }
  
      const totalReceitaMes = servicosMes.reduce((acc, s) => acc + s.valor, 0);
      const servicosConcluidosMes = servicosMes.filter((s) => s.status === "Concluído").length;
  
      const mesFechado = {
        mes: mesAtual,
        servicos: servicosMes,
        totalReceita: totalReceitaMes,
        servicosConcluidos: servicosConcluidosMes,
      };
  
      mesesFechados.push(mesFechado);
      servicos = servicos.filter((s) => !s.data.startsWith(mesAtual)); // Remove serviços do mês atual
      salvarLocalStorage();
      atualizarTabela();
      atualizarResumo();
      atualizarMesesFechados();
      atualizarFaturamentoAnual();
  
      alert(
        `Mês de ${formatarMes(mesAtual)} fechado com sucesso!\nServiços Concluídos: ${servicosConcluidosMes}\nReceita Total: R$ ${totalReceitaMes.toFixed(2)}`
      );
    };
  
    function atualizarMesesFechados() {
      listaMesesFechados.innerHTML = "";
      mesesFechados.forEach((mesFechado, index) => {
        const accordionItem = document.createElement("div");
        accordionItem.className = "accordion-item";
        accordionItem.innerHTML = `
          <h2 class="accordion-header" id="heading${index}">
            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="true" aria-controls="collapse${index}">
              ${formatarMes(mesFechado.mes)} - ${mesFechado.servicos.length} serviços - Receita: R$ ${mesFechado.totalReceita.toFixed(2)}
            </button>
          </h2>
          <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#listaMesesFechados">
            <div class="accordion-body">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Serviço</th>
                    <th>Valor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${mesFechado.servicos
                    .map(
                      (servico) => `
                    <tr>
                      <td>${servico.cliente}</td>
                      <td>${servico.data.split("-").reverse().join("/")}</td>
                      <td>${servico.servico}</td>
                      <td>R$ ${servico.valor.toFixed(2)}</td>
                      <td class="${servico.status === "Concluído" ? "text-success" : "text-danger"}">${servico.status}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          </div>
        `;
        listaMesesFechados.appendChild(accordionItem);
      });
    }
  
    function atualizarFaturamentoAnual() {
      const totalFaturamentoAnual = mesesFechados.reduce((acc, mes) => acc + mes.totalReceita, 0);
      faturamentoAnual.textContent = `R$ ${totalFaturamentoAnual.toFixed(2)}`;
    }
  
    function formatarMes(mes) {
      const [ano, mesNumero] = mes.split("-");
      const meses = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ];
      return `${meses[parseInt(mesNumero) - 1]} de ${ano}`;
    }
  });
