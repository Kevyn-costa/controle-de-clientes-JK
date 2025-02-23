document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("formCliente");
  const listaClientes = document.getElementById("listaClientes");
  const ativos = document.getElementById("ativos");
  const vencidos = document.getElementById("vencidos");
  const receita = document.getElementById("receita");

  let clientes = JSON.parse(localStorage.getItem("clientes")) || [];

  // Função para atualizar a tabela e o resumo ao carregar a página
  atualizarTabela();
  atualizarResumo();

  // Atualizar dias restantes e status a cada 1 hora
  setInterval(() => {
    clientes.forEach(cliente => {
      cliente.diasRestantes = calcularDiasRestantes(cliente.vencimento);
      cliente.status = verificarStatus(cliente.vencimento);
    });
    salvarLocalStorage();
    atualizarTabela();
    atualizarResumo();
  }, 3600000); // 1 hora

  // Adicionar evento de submit ao formulário
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const vencimento = document.getElementById("vencimento").value;
    const app = document.getElementById("app").value.trim();
    const valor = parseFloat(document.getElementById("valor").value);

    // Validação dos campos
    if (!nome || !vencimento || !app || isNaN(valor) || valor < 0) {
      Swal.fire("Erro", "Preencha todos os campos corretamente!", "error");
      return;
    }

    // Verificar se a data de vencimento é futura
    const hoje = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD
    if (new Date(vencimento) < new Date(hoje)) {
      Swal.fire("Erro", "A data de vencimento deve ser futura!", "error");
      return;
    }

    // Criar objeto do cliente
    const cliente = {
      nome,
      vencimento: formatarData(vencimento),
      app,
      valor,
      status: verificarStatus(vencimento),
      diasRestantes: calcularDiasRestantes(vencimento),
    };

    // Adicionar cliente à lista e salvar no localStorage
    clientes.push(cliente);
    salvarLocalStorage();
    atualizarTabela();
    atualizarResumo();
    form.reset();
    Swal.fire("Sucesso", "Cliente cadastrado com sucesso!", "success");
  });

  // Função para verificar o status do cliente (Ativo ou Vencido)
  function verificarStatus(vencimento) {
    const hoje = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD
    return new Date(vencimento) >= new Date(hoje) ? "Ativo" : "Vencido";
  }

  // Função para calcular os dias restantes até o vencimento
  function calcularDiasRestantes(vencimento) {
    const hoje = new Date();
    const dataVencimento = new Date(vencimento);
    const diffTime = dataVencimento - hoje;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Converter para dias
  }

  // Função para formatar a data no formato DD/MM/YYYY
  function formatarData(data) {
    const date = new Date(data);
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  // Função para atualizar a tabela de clientes
  function atualizarTabela() {
    listaClientes.innerHTML = ""; // Limpar a tabela antes de atualizar

    // Ordenar clientes por data de vencimento
    clientes.sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento));

    // Adicionar cada cliente à tabela
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

  // Função para atualizar o resumo (ativos, vencidos e receita)
  function atualizarResumo() {
    const totalAtivos = clientes.filter((c) => c.status === "Ativo").length;
    const totalVencidos = clientes.filter((c) => c.status === "Vencido").length;
    const totalReceita = clientes.reduce((acc, c) => acc + c.valor, 0);

    ativos.textContent = totalAtivos;
    vencidos.textContent = totalVencidos;
    receita.textContent = `R$ ${totalReceita.toFixed(2)}`;
  }

  // Função para renovar um cliente
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
        if (!value || !/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
          return "Digite uma data válida no formato DD/MM/YYYY!";
        }
        if (new Date(value.split('/').reverse().join('-')) < new Date()) {
          return "A data de vencimento deve ser futura!";
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const novaData = result.value;
        clientes[index].vencimento = novaData;
        clientes[index].diasRestantes = calcularDiasRestantes(novaData);
        clientes[index].status = verificarStatus(novaData);
        salvarLocalStorage();
        atualizarTabela();
        atualizarResumo();
        Swal.fire("Sucesso", "Cliente renovado com sucesso!", "success");
      }
    });
  }

  // Função para remover um cliente
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

  // Função para salvar os clientes no localStorage
  function salvarLocalStorage() {
    localStorage.setItem("clientes", JSON.stringify(clientes));
  }
});
