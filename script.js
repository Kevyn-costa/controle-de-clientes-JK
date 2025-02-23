document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formCliente');
    const listaClientes = document.getElementById('listaClientes');
    const ativos = document.getElementById('ativos');
    const vencidos = document.getElementById('vencidos');
    const receita = document.getElementById('receita');
    const dataHora = document.getElementById('dataHora');
  
    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
  
    // Atualizar data e hora
    function atualizarDataHora() {
      const agora = new Date();
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      dataHora.textContent = agora.toLocaleDateString('pt-BR', options);
    }
  
    setInterval(atualizarDataHora, 1000);
    atualizarDataHora();
  
    // Função para formatar moeda
    function formatarMoeda(valor) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(valor);
    }
  
    // Função para formatar data
    function formatarData(data) {
      return new Date(data).toLocaleDateString('pt-BR');
    }
  
    // Função para calcular dias restantes
    function calcularDiasRestantes(vencimento) {
      const hoje = new Date();
      const dataVencimento = new Date(vencimento);
      const diffTime = dataVencimento - hoje;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  
    // Função para verificar status
    function verificarStatus(vencimento) {
      return calcularDiasRestantes(vencimento) > 0 ? 'Ativo' : 'Vencido';
    }
  
    // Função para ordenar clientes
    function ordenarClientes(a, b) {
      const statusA = verificarStatus(a.vencimento);
      const statusB = verificarStatus(b.vencimento);
      const diasA = calcularDiasRestantes(a.vencimento);
      const diasB = calcularDiasRestantes(b.vencimento);
  
      // Se ambos estão vencidos ou ambos ativos, ordenar por dias restantes
      if (statusA === statusB) {
        return diasA - diasB;
      }
      // Vencidos primeiro
      return statusA === 'Vencido' ? -1 : 1;
    }
  
    // Função para atualizar a tabela
    function atualizarTabela() {
      listaClientes.innerHTML = '';
      
      // Ordenar clientes: vencidos primeiro, depois por proximidade do vencimento
      clientes.sort(ordenarClientes);
  
      clientes.forEach((cliente, index) => {
        const diasRestantes = calcularDiasRestantes(cliente.vencimento);
        const status = verificarStatus(cliente.vencimento);
        
        const tr = document.createElement('tr');
        tr.className = status === 'Vencido' ? 'table-danger' : '';
        tr.innerHTML = `
          <td>${cliente.nome}</td>
          <td>${formatarData(cliente.vencimento)}</td>
          <td>${cliente.app}</td>
          <td>${formatarMoeda(cliente.valor)}</td>
          <td>
            <span class="badge ${status === 'Ativo' ? 'bg-success' : 'bg-danger'}">
              ${status}
            </span>
          </td>
          <td>
            <span class="d-flex align-items-center">
              <i class="fas fa-clock me-2"></i>
              ${diasRestantes} dias
            </span>
          </td>
          <td>
            <button class="btn btn-warning btn-sm me-2" onclick="renovarCliente(${index})">
              <i class="fas fa-sync-alt"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="removerCliente(${index})">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;
        listaClientes.appendChild(tr);
      });
    }
  
    // Função para atualizar o resumo
    function atualizarResumo() {
      const totalAtivos = clientes.filter(c => verificarStatus(c.vencimento) === 'Ativo').length;
      const totalVencidos = clientes.filter(c => verificarStatus(c.vencimento) === 'Vencido').length;
      const totalReceita = clientes.reduce((acc, c) => acc + c.valor, 0);
  
      ativos.textContent = totalAtivos;
      vencidos.textContent = totalVencidos;
      receita.textContent = formatarMoeda(totalReceita);
    }
  
    // Função para salvar no localStorage
    function salvarLocalStorage() {
      localStorage.setItem('clientes', JSON.stringify(clientes));
    }
  
    // Adicionar evento de submit ao formulário
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.classList.add('was-validated');
  
      if (!form.checkValidity()) {
        return;
      }
  
      const nome = document.getElementById('nome').value.trim();
      const vencimento = document.getElementById('vencimento').value;
      const app = document.getElementById('app').value.trim();
      const valor = parseFloat(document.getElementById('valor').value);
  
      if (!nome || !vencimento || !app || isNaN(valor) || valor <= 0) {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Por favor, preencha todos os campos corretamente!'
        });
        return;
      }
  
      const hoje = new Date().toISOString().split('T')[0];
      if (vencimento <= hoje) {
        Swal.fire({
          icon: 'error',
          title: 'Data Inválida',
          text: 'A data de vencimento deve ser futura!'
        });
        return;
      }
  
      const cliente = {
        nome,
        vencimento,
        app,
        valor,
        id: Date.now().toString()
      };
  
      clientes.push(cliente);
      salvarLocalStorage();
      atualizarTabela();
      atualizarResumo();
      
      form.reset();
      form.classList.remove('was-validated');
      
      Swal.fire({
        icon: 'success',
        title: 'Sucesso',
        text: 'Cliente cadastrado com sucesso!',
        timer: 1500,
        showConfirmButton: false
      });
    });
  
    // Função para renovar cliente
    window.renovarCliente = function(index) {
      Swal.fire({
        title: 'Renovar Cliente',
        html: `
          <input type="date" id="novaData" class="swal2-input" required>
        `,
        focusConfirm: false,
        preConfirm: () => {
          const novaData = document.getElementById('novaData').value;
          const hoje = new Date().toISOString().split('T')[0];
          
          if (!novaData || novaData <= hoje) {
            Swal.showValidationMessage('Selecione uma data futura válida!');
            return false;
          }
          return novaData;
        }
      }).then((result) => {
        if (result.isConfirmed) {
          clientes[index].vencimento = result.value;
          salvarLocalStorage();
          atualizarTabela(); // A tabela será reordenada automaticamente
          atualizarResumo();
          
          Swal.fire({
            icon: 'success',
            title: 'Cliente Renovado',
            text: 'A data de vencimento foi atualizada com sucesso!',
            timer: 1500,
            showConfirmButton: false
          });
        }
      });
    };
  
    // Função para remover cliente
    window.removerCliente = function(index) {
      Swal.fire({
        title: 'Tem certeza?',
        text: 'Esta ação não pode ser desfeita!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          clientes.splice(index, 1);
          salvarLocalStorage();
          atualizarTabela();
          atualizarResumo();
          
          Swal.fire({
            icon: 'success',
            title: 'Excluído!',
            text: 'O cliente foi removido com sucesso.',
            timer: 1500,
            showConfirmButton: false
          });
        }
      });
    };
  
    // Atualizar status e dias restantes periodicamente
    setInterval(() => {
      atualizarTabela();
      atualizarResumo();
    }, 3600000); // A cada hora
  
    // Inicializar a tabela e o resumo
    atualizarTabela();
    atualizarResumo();
  });
