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

  // 2. Resource pages
  console.log('📋 Collecting resource pages...');
  const resourcePages = [
    'how-to-become-a-solar-installer',
    'how-to-get-a-solar-apprenticeship',
    'manufacturer-certifications-tesla-enphase-solaredge',
    'nabcep-training-providers-compared',
    'nabcep-vs-eta-vs-state-licenses',
    'osha-safety-guide-solar-installers',
    'solar-dc-safety-for-electricians',
    'solar-certifications-by-job-role',
    'solar-installer-apprenticeship-programs',
    'solar-installer-certification',
    'how-to-get-nabcep-certified',
    'nabcep-board-eligible-status',
    'nabcep-project-credits-explained',
    'nabcep-pvip-pass-rate',
    'nabcep-pvis-vs-pvip',
    'solar-sales-1099-vs-w2-pay',
    'do-you-need-to-be-an-electrician-for-bess',
  ];
  const resourceUrls = resourcePages.map(slug => `${BASE_URL}/resources/${slug}`);
  allUrls.push(...resourceUrls);
  console.log(`   ✅ Added ${resourceUrls.length} resource URLs`);

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

  // 4. Job landing pages
  console.log('📋 Collecting job landing pages...');
  const jobLandingPages = [
    'solar-pv-installer-jobs',
    'solar-electrician-jobs',
    'lead-solar-installer-jobs',
    'solar-jobs-no-experience',
    'solar-sales-jobs',
    'bess-technician-jobs',
  ];
  const jobUrls = jobLandingPages.map(slug => `${BASE_URL}/${slug}`);
  allUrls.push(...jobUrls);
  console.log(`   ✅ Added ${jobUrls.length} job landing URLs`);

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