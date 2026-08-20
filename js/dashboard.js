import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const userEmailSpan = document.getElementById('user-email');
    const btnLogout = document.getElementById('btn-logout');

    // 1. Verifica se o usuário está logado
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
        // Se não tiver sessão, manda de volta pro login
        window.location.replace('index.html');
        return;
    }

    // 2. Mostra o e-mail do usuário logado na tela
    userEmailSpan.textContent = session.user.email;

    // 3. Configura o botão de Sair
    btnLogout.addEventListener('click', async () => {
        btnLogout.textContent = 'Saindo...';
        btnLogout.disabled = true;
        
        await supabase.auth.signOut();
        window.location.replace('index.html');
    });
});
