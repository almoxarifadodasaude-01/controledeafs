import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('form-setor');
    const lista = document.getElementById('lista-setores');
    const inputId = document.getElementById('edit_id');
    const inputNome = document.getElementById('nome');
    const inputCor = document.getElementById('cor');
    const btnCancelar = document.getElementById('btn-cancelar');
    const formTitle = document.getElementById('form-title');
    const btnSalvar = document.getElementById('btn-salvar');

    // 1. Carregar e desenhar a tabela de Setores
    async function carregarSetores() {
        lista.innerHTML = '<tr><td colspan="2" class="p-4 text-center text-slate-500">Carregando setores...</td></tr>';
        
        const { data, error } = await supabase
            .from('setores')
            .select('*')
            .order('nome');

        lista.innerHTML = '';
        
        if (error || data.length === 0) {
            lista.innerHTML = '<tr><td colspan="2" class="p-4 text-center text-slate-500">Nenhum setor cadastrado.</td></tr>';
            return;
        }

        data.forEach(setor => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-50 transition';
            tr.innerHTML = `
                <td class="p-3">
                    <div class="flex items-center gap-3">
                        <span class="inline-block px-3 py-1 rounded-full text-white text-[0.7rem] font-bold shadow-sm" style="background-color: ${setor.cor};">
                            ${setor.nome}
                        </span>
                        <code class="text-xs text-slate-400">${setor.cor}</code>
                    </div>
                </td>
                <td class="p-3 text-center">
                    <div class="flex justify-center gap-2">
                        <button class="btn-editar text-blue-600 hover:bg-blue-100 p-1 rounded transition" data-id="${setor.id}" data-nome="${setor.nome}" data-cor="${setor.cor}" title="Editar">✏️</button>
                        <button class="btn-excluir text-red-600 hover:bg-red-100 p-1 rounded transition" data-id="${setor.id}" title="Excluir">🗑️</button>
                    </div>
                </td>
            `;
            lista.appendChild(tr);
        });

        configurarBotoesAcao();
    }

    // 2. Configurar cliques nos botões de Editar e Excluir
    function configurarBotoesAcao() {
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const b = e.currentTarget;
                inputId.value = b.getAttribute('data-id');
                inputNome.value = b.getAttribute('data-nome');
                inputCor.value = b.getAttribute('data-cor');
                
                formTitle.textContent = '✏️ Editar Setor';
                btnSalvar.textContent = 'Atualizar Setor';
                btnCancelar.classList.remove('hidden');
            });
        });

        document.querySelectorAll('.btn-excluir').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if(confirm('Tem certeza que deseja excluir este setor? Se ele estiver vinculado a alguma AF, a exclusão será bloqueada pelo sistema.')) {
                    const id = e.currentTarget.getAttribute('data-id');
                    const { error } = await supabase.from('setores').delete().eq('id', id);
                    
                    if (error) {
                        alert('Não foi possível excluir. O setor provavelmente já está sendo usado em alguma AF.');
                    } else {
                        carregarSetores();
                    }
                }
            });
        });
    }

    // 3. Salvar / Atualizar Setor
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = inputId.value;
        const nome = inputNome.value.trim();
        const cor = inputCor.value;

        if (id) {
            // Modo Edição
            const { error } = await supabase.from('setores').update({ nome, cor }).eq('id', id);
            if (!error) resetarFormulario();
            else alert('Erro ao atualizar setor: ' + error.message);
        } else {
            // Modo Inserção
            const { error } = await supabase.from('setores').insert([{ nome, cor }]);
            if (!error) resetarFormulario();
            else alert('Erro ao cadastrar setor: ' + error.message);
        }
    });

    // 4. Cancelar Edição
    btnCancelar.addEventListener('click', resetarFormulario);

    function resetarFormulario() {
        form.reset();
        inputId.value = '';
        inputCor.value = '#2563eb';
        formTitle.textContent = 'Adicionar Novo Setor';
        btnSalvar.textContent = 'Salvar Setor';
        btnCancelar.classList.add('hidden');
        carregarSetores();
    }

    // Iniciar tela
    carregarSetores();
});
