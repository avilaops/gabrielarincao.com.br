// Busca avançada de clientes: filtros combinados e ordenação.
// Funções puras: recebem a lista por parâmetro e devolvem um array novo,
// sem DOM e sem armazenamento do navegador, para rodarem direto nos testes do Node.

const DATA_DIA = /^\d{4}-\d{2}-\d{2}$/;

export class BuscaService {
    static ORDENS = ['recentes', 'nome-az', 'nome-za', 'ultimo-atendimento', 'mais-procedimentos', 'maior-valor'];

    static normalizar(texto) {
        if (texto === null || texto === undefined) return '';
        return String(texto)
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .toLowerCase()
            .trim();
    }

    // Lê os filtros crus da tela e devolve só os válidos; o resto vira vazio
    static interpretarFiltros(filtros = {}) {
        const f = filtros || {};

        const mes = Number(f.mesAniversario);
        const mesValido = f.mesAniversario !== '' && f.mesAniversario !== null &&
            Number.isInteger(mes) && mes >= 1 && mes <= 12;

        let periodoDe = DATA_DIA.test(f.periodoDe) ? f.periodoDe : '';
        let periodoAte = DATA_DIA.test(f.periodoAte) ? f.periodoAte : '';
        if (periodoDe && periodoAte && periodoDe > periodoAte) {
            [periodoDe, periodoAte] = [periodoAte, periodoDe];
        }

        return {
            texto: this.normalizar(f.texto),
            mesAniversario: mesValido ? mes : null,
            atendimento: f.atendimento === 'com' || f.atendimento === 'sem' ? f.atendimento : '',
            servico: this.normalizar(f.servico),
            periodoDe,
            periodoAte
        };
    }

    // Dia local (AAAA-MM-DD) de um item do histórico; null se a data não servir.
    // toISOString() daria o dia em UTC e jogaria 23h30 para o dia seguinte.
    static diaLocal(data) {
        if (typeof data === 'string' && DATA_DIA.test(data)) return data;
        if (data === null || data === undefined || data === '') return null;

        const d = new Date(data);
        if (Number.isNaN(d.getTime())) return null;

        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const dia = String(d.getDate()).padStart(2, '0');
        return `${d.getFullYear()}-${mes}-${dia}`;
    }

    static historicoDe(cliente) {
        return Array.isArray(cliente?.historico) ? cliente.historico : [];
    }

    static filtrarClientes(clientes, filtros = {}) {
        const lista = Array.isArray(clientes) ? clientes : [];
        const f = this.interpretarFiltros(filtros);
        const digitosTexto = f.texto.replace(/\D/g, '');
        const filtraHistorico = Boolean(f.servico || f.periodoDe || f.periodoAte);

        return lista.filter(cliente => {
            if (!cliente) return false;

            if (f.texto) {
                const casaTexto = [cliente.nome, cliente.instagram, cliente.observacoes]
                    .some(campo => this.normalizar(campo).includes(f.texto));
                // Telefone pode vir como número em backup editado à mão
                const casaTelefone = digitosTexto !== '' &&
                    String(cliente.telefone ?? '').replace(/\D/g, '').includes(digitosTexto);
                if (!casaTexto && !casaTelefone) return false;
            }

            if (f.mesAniversario !== null) {
                // Sem new Date: 'AAAA-MM-DD' é lido em UTC e o dia 1º cairia no mês anterior
                const nascimento = cliente.dataNascimento;
                if (typeof nascimento !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(nascimento)) return false;
                if (Number(nascimento.slice(5, 7)) !== f.mesAniversario) return false;
            }

            const historico = this.historicoDe(cliente);

            if (f.atendimento === 'com' && historico.length === 0) return false;
            if (f.atendimento === 'sem' && historico.length > 0) return false;

            if (filtraHistorico) {
                // Serviço e período valem sobre o mesmo atendimento
                const casaItem = historico.some(item => {
                    if (!item) return false;
                    if (f.servico && this.normalizar(item.servico) !== f.servico) return false;
                    if (f.periodoDe || f.periodoAte) {
                        const dia = this.diaLocal(item.data);
                        if (dia === null) return false;
                        if (f.periodoDe && dia < f.periodoDe) return false;
                        if (f.periodoAte && dia > f.periodoAte) return false;
                    }
                    return true;
                });
                if (!casaItem) return false;
            }

            return true;
        });
    }

    static ordenarClientes(clientes, ordem = 'recentes') {
        const lista = Array.isArray(clientes) ? [...clientes] : [];

        const instante = (data) => {
            const t = new Date(data).getTime();
            return Number.isNaN(t) ? -Infinity : t;
        };
        // Decrescente, sem subtrair: -Infinity - -Infinity daria NaN
        const decrescente = (a, b) => (a === b ? 0 : (a > b ? -1 : 1));
        const recentes = (a, b) => decrescente(instante(a?.createdAt), instante(b?.createdAt));
        const nome = (a, b) => String(a?.nome ?? '').localeCompare(String(b?.nome ?? ''), 'pt-BR', { sensitivity: 'base' });
        const ultimoAtendimento = (cliente) =>
            this.historicoDe(cliente).reduce((maior, item) => Math.max(maior, instante(item?.data)), -Infinity);
        const valorTotal = (cliente) =>
            this.historicoDe(cliente).reduce((soma, item) => soma + (Number(item?.valor) || 0), 0);

        const criterios = {
            'nome-az': (a, b) => nome(a, b),
            'nome-za': (a, b) => nome(b, a),
            'ultimo-atendimento': (a, b) => decrescente(ultimoAtendimento(a), ultimoAtendimento(b)),
            'mais-procedimentos': (a, b) => decrescente(this.historicoDe(a).length, this.historicoDe(b).length),
            'maior-valor': (a, b) => decrescente(valorTotal(a), valorTotal(b))
        };

        const criterio = Object.hasOwn(criterios, ordem) ? criterios[ordem] : null;
        return lista.sort((a, b) => (criterio ? criterio(a, b) : 0) || recentes(a, b));
    }

    static servicosDoHistorico(clientes) {
        const lista = Array.isArray(clientes) ? clientes : [];
        const vistos = new Map();

        lista.forEach(cliente => {
            this.historicoDe(cliente).forEach(item => {
                const chave = this.normalizar(item?.servico);
                if (chave && !vistos.has(chave)) {
                    vistos.set(chave, String(item.servico).trim());
                }
            });
        });

        return [...vistos.values()].sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
    }

    // Quantos filtros estão preenchidos; o período (de/até) conta como um só
    static filtrosAtivos(filtros = {}) {
        const f = this.interpretarFiltros(filtros);
        return [
            f.texto !== '',
            f.mesAniversario !== null,
            f.atendimento !== '',
            f.servico !== '',
            f.periodoDe !== '' || f.periodoAte !== ''
        ].filter(Boolean).length;
    }
}
