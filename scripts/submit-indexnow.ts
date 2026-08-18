#!/usr/bin/env ts-node

/**
 * One-shot IndexNow submission script
 * Submits all important URLs to Bing/IndexNow in a single run
 * 
 * Usage:
 *   npm run submit-indexnow
 *   or
 *   npx ts-node scripts/submit-indexnow.ts
 */

// Load environment variables from .env or .env.local
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory where this script is located
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Try to load from .env.local first, then .env
const envLocal = path.join(projectRoot, '.env.local');
const env = path.join(projectRoot, '.env');
dotenv.config({ path: envLocal });
dotenv.config({ path: env });

import { CERTIFICATIONS } from '../app/certifications/[slug]/certifications-data';
import { submitUrls, getIndexNowKey, getSiteHost, isIndexNowConfigured } from '../lib/indexnow';
import { getActiveAtsJobUrls } from '../lib/job-db';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.solarroles.com';

async function main() {
  console.log('🚀 Starting one-shot IndexNow submission...\n');
  console.log(`📁 Script directory: ${__dirname}`);
  console.log(`📁 Project root: ${projectRoot}`);
  console.log(`📁 Current working directory: ${process.cwd()}`);
  console.log('');

  // Debug: Show what env vars are loaded
  console.log('🔍 Environment variables check:');
  console.log(`   INDEXNOW_KEY: ${process.env.INDEXNOW_KEY ? '✅ Set (' + process.env.INDEXNOW_KEY.substring(0, 8) + '...)' : '❌ Not set'}`);
 
  console.log(`   NEXT_PUBLIC_SITE_URL: ${process.env.NEXT_PUBLIC_SITE_URL || 'Not set (will use default)'}`);
  console.log('');

  // Check configuration
  if (!isIndexNowConfigured()) {
    console.error('❌ ERROR: INDEXNOW_KEY or INDEXNOW_API_KEY environment variable is not set');
    console.error('   Make sure your .env file contains one of these variables');
    console.error(`   Expected location: ${path.join(projectRoot, '.env')}`);
    process.exit(1);
  }

  const apiKey = getIndexNowKey();
  const host = getSiteHost();
  console.log(`📡 Host: ${host}`);
  console.log(`🔑 API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
  console.log('');

  const allUrls: string[] = [];

  // 1. Certification pages
  console.log('📋 Collecting certification pages...');
  const certUrls = CERTIFICATIONS.map(cert => `${BASE_URL}/certifications/${cert.slug}`);
  allUrls.push(...certUrls);
  console.log(`   ✅ Added ${certUrls.length} certification URLs`);

  // 2. Recent ATS job pages (contenu principal)
  console.log('📋 Collecting recent ATS job pages...');
  const MAX_ATS_JOBS = 1000; // IndexNow accepte jusqu'à 10 000 URLs/requête
  const atsJobUrls = await getActiveAtsJobUrls(MAX_ATS_JOBS);
  allUrls.push(...atsJobUrls);
  console.log(`   ✅ Added ${atsJobUrls.length} ATS job URLs`);

  // 3. Blog pages
  console.log('📋 Collecting blog pages...');
  const blogPages = [
    'how-to-land-first-solar-job',
    'become-solar-installer-no-experience',
    'what-does-a-solar-installer-do',
  ];
  const blogUrls = blogPages.map(slug => `${BASE_URL}/blog/${slug}`);
  allUrls.push(...blogUrls);
  console.log(`   ✅ Added ${blogUrls.length} blog URLs`);

  // Remove duplicates
  const uniqueUrls = Array.from(new Set(allUrls));
  console.log(`\n📊 Total unique URLs to submit: ${uniqueUrls.length}`);
  console.log('');

  // Confirm before submission
  if (process.env.CI || process.env.NODE_ENV === 'production') {
    console.log('⚠️  Running in CI/production mode - auto-submitting...');
  } else {
    console.log('⚠️  Ready to submit to IndexNow');
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Submit to IndexNow
  console.log('📤 Submitting to IndexNow...\n');
  const startTime = Date.now();
  
  const success = await submitUrls(uniqueUrls, apiKey);
  
  const duration = Date.now() - startTime;

  console.log('');
  if (success) {
    console.log('✅ Successfully submitted all URLs to IndexNow!');
    console.log(`   ⏱️  Duration: ${duration}ms`);
    console.log(`   📊 URLs submitted: ${uniqueUrls.length}`);
    console.log('');
    console.log('Next steps:');
    console.log('  1. Check Bing Webmaster Tools to verify submission');
    console.log('  2. URLs should be indexed within hours to days');
    console.log('  3. Run this script again when you add new content');
    process.exit(0);
  } else {
    console.error('❌ Failed to submit URLs to IndexNow');
    console.error('   Check the error messages above for details');
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});