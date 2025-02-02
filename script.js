document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("formCliente");
  const listaClientes = document.getElementById("listaClientes");
  const ativos = document.getElementById("ativos");
  const vencidos = document.getElementById("vencidos");
  const receita = document.getElementById("receita");

  let clientes = JSON.parse(localStorage.getItem("meusClientes")) || [];

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
      vencimento,
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

  function calcularDiasRestantes(vencimento) {
    const hoje = new Date().setHours(0, 0, 0, 0);
    const dataVencimento = new Date(vencimento).setHours(0, 0, 0, 0);
    const diffTime = dataVencimento - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  function atualizarTabela() {
    listaClientes.innerHTML = "";
    clientes.sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento)); // Ordena pela data de vencimento
    clientes.forEach((cliente, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${cliente.nome}</td>
        <td>${cliente.vencimento.split("-").reverse().join("/")}</td>
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
      clientes[index].vencimento = formatado;
      clientes[index].status = verificarStatus(formatado);
      clientes[index].diasRestantes = calcularDiasRestantes(formatado);
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
    localStorage.setItem("meusClientes", JSON.stringify(jclientes));
  }
});
