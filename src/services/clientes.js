// Serviço de gestão de clientes
import { StorageService } from './storage.js';
import { Utils } from '../utils/utils.js';

export class ClienteService {
    static STORAGE_KEY = StorageService.KEYS.CLIENTES;

    static getAll() {
        const result = StorageService.getAll(this.STORAGE_KEY)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        Utils.log('Clientes encontrados:', result.length);
        return result;
    }

    static getById(id) {
        return StorageService.find(this.STORAGE_KEY, cliente => cliente.id === id);
    }

    static create(clienteData) {
        const cliente = {
            nome: clienteData.nome,
            telefone: clienteData.telefone,
            instagram: clienteData.instagram || '',
            dataNascimento: clienteData.dataNascimento || '',
            observacoes: clienteData.observacoes || '',
            historico: []
        };
        const result = StorageService.add(this.STORAGE_KEY, cliente);
        Utils.log('Cliente criado:', result);
        return result;
    }

    static update(id, clienteData) {
        return StorageService.update(this.STORAGE_KEY, id, clienteData);
    }

    static delete(id) {
        return StorageService.delete(this.STORAGE_KEY, id);
    }

    static addHistorico(clienteId, procedimento) {
        const cliente = this.getById(clienteId);
        if (cliente) {
            if (!cliente.historico) {
                cliente.historico = [];
            }
            cliente.historico.push({
                id: StorageService.generateId(),
                data: procedimento.data || new Date().toISOString(),
                servico: procedimento.servico,
                valor: procedimento.valor,
                observacoes: procedimento.observacoes || ''
            });
            return this.update(clienteId, cliente);
        }
        return null;
    }

    static search(query) {
        const lowerQuery = query.toLowerCase();
        return this.getAll().filter(cliente => 
            cliente.nome.toLowerCase().includes(lowerQuery) ||
            (cliente.telefone && cliente.telefone.includes(query)) ||
            (cliente.instagram && cliente.instagram.toLowerCase().includes(lowerQuery))
        );
    }

    static getAniversariantes() {
        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        
        return this.getAll().filter(cliente => {
            const dataNasc = Utils.parseDataLocal(cliente.dataNascimento);
            return dataNasc !== null && dataNasc.getMonth() === mesAtual;
        });
    }

    static getTotalClientes() {
        return this.getAll().length;
    }

    static getClientesRecentes(limit = 5) {
        return this.getAll().slice(0, limit);
    }
}
