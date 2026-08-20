import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('form-af');
    const selectFornecedor = document.getElementById('fornecedor_id');
    const lista = document.getElementById('lista-afs');

    // 1. Carregar os fornecedores para o <select>
    async function carregarFornecedores() {
        const { data, error } = await supabase.from('fornecedores').select('id, razao_social').order('razao_social');
        if (data) {
            data.forEach(f => {
                const option = document.createElement('option');
                option.value = f.id;
                option.textContent = f.razao_social;
                selectFornecedor.appendChild(option);
            });
        }
    }

    // 2. Carregar a lista de AFs já cadastradas
    async function carregarAFs() {
        lista.innerHTML = '<p class="text-gray-500">Carregando...</p>';
        
        // Puxa as AFs e já faz um "Join" para trazer o nome do fornecedor junto!
        const { data, error } = await supabase
            .from('afs')
            .select(`
                id, numero_af, prazo_entrega, status,
                fornecedores (razao_social)
            `)
            .order('created_at', { ascending: false });

        lista.innerHTML = '';
        if (error || data.length === 0) {
            lista.innerHTML = '<p class="text-gray-500 text-sm">Nenhuma AF cadastrada.</p>';
            return;
        }

        data.forEach(af => {
            const dataPrazo = af.prazo_entrega ? new Date(af.prazo_entrega).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'Sem prazo';
            
            const div = document.createElement('div');
            div.className = 'p-4 border border-gray-200 rounded-md bg-gray-50 flex justify-between items-center';
            div.innerHTML = `
                <div>
                    <span class="font-bold text-blue-700">${af.numero_af}</span>
                    <span class="text-gray-600 ml-2">- ${af.fornecedores?.razao_social || 'Fornecedor Excluído'}</span>
                </div>
                <div class="flex gap-4 text-sm">
                    <span class="text-gray-500">Prazo: ${dataPrazo}</span>
                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded font-medium">${af.status}</span>
                </div>
            `;
            lista.appendChild(div);
        });
    }

    // 3. Salvar uma nova AF
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const numero_af = document.getElementById('numero_af').value;
        const fornecedor_id = document.getElementById('fornecedor_id').value;
        let prazo_entrega = document.getElementById('prazo_entrega').value;

        // Se o prazo estiver vazio, manda null pro banco
        if (!prazo_entrega) prazo_entrega = null;

        const { error } = await supabase
            .from('afs')
            .insert([{ numero_af, fornecedor_id, prazo_entrega }]);

        if (!error) {
            form.reset();
            carregarAFs();
        } else {
            alert('Erro ao salvar AF: ' + error.message);
        }
    });

    carregarFornecedores();
    carregarAFs();
});
