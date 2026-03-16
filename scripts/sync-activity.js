import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

/**
 * Activity Sync Script
 * Fetches contribution data from GitHub and GitLab and upserts it into Supabase.
 */

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
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
  
  // Basic query for user total contributions via GraphQL
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
    weeks.forEach(week => {
      week.contributionDays.forEach(day => {
        counts[day.date] = day.contributionCount;
      });
    });
    return counts;
  } catch (error) {
    console.error('Error fetching GitHub:', error.message);
    return {};
  }
}

async function fetchGitLabActivity() {
  if (!GITLAB_TOKEN) {
    console.log('GitLab credentials missing, skipping...');
    return {};
  }

  console.log('Fetching GitLab activity...');
  // GitLab events API is paginated and less direct for a "calendar", 
  // but we can fetch events from the last 90 days.
  const counts = {};
  try {
    const response = await axios.get(
      `https://gitlab.com/api/v4/users/${GITLAB_USER_ID}/events?after=${new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`,
      { headers: { 'Private-Token': GITLAB_TOKEN } }
    );

    response.data.forEach(event => {
      const date = event.created_at.split('T')[0];
      counts[date] = (counts[date] || 0) + 1;
    });
    return counts;
  } catch (error) {
    console.error('Error fetching GitLab:', error.message);
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
