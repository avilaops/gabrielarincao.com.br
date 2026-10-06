// Monta a landing. O CRM e o roteador saíram; o site tem uma página só.
import { LandingPage } from './src/pages/landing.js';
import { Header } from './src/components/header.js';

document.addEventListener('DOMContentLoaded', async () => {
    const page = new LandingPage();
    document.getElementById('app').innerHTML =
        `<main id="main-content" role="main">${await page.render()}</main>`;
    Header.initMobileMenu();
    page.init();
});
