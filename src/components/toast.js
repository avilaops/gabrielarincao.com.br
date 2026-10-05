// Componente de Toast: aviso curto que some sozinho
export class Toast {
    static CONTAINER_ID = 'toast-container';

    static getContainer() {
        let container = document.getElementById(this.CONTAINER_ID);
        if (!container) {
            container = document.createElement('div');
            container.id = this.CONTAINER_ID;
            container.setAttribute('role', 'status');
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(container);
        }
        return container;
    }

    static show(mensagem, tipo = 'info', duracaoMs = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        // textContent: a mensagem nunca é interpretada como HTML
        toast.textContent = mensagem;

        const timer = setTimeout(() => toast.remove(), duracaoMs);
        toast.addEventListener('click', () => {
            clearTimeout(timer);
            toast.remove();
        });

        this.getContainer().appendChild(toast);
        return toast;
    }

    static success(mensagem, duracaoMs) {
        return this.show(mensagem, 'success', duracaoMs);
    }

    static error(mensagem, duracaoMs) {
        return this.show(mensagem, 'error', duracaoMs);
    }

    static warning(mensagem, duracaoMs) {
        return this.show(mensagem, 'warning', duracaoMs);
    }
}
