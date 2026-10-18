import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePaylocityBoardDates, paylocityPublicationDate, paylocityState } from '../lib/ats/paylocity';
import { isUSJob } from '../lib/ats/geo';

const origin = 'https://recruiting.paylocity.com';
const board = origin + '/Recruiting/Jobs/All/company';
const url = (id: number) => origin + '/Recruiting/Jobs/Details/' + id;
const title = 'Assistant Project Manager';
const html = (jobs: unknown[], links = [123, 456]) => links.map(id => `<a href="${url(id)}">${title}</a>`).join('')
  + `<script>window.pageData = ${JSON.stringify({ Jobs: jobs })}; window.afterBoard = true;</script>`;
const job = (id = 123, date = '2026-10-16T08:42:00-05:00') => ({ JobId: id, JobTitle: title, PublishedDate: date });

test('board dates join by exact JobId, preserving offset and distinct dates for identical titles', () => {
  const dates = parsePaylocityBoardDates(html([job(), job(456, '2026-09-30T12:05:38-05:00')]), board);
  assert.equal(paylocityPublicationDate({ title }, url(123), dates)?.toISOString(), '2026-10-16T13:42:00.000Z');
  assert.equal(paylocityPublicationDate({ title }, url(456), dates)?.toISOString(), '2026-09-30T17:05:38.000Z');
  assert.equal(paylocityPublicationDate({ title }, url(789), dates), undefined);
  assert.equal(paylocityPublicationDate({ title: 'Different position' }, url(123), dates), undefined);
  assert.equal(paylocityPublicationDate({ title }, url(123).replace(origin, 'https://other.example'), dates), undefined);
});

test('missing, relative, modified, impossible and future dates never become source publications', () => {
  for (const value of [undefined, '', 'Yesterday', '2026-02-30', '2099-01-01']) {
    assert.equal(parsePaylocityBoardDates(html([{ ...job(), PublishedDate: value, ModifiedDate: '2026-10-16' }]), board).size, 0);
  }
  assert.equal(parsePaylocityBoardDates(html([job(999)]), board).size, 0, 'ignore records without a matching listing link');
});

test('conflicting dates fail closed, valid detail dates keep priority', () => {
  const conflicts = parsePaylocityBoardDates(html([job(), job(123, '2026-10-15')]), board);
  assert.equal(conflicts.size, 0);
  const dates = parsePaylocityBoardDates(html([job()]), board);
  assert.equal(paylocityPublicationDate({ title, datePosted: '2026-10-14' }, url(123), dates)?.toISOString(), '2026-10-14T00:00:00.000Z');
});

test('JSON containing braces and quotes is parsed without evaluating board JavaScript', () => {
  const dates = parsePaylocityBoardDates(html([{ ...job(), Description: 'Text with } { and "quotes"' }]), board);
  assert.equal(dates.size, 1);
  const executable = `<a href="${url(123)}">${title}</a><script>window.pageData = { Jobs: [dangerousCall()] };</script>`;
  assert.equal(parsePaylocityBoardDates(executable, board).size, 0);
});

test('hybrid arrangement prefixes do not hide an explicit US state', () => {
  for (const [location, state] of [['Hybrid Remote • Pennsylvania', 'PA'], ['Hybrid Remote • NY', 'NY'], ['Fully Remote • West Virginia', 'WV']]) {
    const addressRegion = paylocityState(location);
    assert.equal(addressRegion, state);
    assert.equal(isUSJob({ location, addressRegion }, { allowBareRemote: false }), true);
  }
  for (const location of ['Hybrid Remote', 'Fully Remote • Ontario', 'Remote Worker - N/A']) {
    const addressRegion = paylocityState(location);
    assert.equal(addressRegion, undefined);
    assert.equal(isUSJob({ location, addressRegion }, { allowBareRemote: false }), false);
  }
});
