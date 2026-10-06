// Página de gestão de clientes - CORRIGIDA
import { Header } from '../components/header.js';
import { Modal } from '../components/modal.js';
import { Toast } from '../components/toast.js';
import { ClienteService } from '../services/clientes.js';
import { BuscaService } from '../services/busca.js';
import { ImportacaoService } from '../services/importacao.js';
import { Utils } from '../utils/utils.js';

export class ClientesPage {
    constructor() {
        this.clientes = [];
        this.totalClientes = 0;
        this.filtros = ClientesPage.filtrosVazios();
        this.ordem = 'recentes';
    }

    static MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    static ORDENS = [
        ['recentes', 'Mais recentes'],
        ['nome-az', 'Nome (A–Z)'],
        ['nome-za', 'Nome (Z–A)'],
        ['ultimo-atendimento', 'Último atendimento'],
        ['mais-procedimentos', 'Mais procedimentos'],
        ['maior-valor', 'Maior valor gasto']
    ];

    static filtrosVazios() {
        return { texto: '', mesAniversario: '', atendimento: '', servico: '', periodoDe: '', periodoAte: '' };
    }

    async render() {
        return `
            ${Header.render()}
            <div class="container">
                <div class="flex flex-between mb-6" style="flex-wrap: wrap; gap: 16px;">
                    <h1>Gestão de Clientes</h1>
                    <div class="flex gap-sm" style="flex-wrap: wrap;">
                        <button class="btn btn-outline" id="btn-importar">
                            📥 Importar
                        </button>
                        <button class="btn btn-outline" id="btn-exportar">
                            📤 Exportar
                        </button>
                        <button class="btn btn-primary" id="btn-novo-cliente">
                            + Novo Cliente
                        </button>
                    </div>
                </div>

                <div class="card mb-6">
                    <input 
                        type="text" 
                        class="form-input" 
                        placeholder="Pesquisar por nome, telefone ou Instagram..."
                        id="search-input"
                    >
                    <div class="grid grid-4 filtros-clientes">
                        <div class="form-group">
                            <label class="form-label" for="filtro-aniversario">Aniversário</label>
                            <select class="form-select" id="filtro-aniversario">
                                <option value="">Qualquer mês</option>
                                ${ClientesPage.MESES.map((mes, i) => `<option value="${i + 1}">${mes}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="filtro-atendimento">Atendimento</label>
                            <select class="form-select" id="filtro-atendimento">
                                <option value="">Todos</option>
                                <option value="com">Com atendimento</option>
                                <option value="sem">Sem atendimento</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="filtro-servico">Serviço realizado</label>
                            <select class="form-select" id="filtro-servico">
                                <option value="">Qualquer serviço</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="filtro-periodo-de">Atendido de</label>
                            <input type="date" class="form-input" id="filtro-periodo-de">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="filtro-periodo-ate">até</label>
                            <input type="date" class="form-input" id="filtro-periodo-ate">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="filtro-ordem">Ordenar por</label>
                            <select class="form-select" id="filtro-ordem">
                                ${ClientesPage.ORDENS.map(([valor, rotulo]) => `<option value="${valor}">${rotulo}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <button type="button" class="btn btn-sm btn-outline" id="btn-limpar-filtros">
                                Limpar filtros
                            </button>
                        </div>
                    </div>
                </div>

                <div id="clientes-list"></div>
            </div>
        `;
    }

    init() {
        window.clientesPage = this;
        
        // Event listeners
        const btnNovo = document.getElementById('btn-novo-cliente');
        if (btnNovo) {
            btnNovo.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                Utils.log('Botão Novo Cliente clicado');
                this.showFormModal();
            });
        } else {
            Utils.log('ERRO: Botão Novo Cliente não encontrado');
        }
        
        const btnImportar = document.getElementById('btn-importar');
        if (btnImportar) {
            btnImportar.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showImportModal();
            });
        }
        
        const btnExportar = document.getElementById('btn-exportar');
        if (btnExportar) {
            btnExportar.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.exportarContatos();
            });
        }
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Filtros: cada controle grava no estado da página e refaz a lista
        const filtrosPorControle = {
            'filtro-aniversario': 'mesAniversario',
            'filtro-atendimento': 'atendimento',
            'filtro-servico': 'servico',
            'filtro-periodo-de': 'periodoDe',
            'filtro-periodo-ate': 'periodoAte'
        };
        Object.entries(filtrosPorControle).forEach(([id, filtro]) => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                this.filtros[filtro] = e.target.value;
                this.loadClientes();
            });
        });

        document.getElementById('filtro-ordem')?.addEventListener('change', (e) => {
            this.ordem = e.target.value;
            this.loadClientes();
        });

        document.getElementById('btn-limpar-filtros')?.addEventListener('click', () => this.limparFiltros());

        this.loadClientes();
    }

    loadClientes() {
        const todos = ClienteService.getAll();
        this.totalClientes = todos.length;
        this.renderServicos(todos);
        this.clientes = BuscaService.ordenarClientes(
            BuscaService.filtrarClientes(todos, this.filtros),
            this.ordem
        );
        this.renderClientes();
    }

    // Remonta o select de serviços (um atendimento concluído pode trazer serviço novo)
    // e mantém a opção escolhida enquanto ela existir
    renderServicos(todos) {
        const servicos = BuscaService.servicosDoHistorico(todos);
        const escolhido = BuscaService.normalizar(this.filtros.servico);
        this.filtros.servico = servicos.find(s => BuscaService.normalizar(s) === escolhido) || '';

        const select = document.getElementById('filtro-servico');
        if (!select) return;

        select.innerHTML = `
            <option value="">Qualquer serviço</option>
            ${servicos.map(s => `<option value="${Utils.sanitizeHTML(s)}">${Utils.sanitizeHTML(s)}</option>`).join('')}
        `;
        select.value = this.filtros.servico;
    }

    limparFiltros() {
        this.filtros = ClientesPage.filtrosVazios();
        this.ordem = 'recentes';

        ['search-input', 'filtro-aniversario', 'filtro-atendimento', 'filtro-servico',
            'filtro-periodo-de', 'filtro-periodo-ate'].forEach(id => {
            const controle = document.getElementById(id);
            if (controle) controle.value = '';
        });
        const ordem = document.getElementById('filtro-ordem');
        if (ordem) ordem.value = 'recentes';

        this.loadClientes();
    }

    renderClientes() {
        const container = document.getElementById('clientes-list');
        if (!container) return;

        const comFiltro = BuscaService.filtrosAtivos(this.filtros) > 0;

        if (this.clientes.length === 0 && comFiltro) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3>Nenhum cliente encontrado com esses filtros</h3>
                    <button type="button" class="btn btn-sm btn-outline" data-action="limpar-filtros">
                        Limpar filtros
                    </button>
                </div>
            `;
            container.querySelector('[data-action="limpar-filtros"]')
                .addEventListener('click', () => this.limparFiltros());
            return;
        }

        if (this.clientes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👤</div>
                    <h3>Nenhum cliente encontrado</h3>
                    <p>Comece adicionando seu primeiro cliente</p>
                </div>
            `;
            return;
        }

        const plural = (n) => `${n} ${n === 1 ? 'cliente' : 'clientes'}`;
        const contador = comFiltro
            ? `${this.clientes.length} de ${plural(this.totalClientes)}`
            : plural(this.clientes.length);

        container.innerHTML = `
            <p class="text-muted contador-clientes" id="clientes-contador">${contador}</p>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Telefone</th>
                            <th>Instagram</th>
                            <th>Aniversário</th>
                            <th>Procedimentos</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.clientes.map(cliente => this.renderClienteRow(cliente)).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // Adicionar event listeners aos botões da tabela
        this.attachTableListeners();
    }

    attachTableListeners() {
        // Botões "Ver Detalhes"
        document.querySelectorAll('[data-action="details"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const clienteId = btn.getAttribute('data-id');
                this.showDetailsModal(clienteId);
            });
        });
        
        // Botões "Editar"
        document.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const clienteId = btn.getAttribute('data-id');
                this.showFormModal(clienteId);
            });
        });
        
        // Botões "Excluir"
        document.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const clienteId = btn.getAttribute('data-id');
                this.deleteCliente(clienteId);
            });
        });
    }

    renderClienteRow(cliente) {
        const dataNasc = Utils.parseDataLocal(cliente.dataNascimento)?.toLocaleDateString('pt-BR') ?? '-';
        const totalProcedimentos = Array.isArray(cliente.historico) ? cliente.historico.length : 0;

        return `
            <tr>
                <td data-label="Nome"><strong>${Utils.sanitizeHTML(cliente.nome)}</strong></td>
                <td data-label="Telefone">${Utils.sanitizeHTML(Utils.formatPhone(cliente.telefone))}</td>
                <td data-label="Instagram">${Utils.sanitizeHTML(cliente.instagram || '-')}</td>
                <td data-label="Aniversário">${dataNasc}</td>
                <td data-label="Procedimentos">${totalProcedimentos}</td>
                <td data-label="Ações" style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="btn btn-sm btn-outline" data-action="details" data-id="${Utils.sanitizeHTML(cliente.id)}">
                        Ver Detalhes
                    </button>
                    <button class="btn btn-sm btn-secondary" data-action="edit" data-id="${Utils.sanitizeHTML(cliente.id)}">
                        Editar
                    </button>
                    <button class="btn btn-sm btn-outline" style="border-color: var(--danger); color: var(--danger);" data-action="delete" data-id="${Utils.sanitizeHTML(cliente.id)}">
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    }

    handleSearch(query) {
        this.filtros.texto = query;
        this.loadClientes();
    }

    showFormModal(clienteId = null) {
        Utils.log('Abrindo modal de cliente', { clienteId });

        const cliente = clienteId ? ClienteService.getById(clienteId) : null;
        const isEdit = Boolean(cliente);

        const timestamp = Date.now();
        const modalId = `modal-cliente-${timestamp}`;
        const formId = `cliente-form-${timestamp}`;

        const formDefaults = {
            nome: cliente?.nome || '',
            telefone: cliente?.telefone || '',
            instagram: cliente?.instagram || '',
            dataNascimento: cliente?.dataNascimento || '',
            observacoes: cliente?.observacoes || ''
        };

        if (formDefaults.dataNascimento) {
            const parsedDate = new Date(formDefaults.dataNascimento);
            if (!Number.isNaN(parsedDate.getTime())) {
                formDefaults.dataNascimento = parsedDate.toISOString().split('T')[0];
            }
        }

        const modal = new Modal({
            id: modalId,
            title: isEdit ? 'Editar Cliente' : 'Novo Cliente',
            content: `
                <form id="${formId}" novalidate>
                    <div class="form-group">
                        <label class="form-label">Nome *</label>
                        <input type="text" class="form-input" name="nome" value="${Utils.sanitizeHTML(formDefaults.nome)}" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Telefone *</label>
                        <input type="tel" class="form-input" name="telefone" value="${Utils.sanitizeHTML(formDefaults.telefone)}" placeholder="(11) 99999-9999" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Instagram</label>
                        <input type="text" class="form-input" name="instagram" value="${Utils.sanitizeHTML(formDefaults.instagram)}" placeholder="@usuario">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Data de Nascimento</label>
                        <input type="date" class="form-input" name="dataNascimento" value="${Utils.sanitizeHTML(formDefaults.dataNascimento)}">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Observações</label>
                        <textarea class="form-textarea" name="observacoes">${Utils.sanitizeHTML(formDefaults.observacoes)}</textarea>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-cancel>
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary">
                            ${isEdit ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                        </button>
                    </div>
                </form>
            `
        });

        modal.show();

        const initializeForm = () => {
            const form = document.getElementById(formId);

            if (!form) {
                Utils.log('Formulário de cliente não encontrado, nova tentativa...');
                requestAnimationFrame(initializeForm);
                return;
            }

            if (form.dataset.initialized === 'true') {
                return;
            }
            form.dataset.initialized = 'true';

            const cancelBtn = form.querySelector('[data-cancel]');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    modal.close();
                });
            }

            form.addEventListener('submit', (event) => {
                event.preventDefault();

                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());

                const payload = {
                    nome: data.nome?.trim() || '',
                    telefone: data.telefone?.trim() || '',
                    instagram: data.instagram?.trim() || '',
                    dataNascimento: data.dataNascimento || '',
                    observacoes: data.observacoes?.trim() || ''
                };

                if (!payload.nome) {
                    Modal.alert('Por favor, informe o nome do cliente.', 'Erro');
                    form.querySelector('[name="nome"]').focus();
                    return;
                }

                if (!payload.telefone) {
                    Modal.alert('Por favor, informe o telefone do cliente.', 'Erro');
                    form.querySelector('[name="telefone"]').focus();
                    return;
                }

                try {
                    if (isEdit) {
                        ClienteService.update(clienteId, payload);
                        Toast.success('Cliente atualizado com sucesso!');
                    } else {
                        const novoCliente = ClienteService.create(payload);
                        Utils.log('Cliente cadastrado com sucesso', novoCliente);
                        Toast.success('Cliente cadastrado com sucesso!');
                    }

                    modal.close();
                    this.loadClientes();
                } catch (error) {
                    Utils.log('Erro ao salvar cliente', error);
                    Modal.alert('Erro ao salvar cliente: ' + Utils.sanitizeHTML(error.message), 'Erro');
                }
            });
        };

        requestAnimationFrame(initializeForm);
    }

    showDetailsModal(clienteId) {
        const cliente = ClienteService.getById(clienteId);
        if (!cliente) {
            Modal.alert('Cliente não encontrado!', 'Erro');
            return;
        }

        const historico = cliente.historico || [];
        const valorTotal = historico.reduce((sum, h) => sum + (h.valor || 0), 0);

        const modalId = 'modal-details-' + Date.now();
        const modal = new Modal({
            id: modalId,
            title: Utils.sanitizeHTML(cliente.nome),
            content: `
                <div class="mb-6">
                    <p><strong>Telefone:</strong> ${Utils.sanitizeHTML(Utils.formatPhone(cliente.telefone))}</p>
                    <p><strong>Instagram:</strong> ${Utils.sanitizeHTML(cliente.instagram || '-')}</p>
                    <p><strong>Aniversário:</strong> ${Utils.parseDataLocal(cliente.dataNascimento)?.toLocaleDateString('pt-BR') ?? '-'}</p>
                    ${cliente.observacoes ? `<p><strong>Observações:</strong> ${Utils.sanitizeHTML(cliente.observacoes)}</p>` : ''}
                </div>

                <div class="card mb-6">
                    <h4>Estatísticas</h4>
                    <p><strong>Total de Procedimentos:</strong> ${historico.length}</p>
                    <p><strong>Valor Total Gasto:</strong> ${Utils.formatCurrency(valorTotal)}</p>
                </div>

                <h4 class="mb-4">Histórico de Procedimentos</h4>
                ${historico.length === 0 ? '<p class="text-muted">Nenhum procedimento realizado</p>' : `
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Serviço</th>
                                    <th>Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${historico.sort((a, b) => new Date(b.data) - new Date(a.data)).map(h => `
                                    <tr>
                                        <td data-label="Data">${new Date(h.data).toLocaleDateString('pt-BR')}</td>
                                        <td data-label="Serviço">${Utils.sanitizeHTML(h.servico)}</td>
                                        <td data-label="Valor">${Utils.formatCurrency(h.valor)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}

                <div class="modal-footer">
                    <button class="btn btn-primary" data-close-details>
                        Fechar
                    </button>
                </div>
            `
        });

        modal.show();

        setTimeout(() => {
            const closeBtn = document.querySelector('[data-close-details]');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => modal.close());
            }
        }, 100);
    }

    deleteCliente(clienteId) {
        const cliente = ClienteService.getById(clienteId);
        if (!cliente) return;

        Modal.confirm(`Tem certeza que deseja excluir o cliente "${Utils.sanitizeHTML(cliente.nome)}"?`, () => {
            try {
                ClienteService.delete(clienteId);
                Toast.success('Cliente excluído com sucesso!');
                this.loadClientes();
            } catch (error) {
                Modal.alert('Erro ao excluir cliente: ' + Utils.sanitizeHTML(error.message), 'Erro');
            }
        });
    }

    showImportModal() {
        const modalId = 'modal-importar-' + Date.now();
        const modal = new Modal({
            id: modalId,
            title: '📥 Importar Contatos',
            size: 'md',
            content: `
                <div style="margin-bottom: 24px;">
                    <label class="form-label">Selecione o arquivo de contatos</label>
                    <input type="file" id="file-import" class="form-input" accept=".vcf,.csv" />
                    <p style="margin-top: 8px; font-size: 0.85rem; color: var(--text-secondary);">
                        Formatos aceitos: VCF (vCard) ou CSV
                    </p>
                </div>
                <div id="import-result" style="display: none; margin-top: 16px; padding: 16px; border-radius: 8px;"></div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('${modalId}').remove()">
                        Cancelar
                    </button>
                    <button type="button" class="btn btn-primary" id="btn-confirmar-importar">
                        Importar
                    </button>
                </div>
            `
        });

        modal.show();

        const btnConfirmar = document.getElementById('btn-confirmar-importar');
        if (btnConfirmar) {
            btnConfirmar.addEventListener('click', async () => {
                const fileInput = document.getElementById('file-import');
                const file = fileInput?.files[0];
                
                if (!file) {
                    Modal.alert('Por favor, selecione um arquivo.');
                    return;
                }

                btnConfirmar.disabled = true;
                btnConfirmar.textContent = 'Importando...';

                try {
                    const resultado = await ImportacaoService.importarArquivo(file);
                    // O serviço devolve contagens; a lista de erros vem em detalhes
                    const erros = resultado.detalhes?.erros || [];
                    
                    const resultDiv = document.getElementById('import-result');
                    if (resultDiv) {
                        resultDiv.style.display = 'block';
                        resultDiv.style.backgroundColor = erros.length > 0 ? '#fff3cd' : '#d4edda';
                        resultDiv.style.color = erros.length > 0 ? '#856404' : '#155724';
                        resultDiv.innerHTML = `
                            <h4 style="margin: 0 0 8px 0;">Importação Concluída</h4>
                            <p style="margin: 4px 0;">✅ ${Utils.sanitizeHTML(resultado.importados)} contato(s) importado(s)</p>
                            ${erros.length > 0 ? `<p style="margin: 4px 0;">❌ ${erros.length} erro(s)</p>` : ''}
                            ${erros.length > 0 ? `
                                <details style="margin-top: 8px;">
                                    <summary style="cursor: pointer;">Ver erros</summary>
                                    <ul style="margin: 8px 0; padding-left: 20px;">
                                        ${erros.map(e => `<li>${Utils.sanitizeHTML(e?.erro ? `Linha ${e.linha}: ${e.erro}` : e)}</li>`).join('')}
                                    </ul>
                                </details>
                            ` : ''}
                        `;
                    }

                    if (resultado.importados > 0) {
                        this.loadClientes();
                    }

                    btnConfirmar.textContent = 'Concluído';
                    setTimeout(() => {
                        if (erros.length === 0) {
                            document.getElementById(modalId)?.remove();
                        }
                    }, 2000);
                } catch (error) {
                    Modal.alert('Erro ao importar arquivo: ' + Utils.sanitizeHTML(error.message));
                    btnConfirmar.disabled = false;
                    btnConfirmar.textContent = 'Importar';
                }
            });
        }
    }

    exportarContatos() {
        const clientes = ClienteService.getAll();
        
        if (clientes.length === 0) {
            Modal.alert('Não há contatos para exportar.');
            return;
        }

        // Modal para escolher formato
        const modalId = 'modal-exportar-' + Date.now();
        const modal = new Modal({
            id: modalId,
            title: '📤 Exportar Contatos',
            size: 'sm',
            content: `
                <div style="margin-bottom: 24px;">
                    <p style="margin-bottom: 16px;">Escolha o formato para exportar ${clientes.length} contato(s):</p>
                    <button class="btn btn-primary" style="width: 100%; margin-bottom: 8px;" id="btn-export-vcf">
                        📇 Exportar VCF (vCard)
                    </button>
                    <button class="btn btn-secondary" style="width: 100%;" id="btn-export-csv">
                        📊 Exportar CSV
                    </button>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('${modalId}').remove()">
                        Cancelar
                    </button>
                </div>
            `
        });

        modal.show();

        document.getElementById('btn-export-vcf')?.addEventListener('click', () => {
            ImportacaoService.exportarVCF(clientes);
            document.getElementById(modalId)?.remove();
            Toast.success('Arquivo VCF exportado com sucesso!');
        });

        document.getElementById('btn-export-csv')?.addEventListener('click', () => {
            ImportacaoService.exportarCSV(clientes);
            document.getElementById(modalId)?.remove();
            Toast.success('Arquivo CSV exportado com sucesso!');
        });
    }


    formatCurrency(value) {
        return Utils.formatCurrency(value);
    }

    destroy() {
        // Limpar referências globais
        if (window.clientesPage === this) {
            window.clientesPage = null;
        }

        // Remover event listeners (serão removidos quando o DOM for substituído)
        Utils.log('ClientesPage destroyed');
    }
}
