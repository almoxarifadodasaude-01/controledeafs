// Importa o cliente do Supabase via CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Cole aqui as chaves do seu projeto oficial do Almoxarifado
const supabaseUrl = 'SUA_SUPABASE_URL_AQUI'
const supabaseAnonKey = 'SUA_SUPABASE_ANON_KEY_AQUI'

// Inicializa e exporta o cliente para ser usado nos outros arquivos
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
