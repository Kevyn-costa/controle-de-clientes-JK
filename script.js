document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("formCliente");
  const listaClientes = document.getElementById("listaClientes");
  const ativos = document.getElementById("ativos");
  const vencidos = document.getElementById("vencidos");
  const receita = document.getElementById("receita");
document.addEventListener("DOMContentLoaded", function () {
  const exportarBtn = document.createElement("button");
  exportarBtn.textContent = "Exportar Dados";
  exportarBtn.style = "position: fixed; bottom: 20px; right: 20px; z-index: 999;";
  document.body.appendChild(exportarBtn);

  exportarBtn.addEventListener("click", () => {
    const dados = localStorage.getItem("clientes");
    if (dados) {
      const blob = new Blob([dados], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "clientes.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      alert("Dados exportados com sucesso!");
    } else {
      alert("Nenhum dado encontrado no LocalStorage!");
    }
  });
});
  let clientes = JSON.parse(localStorage.getItem("clientes")) || [];

  atualizarTabela();
  atualizarResumo();

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const vencimento = document.getElementById("vencimento").value;
    const app = document.getElementById("app").value;
    const valor = parseFloat(document.getElementById("valor").value);

    const cliente = {
      nome,
      vencimento: formatarData(vencimento),
      app,
      valor,
      status: verificarStatus(vencimento),
      diasRestantes: calcularDiasRestantes(vencimento),
    };

    clientes.push(cliente);
    salvarLocalStorage();
    atualizarTabela();
    atualizarResumo();
    form.reset();
  });

  function verificarStatus(vencimento) {
    const hoje = new Date().toISOString().split("T")[0];
    return vencimento >= hoje ? "Ativo" : "Vencido";
  }

  function calcularDiasRestantes(dataVencimento) {
    const hoje = new Date();
    const [dia, mes, ano] = dataVencimento.split("/");
    const dataVencimentoFormatada = new Date(`${ano}-${mes}-${dia}`);
    const diffTime = dataVencimentoFormatada - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  function formatarData(data) {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function atualizarTabela() {
    listaClientes.innerHTML = "";
    clientes.sort((a, b) => new Date(a.vencimento.split("/").reverse().join("-")) - new Date(b.vencimento.split("/").reverse().join("-"))); // Ordena pela data de vencimento
    clientes.forEach((cliente, index) => {
      cliente.diasRestantes = calcularDiasRestantes(cliente.vencimento); // Atualiza os dias restantes
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${cliente.nome}</td>
        <td>${cliente.vencimento}</td>
        <td>${cliente.app}</td>
        <td>R$ ${cliente.valor.toFixed(2)}</td>
        <td class="${cliente.status === 'Ativo' ? 'text-success' : 'text-danger'}">${cliente.status}</td>
        <td>${cliente.diasRestantes}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="renovarCliente(${index})">Renovar</button>
          <button class="btn btn-danger btn-sm" onclick="removerCliente(${index})">Excluir</button>
        </td>
      `;
      listaClientes.appendChild(tr);
    });
  }

  function atualizarResumo() {
    const totalAtivos = clientes.filter((c) => c.status === "Ativo").length;
    const totalVencidos = clientes.filter((c) => c.status === "Vencido").length;
    const totalReceita = clientes.reduce((acc, c) => acc + c.valor, 0);

    ativos.textContent = totalAtivos;
    vencidos.textContent = totalVencidos;
    receita.textContent = `R$ ${totalReceita.toFixed(2)}`;
  }

  window.renovarCliente = function(index) {
    const novoVencimento = prompt("Digite a nova data de vencimento (DD/MM/YYYY):");
    if (novoVencimento) {
      const [dia, mes, ano] = novoVencimento.split("/");
      const formatado = `${ano}-${mes}-${dia}`; // Formato para verificação
      clientes[index].vencimento = novoVencimento;
      clientes[index].status = verificarStatus(formatado);
      clientes[index].diasRestantes = calcularDiasRestantes(novoVencimento);
      salvarLocalStorage();
      atualizarTabela();
      atualizarResumo();
    }
  }

  window.removerCliente = function(index) {
    clientes.splice(index, 1);
    salvarLocalStorage();
    atualizarTabela();
    atualizarResumo();
  }

  function salvarLocalStorage() {
    localStorage.setItem("clientes", JSON.stringify(clientes));
  }
});
