import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import WebSocket from 'ws';

// Polyfill WebSocket globally for Node.js environments (like older Node versions)
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = WebSocket;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false
  },
  realtime: {
    transport: WebSocket
  }
});

async function diagnostics() {
  console.log('--- Supabase Diagnostics ---');
  console.log('URL:', env.VITE_SUPABASE_URL);
  
  try {
    // Check if page_visits table exists and has data
    const { data: visits, error: visitError } = await supabase
      .from('page_visits')
      .select('*');
    
    if (visitError) {
      console.error('Error fetching page_visits:', visitError.message);
    } else {
      console.log('Page Visits Table Content:', visits);
    }

    // Check recent activity
    const { data: activity, error: activityError } = await supabase
      .from('portfolio_activity_log')
      .select('*')
      .limit(5);

    if (activityError) {
      console.error('Error fetching activity log:', activityError.message);
    } else {
      console.log('Recent Activity Log Snippet:', activity);
    }

  } catch (err) {
    console.error('Diagnostic failed:', err.message);
  }
}

diagnostics();
