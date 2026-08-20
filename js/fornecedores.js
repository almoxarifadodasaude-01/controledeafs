import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('form-fornecedor');
    const lista = document.getElementById('lista-fornecedores');

    // 1. Função que busca os dados no Supabase e desenha na tela
    async function carregarFornecedores() {
        lista.innerHTML = '<p class="text-sm text-gray-500">Carregando...</p>';
        
        const { data, error } = await supabase
            .from('fornecedores')
            .select('*')
            .order('razao_social');
        
        if (error) {
            lista.innerHTML = '<p class="text-sm text-red-500">Erro ao carregar dados.</p>';
            return;
        }

        lista.innerHTML = '';
        
        if (data.length === 0) {
            lista.innerHTML = '<p class="text-sm text-gray-500">Nenhum fornecedor cadastrado ainda.</p>';
            return;
        }

        data.forEach(fornecedor => {
            const li = document.createElement('li');
            li.className = 'p-4 border border-gray-200 rounded-md bg-gray-50 flex justify-between items-center';
            li.innerHTML = `
                <span class="font-medium">${fornecedor.razao_social}</span> 
                <span class="text-sm text-gray-500 bg-white px-2 py-1 rounded border">${fornecedor.cnpj || 'Sem CNPJ'}</span>
            `;
            lista.appendChild(li);
        });
    }

    // 2. Intercepta o botão "Salvar" para gravar no Supabase
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const razao_social = document.getElementById('razao_social').value;
        const cnpj = document.getElementById('cnpj').value;

        const { error } = await supabase
            .from('fornecedores')
            .insert([{ razao_social, cnpj }]);

        if (!error) {
            form.reset();
            carregarFornecedores(); // Atualiza a lista na hora
        } else {
            alert('Erro ao salvar fornecedor. Verifique as permissões.');
            console.error(error);
        }
    });

    // 3. Roda a função de carregar assim que a página abre
    carregarFornecedores();
});
