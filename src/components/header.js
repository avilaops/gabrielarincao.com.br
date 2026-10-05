// Componente de Header
import { authService } from '../services/auth.js';
import { Modal } from './modal.js';
import { Utils } from '../utils/utils.js';

export class Header {
    static render(isLanding = false) {
        if (isLanding) {
            return `
                <header class="header">
                <div class="header-content">
                    <div class="logo">
                        <img src="./favicon-96x96.png" alt="Gabriela Rincão" style="height: 40px; width: auto;">
                    </div>
                    <nav class="nav">
                        <a href="#/" class="nav-link" data-link>Home</a>
                        <a href="#servicos" class="nav-link">Serviços</a>
                        <a href="#depoimentos" class="nav-link">Depoimentos</a>
                    </nav>
                    
                    <!-- Mobile Menu Toggle -->
                    <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Abrir menu de navegação" aria-expanded="false">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
                </header>
                
                <!-- Mobile Navigation -->
                <div class="mobile-nav-overlay" id="mobile-nav-overlay"></div>
                <nav class="mobile-nav" id="mobile-nav">
                    <a href="#/" class="mobile-nav-link" data-link>
                        <span>🏠</span> Home
                    </a>
                    <a href="#servicos" class="mobile-nav-link">
                        <span>✨</span> Serviços
                    </a>
                    <a href="#depoimentos" class="mobile-nav-link">
                        <span>💬</span> Depoimentos
                    </a>
                    <a href="#/login" class="mobile-nav-link" data-link>
                        <span>🔑</span> Área Administrativa
                    </a>
                </nav>
            `;
        }
        
        const currentHash = window.location.hash.slice(1) || '/';
        const session = authService.getSession();
        const userName = Utils.sanitizeHTML(session ? session.nome : 'Admin');
        const userEmail = Utils.sanitizeHTML(session ? session.email : '');
        
        return `
            <header class="header">
                <div class="header-content">
                    <div class="logo">Gabriela CRM</div>
                    <nav class="nav">
                        <a href="#/dashboard" class="nav-link ${currentHash === '/dashboard' ? 'active' : ''}" data-link>Dashboard</a>
                        <a href="#/clientes" class="nav-link ${currentHash === '/clientes' ? 'active' : ''}" data-link>Clientes</a>
                        <a href="#/agenda" class="nav-link ${currentHash === '/agenda' ? 'active' : ''}" data-link>Agenda</a>
                        <a href="#/financeiro" class="nav-link ${currentHash === '/financeiro' ? 'active' : ''}" data-link>Financeiro</a>
                        <div class="nav-link" style="border-left: 1px solid var(--border); padding-left: 12px;">
                            <span style="color: var(--text-secondary); font-size: 0.875rem;">👤 ${userName}</span>
                            <button id="logoutBtn" class="btn btn-sm btn-outline" style="margin-left: 8px;">
                                🚪 Sair
                            </button>
                        </div>
                    </nav>
                    
                    <!-- Mobile Menu Toggle -->
                    <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Abrir menu administrativo" aria-expanded="false">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </header>
            
            <!-- Mobile Navigation -->
            <div class="mobile-nav-overlay" id="mobile-nav-overlay"></div>
            <nav class="mobile-nav" id="mobile-nav">
                <div style="padding: 16px; border-bottom: 1px solid var(--border); background: var(--background);">
                    <div style="font-weight: 600;">👤 ${userName}</div>
                    <div style="font-size: 0.875rem; color: var(--text-secondary);">${userEmail}</div>
                </div>
                <a href="#/dashboard" class="mobile-nav-link ${currentHash === '/dashboard' ? 'active' : ''}" data-link>
                    <span>📊</span> Dashboard
                </a>
                <a href="#/clientes" class="mobile-nav-link ${currentHash === '/clientes' ? 'active' : ''}" data-link>
                    <span>👥</span> Clientes
                </a>
                <a href="#/agenda" class="mobile-nav-link ${currentHash === '/agenda' ? 'active' : ''}" data-link>
                    <span>📅</span> Agenda
                </a>
                <a href="#/financeiro" class="mobile-nav-link ${currentHash === '/financeiro' ? 'active' : ''}" data-link>
                    <span>💰</span> Financeiro
                </a>
                <a href="#" class="mobile-nav-link" id="logoutBtnMobile" style="color: var(--danger); border-top: 1px solid var(--border); margin-top: 8px;">
                    <span>🚪</span> Sair do Sistema
                </a>
            </nav>
            
            <!-- Bottom Navigation Mobile -->
            <nav class="bottom-nav">
                <div class="bottom-nav-grid">
                    <a href="#/dashboard" class="bottom-nav-item ${currentHash === '/dashboard' ? 'active' : ''}" data-link>
                        <span class="bottom-nav-icon">📊</span>
                        Dashboard
                    </a>
                    <a href="#/clientes" class="bottom-nav-item ${currentHash === '/clientes' ? 'active' : ''}" data-link>
                        <span class="bottom-nav-icon">👥</span>
                        Clientes
                    </a>
                    <a href="#/agenda" class="bottom-nav-item ${currentHash === '/agenda' ? 'active' : ''}" data-link>
                        <span class="bottom-nav-icon">📅</span>
                        Agenda
                    </a>
                    <a href="#/financeiro" class="bottom-nav-item ${currentHash === '/financeiro' ? 'active' : ''}" data-link>
                        <span class="bottom-nav-icon">💰</span>
                        Financeiro
                    </a>
                </div>
            </nav>
        `;
    }
    
    
    static initMobileMenu() {
        // Mobile Menu Toggle
        const toggle = document.getElementById('mobile-menu-toggle');
        const overlay = document.getElementById('mobile-nav-overlay');
        const nav = document.getElementById('mobile-nav');
        
        if (!toggle || !overlay || !nav) return;
        
        function closeMobileMenu() {
            toggle.classList.remove('active');
            overlay.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            overlay.classList.toggle('active');
            nav.classList.toggle('active');
            
            if (nav.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        overlay.addEventListener('click', closeMobileMenu);
        
        // Close on navigation
        document.querySelectorAll('.mobile-nav-link, .bottom-nav-item').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Logout handlers
        this.initLogoutHandlers();
    }

    static initLogoutHandlers() {
        const logoutBtn = document.getElementById('logoutBtn');
        const logoutBtnMobile = document.getElementById('logoutBtnMobile');

        const handleLogout = (e) => {
            e.preventDefault();
            Modal.confirm('Deseja realmente sair do sistema?', () => {
                authService.logout();
                window.location.hash = '#/';
            });
        };

        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }

        if (logoutBtnMobile) {
            logoutBtnMobile.addEventListener('click', handleLogout);
        }
    }
}
