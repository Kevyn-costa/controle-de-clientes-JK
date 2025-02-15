document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("formCliente");
  const listaClientes = document.getElementById("listaClientes");
  const ativos = document.getElementById("ativos");
  const vencidos = document.getElementById("vencidos");
  const receita = document.getElementById("receita");

  let clientes = JSON.parse(localStorage.getItem("clientes")) || [];

  atualizarTabela();
  atualizarResumo();

  // Atualizar dias restantes e status diariamente
  setInterval(() => {
    clientes.forEach(cliente => {
      cliente.diasRestantes = calcularDiasRestantes(cliente.vencimento);
      cliente.status = verificarStatus(cliente.vencimento);
    });
    salvarLocalStorage();
    atualizarTabela();
    atualizarResumo();
  }, 86400000); // 24 horas

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
    alert("Cliente cadastrado com sucesso!");
  });

  function verificarStatus(vencimento) {
    const hoje = moment().format("YYYY-MM-DD");
    return moment(vencimento).isSameOrAfter(hoje) ? "Ativo" : "Vencido";
  }

  function calcularDiasRestantes(vencimento) {
    const hoje = moment();
    const dataVencimento = moment(vencimento, "DD/MM/YYYY");
    return dataVencimento.diff(hoje, "days");
  }
function atualizarDataHora() {
  const elementoDataHora = document.getElementById("dataHora");
  const agora = new Date();
  // Formatar a data e a hora
  const options = { 
    weekday: 'long', // Dia da semana (ex: "segunda-feira")
    year: 'numeric', // Ano (ex: "2023")
    month: 'long',   // Mês (ex: "outubro")
    day: 'numeric',  // Dia do mês (ex: "23")
    hour: '2-digit', // Hora (ex: "14")
    minute: '2-digit', // Minuto (ex: "05")
    second: '2-digit', // Segundo (ex: "09")
    hour12: false // Usar formato 24 horas
  };
  // Formatar a data e a hora no padrão brasileiro
  const dataHoraFormatada = agora.toLocaleDateString('pt-BR', options);
  // Atualizar o conteúdo do elemento
  elementoDataHora.textContent = dataHoraFormatada;
}
// Atualizar a cada segundo
setInterval(atualizarDataHora, 1000);
// Chamar a função uma vez para exibir imediatamente
atualizarDataHora();
  function formatarData(data) {
    return moment(data).format("DD/MM/YYYY");
  }

  function atualizarTabela() {
    listaClientes.innerHTML = "";
    clientes.sort((a, b) => moment(a.vencimento, "DD/MM/YYYY") - moment(b.vencimento, "DD/MM/YYYY")); // Ordena pela data de vencimento
    clientes.forEach((cliente, index) => {
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
    if (novoVencimento && moment(novoVencimento, "DD/MM/YYYY", true).isValid()) {
      clientes[index].vencimento = novoVencimento;
      clientes[index].status = verificarStatus(novoVencimento);
      clientes[index].diasRestantes = calcularDiasRestantes(novoVencimento);
      salvarLocalStorage();
      atualizarTabela();
      atualizarResumo();
      alert("Cliente renovado com sucesso!");
    } else {
      alert("Data inválida! Use o formato DD/MM/YYYY.");
    }
  }

  window.removerCliente = function(index) {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      clientes.splice(index, 1);
      salvarLocalStorage();
      atualizarTabela();
      atualizarResumo();
      alert("Cliente excluído com sucesso!");
    }
  }

  function salvarLocalStorage() {
    localStorage.setItem("clientes", JSON.stringify(clientes));
  }
});
  function salvarLocalStorage() {
    localStorage.setItem("clientes", JSON.stringify(clientes));
  }
});
