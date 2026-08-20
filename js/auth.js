import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const msgErro = document.getElementById('msg-erro');
    const btnLogin = document.getElementById('btn-login');

    // Verifica se já existe uma sessão ativa. Se sim, manda direto pro dashboard.
    async function checkSession() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            window.location.href = 'dashboard.html';
        }
    }
    checkSession();

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('senha').value;
        
        // Estado de loading no botão
        btnLogin.textContent = 'Autenticando...';
        btnLogin.disabled = true;
        msgErro.classList.add('hidden');

        // Tenta fazer o login com o Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            msgErro.textContent = 'E-mail ou senha incorretos. Tente novamente.';
            msgErro.classList.remove('hidden');
            btnLogin.textContent = 'Entrar no Sistema';
            btnLogin.disabled = false;
        } else {
            // Login de sucesso! Redireciona para o painel.
            window.location.href = 'dashboard.html';
        }
    });
});
