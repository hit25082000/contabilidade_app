export const environment = {
    productions: false,
    // Configuração do provedor de autenticação
    AUTH_PROVIDER: 'supabase', // Pode ser 'supabase' ou 'firebase'
    
    // Configurações do Supabase
    SUPABASE_URL: 'https://sclrtdaogtiudzgxqxql.supabase.co',
    SUPABASE_URL_HOM: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
    PUSH_NOTIFICATIONS_URL: 'https://sclrtdaogtiudzgxqxql.supabase.co/functions/v1/push-notification',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjbHJ0ZGFvZ3RpdWR6Z3hxeHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMDA3NzUsImV4cCI6MjA1NTY3Njc3NX0.wkF5ZtNipTRgPwDofTvJ6O32RDkyL5tlQviE24MLpqY',
    SUPABASE_FUNCTIONS_URL: 'https://sclrtdaogtiudzgxqxql.supabase.co/functions/v1',
    SUPABASE_ADMIN_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjbHJ0ZGFvZ3RpdWR6Z3hxeHFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDEwMDc3NSwiZXhwIjoyMDU1Njc2Nzc1fQ.1vAakYvQ836KL1o3fjNahfVFNG2G4edO1YjljEGLEqE',
    SUPABASE_FUNCTIONS_TOKEN: 'sbp_ec91ed8a54e395dc689b114ec034b46ab2d10a20',
    PUBLIC_VAPID_KEY: "BP_Xz7vZad3pDGq6-afmG1dg_MrKhlVIfx1Z-ENB7ldCPcMTJQiw03mGv1wtAvP4JYbAayMGmymaFBy48-aPr9Q",
    
    // Configurações do Firebase (comentadas, apenas para exemplo)
    // FIREBASE_API_KEY: 'sua-api-key',
    // FIREBASE_AUTH_DOMAIN: 'seu-projeto.firebaseapp.com',
    // FIREBASE_PROJECT_ID: 'seu-projeto',
    // FIREBASE_STORAGE_BUCKET: 'seu-projeto.appspot.com',
    // FIREBASE_MESSAGING_SENDER_ID: '123456789',
    // FIREBASE_APP_ID: '1:123456789:web:abcdef123456789',
    // FIREBASE_AUTH_URL: 'https://identitytoolkit.googleapis.com/v1'
    
};
