// Página de gestão financeira
import { Header } from '../components/header.js';
import { Chart } from '../components/chart.js';
import { FinanceiroService } from '../services/financeiro.js';
import { Utils } from '../utils/utils.js';

export class FinanceiroPage {
    constructor() {
        this.currentDate = new Date();
        this.year = this.currentDate.getFullYear();
        this.month = this.currentDate.getMonth();
    }

    async render() {
        return `
            ${Header.render()}
            <div class="container">
                <div class="flex flex-between mb-md">
                    <h1>Financeiro</h1>
                    <div class="flex gap-sm">
                        <button class="btn btn-sm btn-outline" onclick="window.financeiroPage.previousMonth()">
                            ← Anterior
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="window.financeiroPage.currentMonth()">
                            Mês Atual
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="window.financeiroPage.nextMonth()">
                            Próximo →
                        </button>
                    </div>
                </div>

                <h3 id="period-title" class="mb-md text-center"></h3>

                <div id="stats-container"></div>

                <div class="grid grid-2 mb-lg">
                    <div class="card">
                        <h4 class="mb-md">Faturamento por Dia</h4>
                        ${Chart.createCanvas('chart-daily', 600, 300)}
                    </div>
                    <div class="card">
                        <h4 class="mb-md">Serviços Mais Vendidos</h4>
                        ${Chart.createCanvas('chart-services', 600, 300)}
                    </div>
                </div>

                <div class="card">
                    <h3 class="mb-md">Formas de Pagamento</h3>
                    <div id="payment-methods"></div>
                </div>

                <div class="card mt-md">
                    <h3 class="mb-md">Histórico de Pagamentos</h3>
                    <div id="payments-list"></div>
                </div>
            </div>
        `;
    }

    init() {
        window.financeiroPage = this;
        this.updatePeriod();
    }

    previousMonth() {
        this.month--;
        if (this.month < 0) {
            this.month = 11;
            this.year--;
        }
        this.updatePeriod();
    }

    nextMonth() {
        this.month++;
        if (this.month > 11) {
            this.month = 0;
            this.year++;
        }
        this.updatePeriod();
    }

    currentMonth() {
        const now = new Date();
        this.year = now.getFullYear();
        this.month = now.getMonth();
        this.updatePeriod();
    }

    updatePeriod() {
        const date = new Date(this.year, this.month);
        const periodTitle = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        document.getElementById('period-title').textContent = periodTitle;

        this.renderStats();
        this.renderCharts();
        this.renderPaymentMethods();
        this.renderPayments();
    }

    renderStats() {
        const container = document.getElementById('stats-container');
        if (!container) return;

        const faturamento = FinanceiroService.getFaturamentoMes(this.year, this.month);
        const ticketMedio = FinanceiroService.getTicketMedio(this.year, this.month);
        const pagamentos = FinanceiroService.getPorMes(this.year, this.month);
        const totalAtendimentos = pagamentos.length;

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Faturamento Total</div>
                    <div class="stat-value">${Utils.formatCurrency(faturamento)}</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #5EAC7B 0%, #4A8B63 100%);">
                    <div class="stat-label">Ticket Médio</div>
                    <div class="stat-value">${Utils.formatCurrency(ticketMedio)}</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #3498DB 0%, #2980B9 100%);">
                    <div class="stat-label">Total de Atendimentos</div>
                    <div class="stat-value">${totalAtendimentos}</div>
                </div>
            </div>
        `;
    }

    renderCharts() {
        this.renderDailyChart();
        this.renderServicesChart();
    }

    renderDailyChart() {
        const pagamentos = FinanceiroService.getPorMes(this.year, this.month);
        const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();
        
        const dailyData = new Array(daysInMonth).fill(0);
        const labels = [];

        pagamentos.forEach(p => {
            const day = new Date(p.data).getDate() - 1;
            if (day >= 0 && day < daysInMonth) {
                dailyData[day] += p.valor;
            }
        });

        // Mostrar apenas dias com dados (últimos 15 dias ou semana atual)
        const today = new Date();
        const isCurrentMonth = this.year === today.getFullYear() && this.month === today.getMonth();
        const maxDay = isCurrentMonth ? today.getDate() : daysInMonth;
        const startDay = Math.max(0, maxDay - 15);

        const chartData = dailyData.slice(startDay, maxDay);
        for (let i = startDay; i < maxDay; i++) {
            labels.push(`${i + 1}`);
        }

        const chart = new Chart('chart-daily', {
            type: 'bar',
            data: chartData,
            labels: labels
        });

        setTimeout(() => chart.render(), 100);
    }

    renderServicesChart() {
        const servicos = FinanceiroService.getServicosMaisVendidos(this.year, this.month);
        
        if (servicos.length === 0) return;

        const data = servicos.slice(0, 5).map(s => s.quantidade);
        const labels = servicos.slice(0, 5).map(s => s.nome);

        const chart = new Chart('chart-services', {
            type: 'pie',
            data: data,
            labels: labels
        });

        setTimeout(() => chart.render(), 100);
    }

    renderPaymentMethods() {
        const container = document.getElementById('payment-methods');
        if (!container) return;

        const formas = FinanceiroService.getFormasPagamento(this.year, this.month);

        if (formas.length === 0) {
            container.innerHTML = '<p class="text-muted">Nenhum pagamento registrado</p>';
            return;
        }

        const total = formas.reduce((sum, f) => sum + f.valor, 0);

        container.innerHTML = `
            <div class="grid grid-3">
                ${formas.map(forma => `
                    <div class="card">
                        <h4 style="text-transform: capitalize;">${Utils.sanitizeHTML(forma.nome)}</h4>
                        <p class="text-primary" style="font-size: 1.5rem; font-weight: 700;">
                            ${Utils.formatCurrency(forma.valor)}
                        </p>
                        <p class="text-muted">
                            ${forma.quantidade} pagamentos (${((forma.valor / total) * 100).toFixed(1)}%)
                        </p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderPayments() {
        const container = document.getElementById('payments-list');
        if (!container) return;

        const pagamentos = FinanceiroService.getPorMes(this.year, this.month);

        if (pagamentos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💰</div>
                    <p>Nenhum pagamento registrado neste período</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Serviço</th>
                            <th>Valor</th>
                            <th>Forma de Pagamento</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pagamentos.map(p => `
                            <tr>
                                <td>${new Date(p.data).toLocaleDateString('pt-BR', { 
                                    day: '2-digit', 
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</td>
                                <td>${Utils.sanitizeHTML(p.servico)}</td>
                                <td><strong>${Utils.formatCurrency(p.valor)}</strong></td>
                                <td style="text-transform: capitalize;">${Utils.sanitizeHTML(p.formaPagamento)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    formatCurrency(value) {
        return Utils.formatCurrency(value);
    }

    destroy() {
        window.financeiroPage = null;
    }
}
