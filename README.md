# Gabriela - Sistema de Gestão para Estúdio de Sobrancelhas

Sistema completo de gestão de clientes (CRM) e landing page profissional para estúdio de design de sobrancelhas. 100% frontend, estático e compatível com GitHub Pages.

## 🎯 Funcionalidades

### Landing Page
- Hero section com CTA forte
- Apresentação de serviços
- Depoimentos de clientes
- Design feminino e elegante
- Integração com WhatsApp
- Totalmente responsiva

### Sistema CRM
- **Dashboard**: Visão geral do negócio com métricas e gráficos
- **Gestão de Clientes**: Cadastro completo com histórico de procedimentos
- **Agenda**: Calendário mensal e diário para agendamentos
- **Financeiro**: Controle de pagamentos e relatórios detalhados

## 🚀 Tecnologias

- HTML5
- CSS3 (Design System customizado)
- JavaScript ES6+ (Vanilla JS)
- LocalStorage para persistência de dados
- Canvas API para gráficos

## 📁 Estrutura do Projeto

```
gabriela/
├── index.html              # Página principal
├── app.js                  # Bootstrap da aplicação
├── .nojekyll              # Config GitHub Pages
├── src/
│   ├── assets/
│   │   └── styles.css     # Estilos globais
│   ├── components/
│   │   ├── header.js      # Componente de header
│   │   ├── modal.js       # Sistema de modais
│   │   └── chart.js       # Gráficos com Canvas
│   ├── pages/
│   │   ├── landing.js     # Landing page
│   │   ├── dashboard.js   # Dashboard CRM
│   │   ├── clientes.js    # Gestão de clientes
│   │   ├── agenda.js      # Sistema de agenda
│   │   └── financeiro.js  # Controle financeiro
│   └── services/
│       ├── storage.js     # LocalStorage service
│       ├── router.js      # Sistema de rotas SPA
│       ├── clientes.js    # Lógica de clientes
│       ├── agenda.js      # Lógica de agendamentos
│       └── financeiro.js  # Lógica financeira
└── README.md
```

## 🛠️ Instalação e Uso

### Desenvolvimento Local

1. Clone o repositório:
```bash
git clone https://github.com/avilaops/gabriela.git
cd gabriela
```

2. Abra com um servidor local:
```bash
# Usando Python 3
python -m http.server 8000

# Usando Node.js
npx serve

# Ou simplesmente abra o index.html no navegador
```

3. Acesse: `http://localhost:8000`

### Deploy no GitHub Pages

Publicado no **GitHub Pages** pelo workflow `.github/workflows/pages.yml`: todo push na `main` gera o site e publica; pull requests só rodam o build, para validar.

1. Em **Settings** → **Pages**, Source: **GitHub Actions**.
2. Em **Custom domain**, informe `gabrielarincao.com.br` e marque **Enforce HTTPS**.

Só os arquivos do site vão para o ar (lista no passo "Separa os arquivos
publicados" do workflow); arquivo novo na raiz precisa entrar nessa lista.

### Configuração de Domínio Customizado

Para usar `gabriela.avila.inc`:

1. No GitHub: Settings → Pages → Custom domain
2. Digite: `gabriela.avila.inc`
3. Configure DNS:
```
Type: CNAME
Name: gabriela
Value: avilaops.github.io
```

## 📱 Uso do Sistema

### Landing Page (/)
- Página inicial pública
- Apresentação dos serviços
- CTAs para WhatsApp
- Acesso ao sistema via "Acessar Sistema"

### Dashboard (/dashboard)
- Visão geral com estatísticas
- Próximos agendamentos
- Clientes recentes
- Gráficos de faturamento

### Clientes (/clientes)
- Cadastro de novos clientes
- Busca e listagem
- Histórico de procedimentos
- Edição e exclusão

### Agenda (/agenda)
- Visualização mensal/diária
- Criação de agendamentos
- Confirmação e conclusão
- Cancelamento com motivo

### Financeiro (/financeiro)
- Faturamento mensal
- Ticket médio
- Serviços mais vendidos
- Formas de pagamento
- Histórico completo

## 🎨 Personalização

### Cores
Edite as variáveis CSS em `src/assets/styles.css`:
```css
:root {
    --primary: #D4A574;        /* Cor principal */
    --primary-dark: #B8915F;   /* Cor escura */
    --primary-light: #E8D4BA;  /* Cor clara */
}
```

### Informações de Contato
Edite diretamente na landing page (`src/pages/landing.js`):
```javascript
// WhatsApp
https://wa.me/5517996820993

// Instagram
@gabrielarincao

// Email
gabrielacasari@hotmail.com
```

### Serviços e Preços
Modifique os cards de serviço na landing page e os selects nas páginas de agenda.

## 💾 Dados

Todos os dados são armazenados no **LocalStorage** do navegador:
- `gabriela_clientes`: Lista de clientes
- `gabriela_agendamentos`: Agendamentos
- `gabriela_pagamentos`: Pagamentos
- `gabriela_config`: Configurações

### Backup dos Dados
Os dados podem ser exportados via console do navegador:
```javascript
const backup = StorageService.export();
console.log(JSON.stringify(backup));
```

### Restaurar Dados
```javascript
const data = { /* seus dados */ };
StorageService.import(data);
```

## 🔒 Segurança

⚠️ **Importante**: Este é um sistema frontend estático. Os dados ficam armazenados localmente no navegador do usuário.

Para uso em produção com múltiplos usuários:
- Considere implementar backend
- Use autenticação apropriada
- Implemente backup em nuvem

## 📄 Licença

Este projeto foi desenvolvido para uso exclusivo do estúdio Gabriela.

## 🤝 Suporte

Para dúvidas ou suporte, entre em contato através do repositório GitHub.

---

**Desenvolvido com ❤️ para Gabriela Design de Sobrancelhas**
