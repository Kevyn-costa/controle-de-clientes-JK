document.addEventListener("DOMContentLoaded", function () {
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
    clientes.forEach((cliente) => {
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
    Swal.fire("Sucesso!", "Cliente cadastrado com sucesso.", "success");
  });

  function verificarStatus(vencimento) {
    const hoje = moment().format("DD/MM/YYYY");
    return moment(vencimento, "DD/MM/YYYY").isSameOrAfter(hoje) ? "Ativo" : "Vencido";
  }

  function calcularDiasRestantes(vencimento) {
    const hoje = moment();
    const dataVencimento = moment(vencimento, "DD/MM/YYYY");
    return dataVencimento.diff(hoje, "days");
  }

  function formatarData(data) {
    return moment(data).format("DD/MM/YYYY");
  }

  function atualizarTabela() {
    listaClientes.innerHTML = "";
    clientes.sort((a, b) => moment(a.vencimento, "DD/MM/YYYY") - moment(b.vencimento, "DD/MM/YYYY"));
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

  window.renovarCliente = function (index) {
    const novoVencimento = prompt("Digite a nova data de vencimento (DD/MM/YYYY):");
    if (novoVencimento && moment(novoVencimento, "DD/MM/YYYY", true).isValid()) {
      clientes[index].vencimento = novoVencimento;
      clientes[index].status = verificarStatus(novoVencimento);
      clientes[index].diasRestantes = calcularDiasRestantes(novoVencimento);
      salvarLocalStorage();
      atualizarTabela();
      atualizarResumo();
      Swal.fire("Sucesso!", "Cliente renovado com sucesso.", "success");
    } else {
      Swal.fire("Erro!", "Data inválida! Use o formato DD/MM/YYYY.", "error");
    }
  };

  window.removerCliente = function (index) {
    Swal.fire({
      title: "Tem certeza?",
      text: "Você não poderá reverter isso!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, excluir!",
    }).then((result) => {
      if (result.isConfirmed) {
        clientes.splice(index, 1);
        salvarLocalStorage();
        atualizarTabela();
        atualizarResumo();
        Swal.fire("Excluído!", "O cliente foi removido.", "success");
      }
    });
  };

  function salvarLocalStorage() {
    localStorage.setItem("clientes", JSON.stringify(clientes));
  }

  function atualizarDataHora() {
    const elementoDataHora = document.getElementById("dataHora");
    const agora = new Date();
    const dataFormatada = agora.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const horaFormatada = agora.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    elementoDataHora.innerHTML = `${dataFormatada} - ${horaFormatada}`;
  }

  setInterval(atualizarDataHora, 1000);
  atualizarDataHora();
});

  function salvarLocalStorage() {
    localStorage.setItem("clientes", JSON.stringify(clientes));
  }
});
