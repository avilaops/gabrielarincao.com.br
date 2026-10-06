// Serviço de gestão de agendamentos
import { StorageService } from './storage.js';
import { ClienteService } from './clientes.js';

export class AgendaService {
    static STORAGE_KEY = StorageService.KEYS.AGENDAMENTOS;

    static getAll() {
        return StorageService.getAll(this.STORAGE_KEY)
            .map(agendamento => ({
                ...agendamento,
                cliente: ClienteService.getById(agendamento.clienteId)
            }))
            .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
    }

    static getById(id) {
        const agendamento = StorageService.find(this.STORAGE_KEY, a => a.id === id);
        if (agendamento) {
            agendamento.cliente = ClienteService.getById(agendamento.clienteId);
        }
        return agendamento;
    }

    static create(agendamentoData) {
        const agendamento = {
            clienteId: agendamentoData.clienteId,
            dataHora: agendamentoData.dataHora,
            servico: agendamentoData.servico,
            valor: agendamentoData.valor,
            status: agendamentoData.status || 'agendado',
            observacoes: agendamentoData.observacoes || ''
        };
        return StorageService.add(this.STORAGE_KEY, agendamento);
    }

    static update(id, agendamentoData) {
        return StorageService.update(this.STORAGE_KEY, id, agendamentoData);
    }

    static delete(id) {
        return StorageService.delete(this.STORAGE_KEY, id);
    }

    static confirmar(id) {
        return this.update(id, { status: 'confirmado' });
    }

    static concluir(id) {
        const agendamento = this.getById(id);
        if (agendamento) {
            // Adicionar ao histórico do cliente
            ClienteService.addHistorico(agendamento.clienteId, {
                data: agendamento.dataHora,
                servico: agendamento.servico,
                valor: agendamento.valor
            });
            return this.update(id, { status: 'concluido' });
        }
        return null;
    }

    static cancelar(id, motivo = '') {
        return this.update(id, { status: 'cancelado', motivoCancelamento: motivo });
    }

    static getPorData(data) {
        // Dia local: em UTC, um horário depois das 21h já cai no dia seguinte
        const dia = new Date(data);
        return this.getAll().filter(agendamento => {
            const agendData = new Date(agendamento.dataHora);
            return agendData.getFullYear() === dia.getFullYear()
                && agendData.getMonth() === dia.getMonth()
                && agendData.getDate() === dia.getDate();
        });
    }

    static getPorMes(ano, mes) {
        return this.getAll().filter(agendamento => {
            const data = new Date(agendamento.dataHora);
            return data.getFullYear() === ano && data.getMonth() === mes;
        });
    }

    static getProximos(limit = 5) {
        const agora = new Date();
        return this.getAll()
            .filter(a => new Date(a.dataHora) >= agora && a.status === 'agendado')
            .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))
            .slice(0, limit);
    }

    static getHoje() {
        const hoje = new Date();
        return this.getPorData(hoje);
    }
}
