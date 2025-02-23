// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import * as webpush from "npm:web-push"
import { corsHeaders } from '../_shared/cors.ts'

// Configuração das credenciais VAPID
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;

webpush.setVapidDetails(
  'mailto:seu-email@exemplo.com', // Substitua pelo seu email
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar o método
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    // Validar o token de autorização
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { 
          status: 401, 
          headers: {
            corsHeaders
          }
        }
      );
    }

    // Obter a inscrição do push
    const subscription = await req.json();

    if (!subscription) {
      throw new Error('No subscription was provided');
    }

    // Enviar a notificação push
    const payload = JSON.stringify({
      title: 'Nova Notificação',
      body: 'Você tem uma nova mensagem!',
      icon: '/assets/icons/icon-128x128.png', // Ajuste para o caminho do seu ícone
      badge: '/assets/icons/badge-72x72.png', // Opcional: ícone para badge
      data: {
        url: '/' // URL para redirecionar quando clicar na notificação
      }
    });

    await webpush.sendNotification(subscription, payload);

    return new Response(
      JSON.stringify({ message: 'Notificação enviada com sucesso!' }), 
      { 
        headers: {
          corsHeaders
        }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: {
          corsHeaders
        }
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/push-notification' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
