// Landing Page Profissional
import { Header } from '../components/header.js';

export class LandingPage {
    async render() {
        return `
            ${Header.render(true)}
            
            <!-- Hero Section -->
            <section style="
                background:
                    radial-gradient(circle at 50% 20%, rgba(212,165,116,0.28) 0%, rgba(212,165,116,0) 55%),
                    linear-gradient(135deg, #1a1410 0%, #2a2018 45%, #3a2c1e 100%);
                color: white;
                padding: 140px 24px;
                text-align: center;
            ">
                <div class="container">
                    <h1 style="color: #ffffff; font-size: 3rem; margin-bottom: 24px; font-weight: 700; max-width: 820px; margin-left: auto; margin-right: auto; line-height: 1.1; text-shadow: 0 2px 20px rgba(0,0,0,0.55);">
                        Realce Sua Beleza Natural
                    </h1>
                    <p style="color: #ffffff; font-size: 1.5rem; margin-bottom: 40px; max-width: 600px; margin-left: auto; margin-right: auto; text-shadow: 0 1px 12px rgba(0,0,0,0.6);">
                        Design de sobrancelhas com técnica, precisão e elegância
                    </p>
                    <div class="flex flex-center gap-md" style="flex-wrap: wrap;">
                        <a href="https://wa.me/5517996820993?text=Olá! Gostaria de agendar um horário" 
                           class="btn btn-lg" 
                           style="background: white; color: #9D7C52; font-weight: 600;"
                           target="_blank">
                            📱 Agende pelo WhatsApp
                        </a>
                        <a href="#servicos" class="btn btn-lg btn-outline" style="border-color: rgba(255,255,255,0.8); color: white; background: transparent;">
                            Ver Serviços
                        </a>
                    </div>
                </div>
            </section>

            <!-- Depoimentos -->
            <section style="
                padding: 80px 24px;
                background: var(--background-alt);
            ">
                <div class="container">
                    <h2 class="text-center mb-lg">O Que Nossos Clientes Dizem</h2>
                    <div class="testimonials-carousel">
                        <div class="testimonial active">
                            <div class="testimonial-content">
                                <p class="testimonial-text">"A técnica da Gabriela é incrível! Minhas sobrancelhas nunca ficaram tão perfeitas. Recomendo demais!"</p>
                                <div class="testimonial-author">
                                    <strong>Ana Carolina</strong>
                                    <span class="text-secondary">Cliente há 1 ano</span>
                                </div>
                            </div>
                        </div>
                        <div class="testimonial">
                            <div class="testimonial-content">
                                <p class="testimonial-text">"Resultado natural e duradouro. O atendimento é impecável e o ambiente super acolhedor."</p>
                                <div class="testimonial-author">
                                    <strong>Mariana Silva</strong>
                                    <span class="text-secondary">Cliente fiel</span>
                                </div>
                            </div>
                        </div>
                        <div class="testimonial">
                            <div class="testimonial-content">
                                <p class="testimonial-text">"Transformou completamente meu olhar! Técnica profissional e resultado que supera as expectativas."</p>
                                <div class="testimonial-author">
                                    <strong>Carla Santos</strong>
                                    <span class="text-secondary">Cliente satisfeita</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="carousel-indicators">
                        <span class="indicator active" data-slide="0"></span>
                        <span class="indicator" data-slide="1"></span>
                        <span class="indicator" data-slide="2"></span>
                    </div>
                </div>
            </section>

            <!-- Benefícios -->
            <section style="padding: 80px 24px; background: white;">
                <div class="container">
                    <h2 class="text-center mb-lg">Por Que Escolher Nosso Estúdio?</h2>
                    <div class="grid grid-3">
                        <div class="card text-center">
                            <div style="font-size: 3rem; margin-bottom: 16px;">✨</div>
                            <h3 style="margin-bottom: 16px;">Técnica Profissional</h3>
                            <p class="text-secondary">
                                Anos de experiência com as melhores técnicas de design de sobrancelhas
                            </p>
                        </div>
                        <div class="card text-center">
                            <div style="font-size: 3rem; margin-bottom: 16px;">🎯</div>
                            <h3 style="margin-bottom: 16px;">Resultado Personalizado</h3>
                            <p class="text-secondary">
                                Cada rosto é único. Criamos o design perfeito para você
                            </p>
                        </div>
                        <div class="card text-center">
                            <div style="font-size: 3rem; margin-bottom: 16px;">💎</div>
                            <h3 style="margin-bottom: 16px;">Ambiente Premium</h3>
                            <p class="text-secondary">
                                Espaço exclusivo, aconchegante e pensado para seu conforto
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Serviços -->
            <section id="servicos" style="
                padding: 80px 24px;
                background: var(--background-alt);
            ">
                <div class="container">
                    <h2 class="text-center mb-lg">Nossos Serviços</h2>
                    <div class="grid grid-2">
                        ${this.renderServico(
                            'Brow Lamination',
                            'Sobrancelhas disciplinadas, volumosas e com efeito lifting por até 2 meses',
                            'R$ 120',
                            ['Efeito natural', 'Duração de 6-8 semanas', 'Fios alinhados', 'Visual cheio']
                        )}
                        ${this.renderServico(
                            'Nanofios',
                            'Técnica de micropigmentação fio a fio ultra realista e natural',
                            'R$ 450',
                            ['Resultado hiper-realista', 'Fios ultrafinos', 'Duração 1-2 anos', 'Retoque incluso']
                        )}
                        ${this.renderServico(
                            'Design de Sobrancelhas',
                            'Técnica exclusiva que valoriza seu olhar e harmoniza com seu rosto',
                            'R$ 40',
                            ['Análise facial completa', 'Design personalizado', 'Técnica avançada', 'Duração: 40min']
                        )}
                        ${this.renderServico(
                            'Design com Henna ou Coloração',
                            'Design completo com coloração natural que dura até 15 dias',
                            'R$ 50',
                            ['100% natural', 'Diversas tonalidades', 'Sem contraindicações', 'Efeito imediato']
                        )}
                        ${this.renderServico(
                            'Hidragloss',
                            'Tratamento hidratante e revitalizante para suas sobrancelhas',
                            'R$ 130 a sessão',
                            ['Hidratação profunda', 'Brilho natural', 'Fios fortalecidos', 'Resultado imediato']
                        )}
                    </div>
                </div>
            </section>

            <!-- Depoimentos -->
            <section id="depoimentos" style="padding: 80px 24px; background: white;">
                <div class="container">
                    <h2 class="text-center mb-lg">O Que Nossas Clientes Dizem</h2>
                    <div class="grid grid-3">
                        ${this.renderDepoimento(
                            'Mariana Silva',
                            'Amei o resultado! Profissional super atenciosa e o design ficou perfeito para meu rosto. Super recomendo!',
                            5
                        )}
                        ${this.renderDepoimento(
                            'Juliana Costa',
                            'Melhor lugar para fazer sobrancelha! Ambiente lindo e a Gabriela é muito talentosa. Não troco por nada!',
                            5
                        )}
                        ${this.renderDepoimento(
                            'Fernanda Oliveira',
                            'Fiz a micropigmentação e estou apaixonada! Acordar com as sobrancelhas prontas não tem preço.',
                            5
                        )}
                    </div>
                </div>
            </section>

            <!-- Processo -->
            <section style="padding: 80px 24px; background: var(--background);">
                <div class="container">
                    <h2 class="text-center mb-lg">Como Funciona</h2>
                    <div class="grid grid-4">
                        <div class="text-center">
                            <div class="badge badge-success" style="font-size: 1.5rem; padding: 16px; margin-bottom: 16px;">1</div>
                            <h3 style="font-size: 1.25rem; margin-bottom: 12px;">Agendamento</h3>
                            <p class="text-secondary">Entre em contato pelo WhatsApp e escolha seu horário</p>
                        </div>
                        <div class="text-center">
                            <div class="badge badge-success" style="font-size: 1.5rem; padding: 16px; margin-bottom: 16px;">2</div>
                            <h3 style="font-size: 1.25rem; margin-bottom: 12px;">Análise</h3>
                            <p class="text-secondary">Estudamos seu rosto e desenhamos o design ideal</p>
                        </div>
                        <div class="text-center">
                            <div class="badge badge-success" style="font-size: 1.5rem; padding: 16px; margin-bottom: 16px;">3</div>
                            <h3 style="font-size: 1.25rem; margin-bottom: 12px;">Execução</h3>
                            <p class="text-secondary">Realizamos o procedimento com técnica e cuidado</p>
                        </div>
                        <div class="text-center">
                            <div class="badge badge-success" style="font-size: 1.5rem; padding: 16px; margin-bottom: 16px;">4</div>
                            <h3 style="font-size: 1.25rem; margin-bottom: 12px;">Resultado</h3>
                            <p class="text-secondary">Você sai linda e confiante para arrasar!</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Instagram -->
            <section id="instagram" style="padding: 80px 24px; background: white;">
                <div class="container" style="text-align: center;">
                    <h2 class="mb-sm">Acompanhe no Instagram</h2>
                    <a href="https://instagram.com/gabrielarincao" target="_blank" rel="noopener noreferrer"
                       style="display: inline-block; color: var(--primary); font-size: 1.2rem; font-weight: 600; text-decoration: none; margin-bottom: 32px;">
                        @gabrielarincao
                    </a>
                    <a href="https://instagram.com/gabrielarincao" target="_blank" rel="noopener noreferrer"
                       class="btn btn-lg"
                       style="background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: white; font-weight: 600;">
                        📷 Seguir no Instagram
                    </a>
                </div>
            </section>

            <!-- CTA Final -->
            <section style="
                background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                color: white;
                padding: 80px 24px;
                text-align: center;
            ">
                <div class="container">
                    <h2 style="margin-bottom: 24px; font-size: 2.5rem;">Pronta Para Transformar Seu Olhar?</h2>
                    <p style="font-size: 1.2rem; margin-bottom: 40px; opacity: 0.95;">
                        Agende agora mesmo e descubra o poder de sobrancelhas perfeitas
                    </p>
                    <a href="https://wa.me/5517996820993?text=Olá! Gostaria de agendar um horário" 
                       class="btn btn-lg" 
                       style="background: white; color: #9D7C52; font-weight: 600;"
                       target="_blank">
                        📱 Agendar Agora pelo WhatsApp
                    </a>
                </div>
            </section>

            <!-- Footer -->
            <footer style="background: var(--secondary); color: white; padding: 60px 24px 24px; text-align: center;">
                <div class="container" style="max-width: 1200px; margin: 0 auto;">
                    <!-- Logo e Tagline -->
                    <div style="margin-bottom: 32px;">
                        <h3 style="font-family: var(--font-display); font-size: 1.8rem; margin-bottom: 8px; color: var(--primary);">
                            Gabriela Rincão
                        </h3>
                        <p style="font-size: 1rem; margin-bottom: 8px; opacity: 0.9;">
                            Design de Sobrancelhas | Brow Lamination | Nanofios
                        </p>
                        <p style="font-size: 0.9rem; opacity: 0.7;">
                            ✨ 6 anos transformando olhares com técnica e elegância
                        </p>
                    </div>

                    <!-- Links Sociais -->
                    <div style="margin-bottom: 32px;">
                        <div style="display: flex; justify-content: center; gap: 32px; flex-wrap: wrap; margin-bottom: 24px;">
                            <a href="https://instagram.com/gabrielarincao" 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               aria-label="Visite nosso Instagram"
                               style="color: white; text-decoration: none; display: flex; align-items: center; gap: 8px; transition: opacity 0.3s;"
                               onmouseover="this.style.opacity='0.7'" 
                               onmouseout="this.style.opacity='1'">
                                <span style="font-size: 1.5rem;">📷</span>
                                <span>Instagram</span>
                            </a>
                            <a href="https://wa.me/5517996820993" 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               aria-label="Fale conosco pelo WhatsApp"
                               style="color: white; text-decoration: none; display: flex; align-items: center; gap: 8px; transition: opacity 0.3s;"
                               onmouseover="this.style.opacity='0.7'" 
                               onmouseout="this.style.opacity='1'">
                                <span style="font-size: 1.5rem;">📱</span>
                                <span>WhatsApp</span>
                            </a>
                            <a href="mailto:gabrielacasari@hotmail.com" 
                               aria-label="Envie um e-mail"
                               style="color: white; text-decoration: none; display: flex; align-items: center; gap: 8px; transition: opacity 0.3s;"
                               onmouseover="this.style.opacity='0.7'" 
                               onmouseout="this.style.opacity='1'">
                                <span style="font-size: 1.5rem;">✉️</span>
                                <span>Email</span>
                            </a>
                        </div>
                    </div>

                    <!-- Divisor -->
                    <div style="border-top: 1px solid rgba(255,255,255,0.1); margin: 32px 0 24px;"></div>

                    <!-- Copyright e Admin -->
                    <div style="display: flex; justify-content: center; align-items: center; gap: 24px; flex-wrap: wrap; font-size: 0.9rem; opacity: 0.7;">
                        <p style="margin: 0;">
                            © ${new Date().getFullYear()} Gabriela Rincão - Todos os direitos reservados
                        </p>
                        <span style="opacity: 0.5;">•</span>
                        <a href="https://avila.inc" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.3s;"
                           onmouseover="this.style.color='rgba(255,255,255,1)'" 
                           onmouseout="this.style.color='rgba(255,255,255,0.7)'">
                            Desenvolvido por Avila.inc
                        </a>
                        <span style="opacity: 0.5;">•</span>
                        <a href="#/login" 
                           data-link 
                           style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.3s;"
                           onmouseover="this.style.color='rgba(255,255,255,1)'" 
                           onmouseout="this.style.color='rgba(255,255,255,0.7)'">
                            Área Administrativa
                        </a>
                    </div>
                </div>
            </footer>

            <!-- Sticky WhatsApp Button -->
            <a href="https://wa.me/5517996820993?text=Olá! Gostaria de agendar um horário" 
               class="whatsapp-sticky" 
               target="_blank" 
               aria-label="Agendar pelo WhatsApp">
                📱
            </a>
        `;
    }

    renderServico(titulo, descricao, preco, itens) {
        return `
            <div class="card">
                <h3 style="color: var(--primary); margin-bottom: 16px;">${titulo}</h3>
                <p class="text-secondary mb-md">${descricao}</p>
                <div style="font-size: 1.8rem; font-weight: 700; color: var(--primary); margin-bottom: 24px;">
                    ${preco}
                </div>
                <ul style="list-style: none; padding: 0;">
                    ${itens.map(item => `
                        <li style="padding: 8px 0; border-bottom: 1px solid var(--background);">
                            ✓ ${item}
                        </li>
                    `).join('')}
                </ul>
                <a href="https://wa.me/5517996820993?text=Olá! Gostaria de saber mais sobre ${encodeURIComponent(titulo)}" 
                   class="btn btn-primary mt-md" 
                   style="width: 100%;"
                   target="_blank">
                    Agendar
                </a>
            </div>
        `;
    }

    renderInstaTile(img) {
        return `
            <a href="https://instagram.com/gabrielarincao" target="_blank" rel="noopener noreferrer"
               style="position: relative; display: block; aspect-ratio: 1 / 1; overflow: hidden; border-radius: 8px; background: var(--background);"
               onmouseover="this.querySelector('img').style.transform='scale(1.06)'; this.querySelector('.insta-overlay').style.opacity='1';"
               onmouseout="this.querySelector('img').style.transform='scale(1)'; this.querySelector('.insta-overlay').style.opacity='0';">
                <img src="./${img}" alt="Trabalho de Gabriela Rincão no Instagram" loading="lazy"
                     style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease;">
                <span class="insta-overlay"
                      style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.35); color: white; font-size: 2rem; opacity: 0; transition: opacity 0.3s ease;">
                    📷
                </span>
            </a>
        `;
    }

    renderDepoimento(nome, texto, estrelas) {
        return `
            <div class="card">
                <div style="color: var(--primary); font-size: 1.5rem; margin-bottom: 16px;">
                    ${'★'.repeat(estrelas)}
                </div>
                <p style="font-style: italic; margin-bottom: 16px; color: var(--text-secondary);">
                    "${texto}"
                </p>
                <strong style="color: var(--primary);">${nome}</strong>
            </div>
        `;
    }

    init() {
        // Smooth scroll para âncoras (excluindo rotas SPA)
        document.querySelectorAll('a[href^="#"]:not([href^="#/"])').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Testimonials Carousel
        this.initTestimonialsCarousel();
    }

    initTestimonialsCarousel() {
        const testimonials = document.querySelectorAll('.testimonial');
        const indicators = document.querySelectorAll('.indicator');
        let currentSlide = 0;
        let autoSlideInterval;

        const showSlide = (index) => {
            testimonials.forEach((testimonial, i) => {
                testimonial.classList.toggle('active', i === index);
            });
            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === index);
            });
            currentSlide = index;
        };

        const nextSlide = () => {
            const nextIndex = (currentSlide + 1) % testimonials.length;
            showSlide(nextIndex);
        };

        // Auto-rotate every 4 seconds
        const startAutoSlide = () => {
            autoSlideInterval = setInterval(nextSlide, 4000);
        };

        const stopAutoSlide = () => {
            clearInterval(autoSlideInterval);
        };

        // Indicator click handlers
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                showSlide(index);
                stopAutoSlide();
                startAutoSlide(); // Restart auto-slide
            });
        });

        // Pause on hover
        const carousel = document.querySelector('.testimonials-carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', stopAutoSlide);
            carousel.addEventListener('mouseleave', startAutoSlide);
        }

        // Start auto-slide
        startAutoSlide();
    }
}
