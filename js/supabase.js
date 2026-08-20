// Importa o cliente do Supabase via CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Cole aqui as chaves do seu projeto oficial do Almoxarifado
const supabaseUrl = 'https://ufzbrvmvtmywxmjfhcqf.supabase.co/rest/v1/'
const supabaseAnonKey = 'sb_publishable_gSno2CLaM-LuPwFehJ8sFw_BuX1hswF'

// Inicializa e exporta o cliente para ser usado nos outros arquivos
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
