import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env manually if not already present in process.env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value.replace(/^['"]|['"]$/g, '');
      }
    }
  });
}

/**
 * Activity Sync Script
 * Fetches contribution data from GitHub and GitLab and upserts it into Supabase.
 */

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GITHUB_TOKEN = process.env.GH_PAT;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'Kanrishaurus';
const GITLAB_TOKEN = process.env.GITLAB_TOKEN;
const GITLAB_USER_ID = process.env.GITLAB_USER_ID; 

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fetchGitHubActivity() {
  if (!GITHUB_TOKEN || !GITHUB_USERNAME) {
    console.log('GitHub credentials missing, skipping...');
    return {};
  }

  console.log('Fetching GitHub activity for:', GITHUB_USERNAME);
  
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      'https://api.github.com/graphql',
      { query, variables: { username: GITHUB_USERNAME } },
      { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } }
    );

    const counts = {};
    const weeks = response.data.data.user.contributionsCollection.contributionCalendar.weeks;
    let totalDays = 0;
    let totalCount = 0;

    weeks.forEach(week => {
      week.contributionDays.forEach(day => {
        counts[day.date] = day.contributionCount;
        if (day.contributionCount > 0) {
          totalDays++;
          totalCount += day.contributionCount;
        }
      });
    });

    console.log(`GitHub sync finished: ${totalCount} contributions across ${totalDays} active days.`);
    return counts;
  } catch (error) {
    console.error('Error fetching GitHub:', error.message);
    return {};
  }
}

async function fetchGitLabActivity() {
  if (!GITLAB_TOKEN || !GITLAB_USER_ID) {
    console.log('GitLab credentials missing, skipping...');
    return {};
  }

  console.log('Fetching GitLab activity (last 365 days)...');
  const counts = {};
  const afterDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  try {
    let page = 1;
    let hasMore = true;
    let totalEvents = 0;

    while (hasMore && page <= 10) { // Limit to 10 pages (1000 events) for safety
      const response = await axios.get(
        `https://gitlab.com/api/v4/users/${GITLAB_USER_ID}/events?after=${afterDate}&per_page=100&page=${page}`,
        { headers: { 'Private-Token': GITLAB_TOKEN } }
      );

      if (response.data.length === 0) {
        hasMore = false;
        break;
      }

      response.data.forEach(event => {
        const date = event.created_at.split('T')[0];
        counts[date] = (counts[date] || 0) + 1;
        totalEvents++;
      });

      console.log(`  Page ${page}: Found ${response.data.length} events...`);
      page++;
      
      // If we got fewer than 100 events, it's the last page
      if (response.data.length < 100) {
        hasMore = false;
      }
    }

    console.log(`GitLab sync finished: ${totalEvents} total events across ${Object.keys(counts).length} days.`);
    return counts;
  } catch (error) {
    console.error('Error fetching GitLab:', error.response?.data || error.message);
    return {};
  }
}

async function sync() {
  const ghActivity = await fetchGitHubActivity();
  const glActivity = await fetchGitLabActivity();

  // Merge activity
  const combined = { ...ghActivity };
  Object.keys(glActivity).forEach(date => {
    combined[date] = (combined[date] || 0) + glActivity[date];
  });

  const upsertData = Object.keys(combined).map(date => ({
    date,
    count: combined[date]
  }));

  console.log(`Upserting ${upsertData.length} records to Supabase...`);

  const { error } = await supabase
    .from('portfolio_activity_log')
    .upsert(upsertData, { onConflict: 'date' });

  if (error) {
    console.error('Supabase Upsert Error:', error.message);
  } else {
    console.log('Sync completed successfully!');
  }
}

sync();
