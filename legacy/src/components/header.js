// Componente de Header

export class Header {
    static render() {
        {
            return `
                <header class="header">
                <div class="header-content">
                    <div class="logo">
                        <img src="./favicon-96x96.png" alt="Gabriela Rincão" style="height: 40px; width: auto;">
                    </div>
                    <nav class="nav">
                        <a href="#main-content" class="nav-link">Home</a>
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
                    <a href="#main-content" class="mobile-nav-link">
                        <span>🏠</span> Home
                    </a>
                    <a href="#servicos" class="mobile-nav-link">
                        <span>✨</span> Serviços
                    </a>
                    <a href="#depoimentos" class="mobile-nav-link">
                        <span>💬</span> Depoimentos
                    </a>
                </nav>
            `;
        }
        
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
    }
}
