// Componente de Modal
import { Utils } from '../utils/utils.js';
export class Modal {
    constructor(options = {}) {
        this.id = options.id || 'modal-' + Date.now();
        this.title = options.title || '';
        this.content = options.content || '';
        this.size = options.size || 'md';
        this.onClose = options.onClose || null;
    }

    render() {
        return `
            <div id="${this.id}" class="modal-overlay">
                <div class="modal modal-${this.size}">
                    <div class="modal-header">
                        <h3 class="modal-title">${this.title}</h3>
                        <button class="modal-close" data-modal-close>✕</button>
                    </div>
                    <div class="modal-body">
                        ${this.content}
                    </div>
                </div>
            </div>
        `;
    }

    show() {
        const existing = document.getElementById(this.id);
        if (existing) existing.remove();
        
        document.body.insertAdjacentHTML('beforeend', this.render());
        
        const modalElement = document.getElementById(this.id);
        Utils.log('Modal element created:', modalElement);
        
        // Aguardar próximo frame antes de adicionar listeners
        // Isso evita que o click que abriu o modal feche ele imediatamente
        setTimeout(() => {
            // Click no overlay para fechar
            modalElement.addEventListener('click', (e) => {
                if (e.target === modalElement) {
                    this.close();
                }
            });
            
            // Botão fechar
            const closeBtn = modalElement.querySelector('[data-modal-close]');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }
        }, 100);
        
        // ESC para fechar
        this.escListener = (e) => {
            if (e.key === 'Escape') {
                this.close();
                this.removeEscListener();
            }
        };
        document.addEventListener('keydown', this.escListener);
        
        // Animação
        requestAnimationFrame(() => {
            modalElement.classList.add('fade-in');
        });
    }

    removeEscListener() {
        if (this.escListener) {
            document.removeEventListener('keydown', this.escListener);
            this.escListener = null;
        }
    }

    // Tira o modal da tela na hora, sem animação e sem chamar onClose
    remove() {
        document.getElementById(this.id)?.remove();
        this.removeEscListener();
    }

    close() {
        const modal = document.getElementById(this.id);
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.remove();
                if (this.onClose) this.onClose();
            }, 200);
        }
    }

    static confirm(message, onConfirm) {
        const modalId = 'modal-confirm-' + Date.now();
        const modal = new Modal({
            id: modalId,
            title: 'Confirmação',
            content: `
                <p style="margin-bottom: 24px;">${message}</p>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-cancel>
                        Cancelar
                    </button>
                    <button class="btn btn-primary" data-confirm>
                        Confirmar
                    </button>
                </div>
            `
        });
        
        modal.show();
        
        setTimeout(() => {
            const modalElement = document.getElementById(modalId);
            
            const cancelBtn = modalElement.querySelector('[data-cancel]');
            const confirmBtn = modalElement.querySelector('[data-confirm]');
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => modal.close());
            }
            
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    onConfirm();
                    modal.close();
                });
            }
        }, 100);
    }

    static alert(message, title = 'Aviso') {
        const modalId = 'modal-alert-' + Date.now();
        const modal = new Modal({
            id: modalId,
            title: title,
            content: `
                <p style="margin-bottom: 24px;">${message}</p>
                <div class="modal-footer">
                    <button class="btn btn-primary" data-ok>
                        OK
                    </button>
                </div>
            `
        });
        
        modal.show();
        
        setTimeout(() => {
            const modalElement = document.getElementById(modalId);
            const okBtn = modalElement.querySelector('[data-ok]');
            
            if (okBtn) {
                okBtn.addEventListener('click', () => modal.close());
            }
        }, 100);
    }
}

