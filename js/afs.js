import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('form-af');
    const selectFornecedor = document.getElementById('fornecedor_id');
    const selectSetor = document.getElementById('setor_id');
    const lista = document.getElementById('lista-afs');

    // Funções auxiliares
    const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
    const hojeZero = new Date();
    hojeZero.setHours(0,0,0,0);

    // 1. Carregar Fornecedores e Setores
    async function carregarFiltros() {
        const resF = await supabase.from('fornecedores').select('id, razao_social').order('razao_social');
        if (resF.data) {
            selectFornecedor.innerHTML = '<option value="">Selecione o Fornecedor...</option>';
            resF.data.forEach(f => selectFornecedor.innerHTML += `<option value="${f.id}">${f.razao_social}</option>`);
        }
        const resS = await supabase.from('setores').select('id, nome, cor').order('nome');
        if (resS.data) {
            window.setoresList = resS.data; // Guarda para colorir a tabela
            resS.data.forEach(s => selectSetor.innerHTML += `<option value="${s.id}">${s.nome}</option>`);
        }
    }

    // 2. Atualizar Métricas do V2 Dashboard
    function atualizarDashboard(afs) {
        let atrasadas = 0, vencemHoje = 0, parciais = 0, sancoes = 0, entregues = 0, saldoTotal = 0;

        afs.forEach(af => {
            const status = af.status;
            
            if (status === 'Entregue') entregues++;
            if (status === 'Entrega Parcial') parciais++;
            if (['Notificar', 'Advertir', 'Multar'].includes(status)) sancoes++;
            
            // Soma o saldo pendente (Ignora as entregues ou canceladas)
            if (status !== 'Entregue' && status !== 'Saldo Cancelado') {
                saldoTotal += parseFloat(af.valor_total || 0);

                // Verifica atrasos
                if (af.prazo_entrega) {
                    const dtPrazo = new Date(af.prazo_entrega + 'T00:00:00');
                    const diffDias = Math.ceil((dtPrazo - hojeZero) / (1000 * 60 * 60 * 24));
                    
                    if (diffDias < 0) atrasadas++;
                    else if (diffDias === 0) vencemHoje++;
                }
            }
        });

        // Pinta na tela
        document.getElementById('dash-atrasadas').innerText = atrasadas;
        document.getElementById('dash-hoje').innerText = vencemHoje;
        document.getElementById('dash-parciais').innerText = parciais;
        document.getElementById('dash-sancoes').innerText = sancoes;
        document.getElementById('dash-entregues').innerText = entregues;
        document.getElementById('dash-pendente').innerText = formatarMoeda(saldoTotal);
    }

    // 3. Carregar e Desenhar a Tabela de AFs
    async function carregarAFs() {
        lista.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-slate-500">Carregando dados do Supabase...</td></tr>';
        
        const { data, error } = await supabase
            .from('afs')
            .select('*, fornecedores(razao_social), setores(nome, cor)')
            .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
            lista.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-slate-500 font-medium">Nenhuma AF cadastrada no momento.</td></tr>';
            atualizarDashboard([]);
            return;
        }

        atualizarDashboard(data); // Chama o painel de métricas
        lista.innerHTML = '';

        data.forEach(af => {
            // Estilização das linhas como no V2 original
            let trClass = 'hover:bg-slate-50 transition border-b border-slate-100';
            if (af.status === 'Entregue') trClass = 'bg-green-50 hover:bg-green-100 border-b border-green-200';
            if (af.status === 'Entrega Parcial') trClass = 'bg-yellow-50 hover:bg-yellow-100 border-b border-yellow-200';
            
            // Badge do Prazo
            let badgePrazo = '-';
            let dtPrazoStr = '-';
            
            if (af.prazo_entrega) {
                const parts = af.prazo_entrega.split('-');
                dtPrazoStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
                const dtPrazo = new Date(af.prazo_entrega + 'T00:00:00');
                const diffDias = Math.ceil((dtPrazo - hojeZero) / (1000 * 60 * 60 * 24));

                if (af.status !== 'Entregue' && af.status !== 'Saldo Cancelado') {
                    if (diffDias < 0) {
                        badgePrazo = `<span class="mt-1 inline-block px-2 py-1 bg-red-100 text-red-700 text-[0.7rem] font-bold rounded">🔴 Atrasado há ${Math.abs(diffDias)}d</span>`;
                    } else if (diffDias === 0) {
                        badgePrazo = `<span class="mt-1 inline-block px-2 py-1 bg-amber-100 text-amber-700 text-[0.7rem] font-bold rounded">🟡 Vence Hoje!</span>`;
                    } else {
                        badgePrazo = `<span class="mt-1 inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-[0.7rem] font-bold rounded">🟢 +${diffDias}d restantes</span>`;
                    }
                }
            }

            const setorNome = af.setores?.nome || 'Geral';
            const setorCor = af.setores?.cor || '#3b82f6';

            const tr = document.createElement('tr');
            tr.className = trClass;
            tr.innerHTML = `
                <td class="p-3 align-top">
                    <span class="inline-block px-3 py-1 rounded-full text-white text-[0.7rem] font-bold" style="background-color: ${setorCor};">
                        ${setorNome}
                    </span>
                </td>
                <td class="p-3 align-top">
                    <div class="font-bold text-slate-800">${af.numero_af}</div>
                    ${af.numero_empenho ? `<div class="text-xs text-slate-500">Emp: ${af.numero_empenho}</div>` : ''}
                </td>
                <td class="p-3 align-top">
                    <div class="font-bold text-slate-700">${af.fornecedores?.razao_social || 'Não informado'}</div>
                    ${af.observacoes ? `<div class="text-xs text-slate-500 mt-1 line-clamp-2"><b>Itens:</b> ${af.observacoes}</div>` : ''}
                </td>
                <td class="p-3 align-top font-medium text-slate-700">
                    ${formatarMoeda(af.valor_total)}
                </td>
                <td class="p-3 align-top text-sm">
                    <div>${dtPrazoStr}</div>
                    ${badgePrazo}
                </td>
                <td class="p-3 align-top">
                    <span class="font-bold text-[0.8rem] text-slate-800 uppercase tracking-tight">${af.status}</span>
                </td>
            `;
            lista.appendChild(tr);
        });
    }

    // 4. Salvar Nova AF no Banco
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = form.querySelector('button[type="submit"]');
        btn.textContent = 'Salvando...';
        btn.disabled = true;

        const afData = {
            numero_af: document.getElementById('numero_af').value,
            numero_empenho: document.getElementById('numero_empenho').value || null,
            fornecedor_id: document.getElementById('fornecedor_id').value,
            setor_id: document.getElementById('setor_id').value || null,
            valor_total: document.getElementById('valor_total').value || 0,
            prazo_entrega: document.getElementById('prazo_entrega').value || null,
            status: document.getElementById('status').value,
            observacoes: document.getElementById('observacoes').value || null
        };

        const { error } = await supabase.from('afs').insert([afData]);

        if (!error) {
            form.reset();
            document.getElementById('valor_total').value = "0.00";
            carregarAFs();
        } else {
            alert('Erro ao salvar AF. Detalhes no console.');
            console.error(error);
        }

        btn.textContent = 'Salvar AF';
        btn.disabled = false;
    });

    carregarFiltros();
    carregarAFs();
});
