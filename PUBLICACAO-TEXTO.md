# Publicação de texto • GitHub Pages

O workflow existente gera Markdown e MDX do HTML em dist, depois do build e dos testes, antes de arquivar o mesmo artefato publicado. O publicador motor-web é fixado por commit. publicacao-texto.json registra as rotas e exclusões; llms.txt e links alternativos permitem descobrir as versões textuais. A página404 fica excluída pelo noindex existente.

GitHub Pages não interpreta _headers. No domínio comercial com proxy Cloudflare, regras de resposta específicas para .md e .mdx fornecem MIME e X-Robots-Tag noindex, follow. A conferência desses cabeçalhos no domínio é condição de aceite da publicação. O hostname técnico github.io não recebe essas regras. O sitemap continua apontando ao HTML.

Nenhuma alteração no renderizador, interface, tracking, DNS ou provedor. Para rollback, publicar o artefato/commit anterior pelo workflow existente; as regras de texto não correspondem a HTML, CSS, imagens ou JavaScript.
