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

    const nome = document.getElementById("nome").value.trim();
    const vencimento = document.getElementById("vencimento").value;
    const app = document.getElementById("app").value.trim();
    const valor = parseFloat(document.getElementById("valor").value);

    if (!nome || !vencimento || !app || isNaN(valor)) {
      Swal.fire("Erro", "Preencha todos os campos corretamente!", "error");
      return;
    }

    const hoje = moment().format("YYYY-MM-DD");
    if (moment(vencimento).isBefore(hoje)) {
      Swal.fire("Erro", "A data de vencimento deve ser futura!", "error");
      return;
    }

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
    Swal.fire("Sucesso", "Cliente cadastrado com sucesso!", "success");
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
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    const dataHoraFormatada = agora.toLocaleDateString('pt-BR', options);
    elementoDataHora.textContent = dataHoraFormatada;
  }

  setInterval(atualizarDataHora, 1000);
  atualizarDataHora();

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
          <button class="btn btn-warning btn-sm" onclick="renovarCliente(${index})"><i class="fas fa-sync-alt"></i></button>
          <button class="btn btn-danger btn-sm" onclick="removerCliente(${index})"><i class="fas fa-trash"></i></button>
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
  Swal.fire({
    title: "Renovar Cliente",
    input: "text",
    inputLabel: "Nova data de vencimento (DD/MM/YYYY)",
    inputPlaceholder: "Ex: 31/12/2023",
    showCancelButton: true,
    confirmButtonText: "Renovar",
    cancelButtonText: "Cancelar",
    inputValidator: (value) => {
      if (!value || !moment(value, "DD/MM/YYYY", true).isValid()) {
        return "Digite uma data válida no formato DD/MM/YYYY!";
      }
      if (moment(value, "DD/MM/YYYY").isBefore(moment(), "day")) {
        return "A data de vencimento deve ser futura!";
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const novaData = result.value;
      clientes[index].vencimento = novaData;
      clientes[index].diasRestantes = calcularDiasRestantes(novaData);
      clientes[index].status = verificarStatus(novaData); // Atualiza o status
      salvarLocalStorage();
      atualizarTabela();
      atualizarResumo();
      Swal.fire("Sucesso", "Cliente renovado com sucesso!", "success");
    }
  });
};

  window.removerCliente = function (index) {
    Swal.fire({
      title: "Tem certeza?",
      text: "Essa ação não pode ser desfeita!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Excluir",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        clientes.splice(index, 1);
        salvarLocalStorage();
        atualizarTabela();
        atualizarResumo();
        Swal.fire("Sucesso", "Cliente excluído com sucesso!", "success");
      }
    });
  }

  function salvarLocalStorage() {
    localStorage.setItem("clientes", JSON.stringify(clientes));
  }
});
