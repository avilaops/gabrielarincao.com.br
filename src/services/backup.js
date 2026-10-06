// Serviço de backup e restauração dos dados do CRM
import { StorageService } from './storage.js';

const DIA_MS = 24 * 60 * 60 * 1000;
const LISTAS = ['CLIENTES', 'AGENDAMENTOS', 'PAGAMENTOS'];

export class BackupService {
    static APP = 'gabriela-crm';
    static VERSAO = 1;
    // Fora de StorageService.KEYS para não entrar no próprio backup
    static META_KEY = 'gabriela_backup_meta';
    static DIAS_LEMBRETE = 7;
    static TAMANHO_MAXIMO = 10 * 1024 * 1024;

    static gerar(agora = new Date()) {
        const exportado = StorageService.export();
        const dados = {};
        Object.keys(StorageService.KEYS).forEach(nome => {
            const valor = exportado[nome];
            dados[nome] = LISTAS.includes(nome) && !Array.isArray(valor) ? [] : valor;
        });

        return {
            app: this.APP,
            versao: this.VERSAO,
            geradoEm: agora.toISOString(),
            dados
        };
    }

    static validar(obj) {
        if (!this.ehObjeto(obj)) {
            return { ok: false, erro: 'O arquivo não é um backup válido.' };
        }
        if (obj.app !== this.APP) {
            return { ok: false, erro: 'O arquivo não é um backup deste sistema.' };
        }
        if (!Number.isInteger(obj.versao) || obj.versao < 1) {
            return { ok: false, erro: 'O backup não informa uma versão válida.' };
        }
        if (obj.versao > this.VERSAO) {
            return { ok: false, erro: 'O backup foi feito em uma versão mais nova do sistema.' };
        }
        if (!this.ehObjeto(obj.dados)) {
            return { ok: false, erro: 'O backup não contém dados.' };
        }

        for (const nome of LISTAS) {
            const lista = obj.dados[nome];
            if (!Array.isArray(lista)) {
                return { ok: false, erro: `O backup está incompleto (${nome.toLowerCase()}).` };
            }
            const itensValidos = lista.every(item => this.ehObjeto(item) && typeof item.id === 'string');
            if (!itensValidos) {
                return { ok: false, erro: `O backup tem registros inválidos (${nome.toLowerCase()}).` };
            }
            // Id repetido faria update/delete agir só no primeiro registro
            if (new Set(lista.map(item => item.id)).size !== lista.length) {
                return { ok: false, erro: `O backup tem registros repetidos (${nome.toLowerCase()}).` };
            }
        }

        const config = obj.dados.CONFIG;
        if (config !== undefined && config !== null && typeof config !== 'object') {
            return { ok: false, erro: 'O backup tem configurações inválidas.' };
        }

        return {
            ok: true,
            resumo: {
                clientes: obj.dados.CLIENTES.length,
                agendamentos: obj.dados.AGENDAMENTOS.length,
                pagamentos: obj.dados.PAGAMENTOS.length
            }
        };
    }

    // Lê o texto de um arquivo de backup e devolve o objeto já validado
    static interpretar(texto) {
        let obj;
        try {
            obj = JSON.parse(texto);
        } catch (error) {
            return { ok: false, erro: 'O arquivo não é um JSON válido.' };
        }

        const validacao = this.validar(obj);
        return validacao.ok ? { ...validacao, backup: obj } : validacao;
    }

    static tamanhoAceito(bytes) {
        return bytes <= this.TAMANHO_MAXIMO;
    }

    // Substitui os dados atuais pelos do backup: tudo ou nada
    static restaurar(obj) {
        const validacao = this.validar(obj);
        if (!validacao.ok) return validacao;

        // Só as chaves conhecidas; o resto de `dados` é ignorado
        const gravacoes = [];
        Object.entries(StorageService.KEYS).forEach(([nome, key]) => {
            const valor = obj.dados[nome];
            if (valor !== undefined && valor !== null) {
                gravacoes.push([key, valor]);
            }
        });

        const anterior = gravacoes.map(([key]) => [key, localStorage.getItem(key)]);
        const gravou = gravacoes.every(([key, valor]) => StorageService.set(key, valor));

        if (!gravou) {
            anterior.forEach(([key, bruto]) => {
                try {
                    if (bruto === null) {
                        localStorage.removeItem(key);
                    } else {
                        localStorage.setItem(key, bruto);
                    }
                } catch (error) {
                    console.error('Erro ao repor dados:', error);
                }
            });
            return { ok: false, erro: 'Não foi possível gravar o backup. Os dados atuais foram mantidos.' };
        }

        return validacao;
    }

    static nomeArquivo(data = new Date()) {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        return `backup-gabriela-${ano}-${mes}-${dia}.json`;
    }

    static ultimoBackup() {
        try {
            const meta = JSON.parse(localStorage.getItem(this.META_KEY));
            const data = new Date(meta?.ultimoBackup);
            return Number.isNaN(data.getTime()) ? null : data;
        } catch (error) {
            return null;
        }
    }

    // Dias inteiros desde o último backup; null se nunca foi feito
    static diasDesdeUltimo(agora = new Date()) {
        const ultimo = this.ultimoBackup();
        if (!ultimo) return null;
        return Math.max(0, Math.floor((agora.getTime() - ultimo.getTime()) / DIA_MS));
    }

    static temDados() {
        return LISTAS.some(nome => StorageService.getAll(StorageService.KEYS[nome]).length > 0);
    }

    static precisaLembrar(agora = new Date()) {
        if (!this.temDados()) return false;
        const dias = this.diasDesdeUltimo(agora);
        return dias === null || dias >= this.DIAS_LEMBRETE;
    }

    static registrarFeito(agora = new Date()) {
        try {
            localStorage.setItem(this.META_KEY, JSON.stringify({ ultimoBackup: agora.toISOString() }));
            return true;
        } catch (error) {
            console.error('Erro ao registrar backup:', error);
            return false;
        }
    }

    static ehObjeto(valor) {
        return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
    }
}
