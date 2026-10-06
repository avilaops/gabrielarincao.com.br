// Serviço de Importação de Contatos
import { ClienteService } from './clientes.js';

export class ImportacaoService {
    // Escolhe o importador pela extensão do nome do arquivo
    static importarArquivo(file) {
        const nome = String(file?.name || '').toLowerCase();

        if (nome.endsWith('.vcf')) return this.importarVCF(file);
        if (nome.endsWith('.csv')) return this.importarCSV(file);

        return Promise.reject(new Error('Formato não suportado. Use VCF ou CSV.'));
    }

    // Importar arquivo VCF (vCard)
    static async importarVCF(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const conteudo = e.target.result;
                    const contatos = this.parseVCF(conteudo);
                    
                    const importados = [];
                    const erros = [];
                    
                    contatos.forEach((contato, index) => {
                        try {
                            // Validar dados mínimos
                            if (!contato.nome || !contato.telefone) {
                                erros.push({
                                    linha: index + 1,
                                    erro: 'Nome ou telefone não encontrado',
                                    contato
                                });
                                return;
                            }
                            
                            // Criar cliente
                            const clienteId = ClienteService.create({
                                nome: contato.nome,
                                telefone: contato.telefone,
                                email: contato.email || '',
                                instagram: '',
                                observacoes: 'Importado de VCF'
                            });
                            
                            importados.push({
                                id: clienteId,
                                nome: contato.nome
                            });
                        } catch (error) {
                            erros.push({
                                linha: index + 1,
                                erro: error.message,
                                contato
                            });
                        }
                    });
                    
                    resolve({
                        total: contatos.length,
                        importados: importados.length,
                        erros: erros.length,
                        detalhes: { importados, erros }
                    });
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
            reader.readAsText(file);
        });
    }

    // Parse VCF content
    static parseVCF(conteudo) {
        const contatos = [];
        const vcards = conteudo.split('BEGIN:VCARD');
        
        vcards.forEach(vcard => {
            if (!vcard.trim()) return;
            
            const contato = {
                nome: '',
                telefone: '',
                email: ''
            };
            
            const linhas = vcard.split('\n');
            
            linhas.forEach(linha => {
                linha = linha.trim();
                
                // Nome
                if (linha.startsWith('FN:')) {
                    contato.nome = linha.replace('FN:', '');
                } else if (linha.startsWith('N:') && !contato.nome) {
                    const partes = linha.replace('N:', '').split(';');
                    contato.nome = `${partes[1] || ''} ${partes[0] || ''}`.trim();
                }
                
                // Telefone
                else if (linha.includes('TEL')) {
                    const tel = linha.split(':')[1];
                    if (tel && !contato.telefone) {
                        contato.telefone = tel.replace(/\D/g, '');
                    }
                }
                
                // Email
                else if (linha.includes('EMAIL')) {
                    const email = linha.split(':')[1];
                    if (email && !contato.email) {
                        contato.email = email;
                    }
                }
            });
            
            if (contato.nome || contato.telefone) {
                contatos.push(contato);
            }
        });
        
        return contatos;
    }

    // Importar de CSV (formato: nome,telefone,email)
    static async importarCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const conteudo = e.target.result;
                    const linhas = conteudo.split('\n');
                    
                    const importados = [];
                    const erros = [];
                    
                    // Pular cabeçalho se existir
                    const startIndex = linhas[0].toLowerCase().includes('nome') ? 1 : 0;
                    
                    for (let i = startIndex; i < linhas.length; i++) {
                        const linha = linhas[i].trim();
                        if (!linha) continue;
                        
                        try {
                            const [nome, telefone, email] = linha.split(',').map(s => s.trim());
                            
                            if (!nome || !telefone) {
                                erros.push({
                                    linha: i + 1,
                                    erro: 'Nome ou telefone não encontrado',
                                    dados: linha
                                });
                                continue;
                            }
                            
                            const clienteId = ClienteService.create({
                                nome,
                                telefone: telefone.replace(/\D/g, ''),
                                email: email || '',
                                instagram: '',
                                observacoes: 'Importado de CSV'
                            });
                            
                            importados.push({ id: clienteId, nome });
                        } catch (error) {
                            erros.push({
                                linha: i + 1,
                                erro: error.message,
                                dados: linha
                            });
                        }
                    }
                    
                    resolve({
                        total: linhas.length - startIndex,
                        importados: importados.length,
                        erros: erros.length,
                        detalhes: { importados, erros }
                    });
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
            reader.readAsText(file);
        });
    }

    // Exportar contatos para VCF
    static exportarVCF() {
        const clientes = ClienteService.getAll();
        
        let vcfContent = '';
        
        clientes.forEach(cliente => {
            vcfContent += 'BEGIN:VCARD\n';
            vcfContent += 'VERSION:3.0\n';
            vcfContent += `FN:${cliente.nome}\n`;
            vcfContent += `TEL;TYPE=CELL:${cliente.telefone}\n`;
            if (cliente.email) {
                vcfContent += `EMAIL:${cliente.email}\n`;
            }
            if (cliente.instagram) {
                vcfContent += `URL:https://instagram.com/${cliente.instagram.replace('@', '')}\n`;
            }
            if (cliente.observacoes) {
                vcfContent += `NOTE:${cliente.observacoes}\n`;
            }
            vcfContent += 'END:VCARD\n\n';
        });
        
        // Criar blob e fazer download
        const blob = new Blob([vcfContent], { type: 'text/vcard' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contatos-gabriela-${new Date().toISOString().split('T')[0]}.vcf`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        return clientes.length;
    }

    // Exportar para CSV
    static exportarCSV() {
        const clientes = ClienteService.getAll();
        
        let csvContent = 'Nome,Telefone,Email,Instagram,Data Cadastro\n';
        
        clientes.forEach(cliente => {
            const linha = [
                cliente.nome,
                cliente.telefone,
                cliente.email || '',
                cliente.instagram || '',
                new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')
            ].map(campo => `"${campo}"`).join(',');
            
            csvContent += linha + '\n';
        });
        
        // Criar blob e fazer download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clientes-gabriela-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        return clientes.length;
    }
}
