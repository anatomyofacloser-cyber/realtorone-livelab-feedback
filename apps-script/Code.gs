/**
 * RealtorOne Live Lab feedback → Google Sheet + ebook email.
 * Paste into Extensions > Apps Script of your Google Sheet, set SALES_EMAIL, then
 * run setup() once, then Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 * The Sheet is the private admin: Responses (every row), Summary (all labs), Dashboard (one lab, pick in B2).
 * Nothing here is visible on the public page; doGet only returns a health check.
 */
const SALES_EMAIL = 'PUT_YOUR_SALES_EMAIL_HERE';   // gets an alert for "Yes" / "Tell me more"
const FROM_NAME   = 'RealtorOne Live Lab';
const REPLY_TO    = '';                             // optional, e.g. 'team@yourdomain.com'
const SITE_URL    = 'https://anatomyofacloser-cyber.github.io/realtorone-livelab-feedback/';
const RESPONSES   = 'Responses';
const SUMMARY     = 'Summary';
const DASHBOARD   = 'Dashboard';
const HEADERS = ['Received at','Lab','Lab title','Submitted at (client)','Name','Email','Phone','WhatsApp',
  'Q1 Value (1-5)','Q2 What they got','Q3 Most useful','Q4 Confidence (1-5)','Q5 Blocker','Q6 Wants help',
  'Consent to share','Reward','Reward URL','Email sent','Sales alert','Submission ID','User agent'];

function doGet() {
  return json_({ ok: true, service: 'realtorone-livelab-feedback', time: new Date().toISOString(),
                 mailQuotaLeft: MailApp.getRemainingDailyQuota() });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const email = String(d.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json_({ ok: false, error: 'invalid email' });
    const sh = sheet_(RESPONSES);
    ensureHeaders_(sh);
    // duplicate protection: same submission id, or same email + lab within 10 minutes
    const last = sh.getLastRow();
    if (last > 1) {
      const n = Math.min(300, last - 1);
      const rows = sh.getRange(last - n + 1, 1, n, HEADERS.length).getValues();
      const now = Date.now();
      const dup = rows.some(r => (d.submission_id && r[19] === d.submission_id) ||
        (String(r[1]) === labKey_(d.lab) && r[5] === email && now - new Date(r[0]).getTime() < 10 * 60 * 1000));
      if (dup) return json_({ ok: true, duplicate: true });
    }
    const url = safeUrl_(d.reward_url) || SITE_URL;
    let sent = 'no', alert = '';
    try { sendThanks_(d, email, url); sent = 'yes'; } catch (err) { sent = 'error: ' + err.message; }
    if ((d.q6_help === 'Yes' || d.q6_help === 'Tell me more') && SALES_EMAIL.indexOf('@') > 0) {
      try { sendSales_(d, email); alert = 'sent'; } catch (err) { alert = 'error: ' + err.message; }
    }
    sh.appendRow([new Date(), labKey_(d.lab), d.lab_title || '', d.timestamp || '', d.name || '', email,
      d.phone || '', d.whatsapp ? "'" + d.whatsapp : '', Number(d.q1_rating) || '', d.q2_got || '', d.q3_most_useful || '',
      Number(d.q4_confidence) || '', d.q5_blocker || '', d.q6_help || '', d.consent ? 'Yes' : 'No',
      d.reward_title || '', url, sent, alert, d.submission_id || '', d.user_agent || '']);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function sendThanks_(d, email, url) {
  const first = String(d.name || '').trim().split(' ')[0];
  const title = esc_(d.reward_title || 'your Live Lab ebook');
  const html =
  '<div style="background:#0b0b0d;padding:28px 0;font-family:Arial,Helvetica,sans-serif">' +
  '<table align="center" width="100%" style="max-width:520px;background:#141416;border:1px solid #3a3320;border-radius:16px;color:#fff" cellpadding="0" cellspacing="0"><tr><td style="padding:26px 28px">' +
  '<div style="color:#F5C242;font-size:12px;font-weight:bold;letter-spacing:3px">REALTORONE · LIVE LAB #' + esc_(d.lab) + '</div>' +
  '<h1 style="font-size:22px;margin:14px 0 6px;color:#fff">Thank you' + (first ? ', ' + esc_(first) : '') + '!</h1>' +
  '<p style="color:#c9c9c9;font-size:14px;line-height:1.6;margin:0 0 18px">Thanks for joining <b style="color:#fff">' + esc_(d.lab_title || 'today\'s Live Lab') +
  '</b> and sharing your feedback. Here is your free ebook, <b style="color:#F5C242">' + title + '</b>.</p>' +
  '<a href="' + url + '" style="display:inline-block;background:#E2AE3A;color:#111;text-decoration:none;font-weight:bold;font-size:15px;padding:13px 22px;border-radius:10px">Download the ebook (PDF)</a>' +
  '<p style="color:#9aa0a6;font-size:12.5px;line-height:1.6;margin:20px 0 0">Tip: pick one script and use it on a real call today. That\'s how invisible habits become visible results.</p>' +
  '<p style="color:#666;font-size:11px;margin:18px 0 0">If the button doesn\'t work, copy this link: ' + url + '</p>' +
  '</td></tr></table></div>';
  const opts = { name: FROM_NAME, htmlBody: html };
  if (REPLY_TO) opts.replyTo = REPLY_TO;
  MailApp.sendEmail(email, 'Your free ebook: ' + (d.reward_title || 'RealtorOne Live Lab'),
    'Thank you for joining the RealtorOne Live Lab. Download your ebook: ' + url, opts);
}

function sendSales_(d, email) {
  const body = [
    'Hot lead from Live Lab #' + d.lab + ' (' + (d.lab_title || '') + ')',
    'Wants help: ' + d.q6_help + (d.q6_help === 'Yes' ? '  → call within 1 hour' : '  → book a call within 24 hours'),
    '', 'Name: ' + (d.name || '-'), 'Email: ' + email, 'WhatsApp: ' + (d.whatsapp || '-'),
    'Value rating: ' + d.q1_rating + '/5   Confidence: ' + d.q4_confidence + '/5',
    'Got: ' + (d.q2_got || '-'), 'Most useful: ' + (d.q3_most_useful || '-'), 'Blocker: ' + (d.q5_blocker || '-')
  ].join('\n');
  MailApp.sendEmail(SALES_EMAIL, '🔥 Live Lab #' + d.lab + ' lead: ' + (d.name || email) + ' (' + d.q6_help + ')', body, { name: FROM_NAME });
}

/** Run once from the editor (select setup ▶ Run). Builds Responses, Summary (all labs) and Dashboard (one lab). */
function setup() {
  setupSummary();
  setupDashboard();
}

/** Private admin view inside your Sheet. Pick a lab in cell B2; everything below updates. */
function setupDashboard() {
  const resp = sheet_(RESPONSES); ensureHeaders_(resp);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const d = sheet_(DASHBOARD);
  d.getCharts().forEach(c => d.removeChart(c));
  d.clear(); d.clearConditionalFormatRules();
  const R = 'Responses!';
  d.getRange('A1').setValue('RealtorOne Live Lab · Dashboard (private)').setFontSize(16).setFontWeight('bold');
  d.getRange('A2').setValue('Lab →').setFontWeight('bold');
  const labs = resp.getLastRow() > 1 ? resp.getRange(2, 2, resp.getLastRow() - 1, 1).getDisplayValues().map(r => r[0]).filter(String) : [];
  const latest = labs.length ? labs.sort().slice(-1)[0] : 'Lab 05';
  d.getRange('B2').setNumberFormat('@').setValue(latest).setBackground('#F5C242').setFontWeight('bold')
    .setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(resp.getRange('B2:B'), true).setAllowInvalid(true).build());
  d.getRange('C2').setValue('← pick a lab (e.g. Lab 05)').setFontColor('#888');
  const L = '$B$2';
  // KPIs
  d.getRange('A4:B4').setValues([['KEY NUMBERS', '']]).setFontWeight('bold');
  d.getRange('A5:A9').setValues([['Responses'], ['Avg value rating (1-5)'], ['Avg confidence (1-5)'], ['Ebook emails sent'], ['Consented quotes']]);
  d.getRange('B5:B9').setFormulas([
    ['=COUNTIF(' + R + 'B:B,' + L + ')'],
    ['=IFERROR(ROUND(AVERAGEIF(' + R + 'B:B,' + L + ',' + R + 'I:I),2),"-")'],
    ['=IFERROR(ROUND(AVERAGEIF(' + R + 'B:B,' + L + ',' + R + 'L:L),2),"-")'],
    ['=COUNTIFS(' + R + 'B:B,' + L + ',' + R + 'R:R,"yes")'],
    ['=COUNTIFS(' + R + 'B:B,' + L + ',' + R + 'O:O,"Yes")']]);
  // Rating distribution
  d.getRange('A11:B11').setValues([['RATING', 'Count']]).setFontWeight('bold');
  for (let i = 1; i <= 5; i++) {
    d.getRange('A' + (11 + i)).setValue(i + ' ★');
    d.getRange('B' + (11 + i)).setFormula('=COUNTIFS(' + R + 'B:B,' + L + ',' + R + 'I:I,' + i + ')');
  }
  // Q6 routing
  d.getRange('A18:B18').setValues([['Q6 · WANTS HELP', 'Count']]).setFontWeight('bold');
  ['Yes', 'Tell me more', 'Not now'].forEach((o, i) => {
    d.getRange('A' + (19 + i)).setValue(o);
    d.getRange('B' + (19 + i)).setFormula('=COUNTIFS(' + R + 'B:B,' + L + ',' + R + 'N:N,"' + o + '")');
  });
  // Q2 counts (options are read from the answers themselves)
  d.getRange('D4:E4').setValues([['Q2 · WHAT THEY GOT', 'Count']]).setFontWeight('bold');
  d.getRange('D5').setFormula('=IFERROR(UNIQUE(FILTER(TRIM(FLATTEN(SPLIT(FILTER(' + R + 'J2:J,' + R + 'B2:B=' + L + ',' + R + 'J2:J<>""),";"))),TRIM(FLATTEN(SPLIT(FILTER(' + R + 'J2:J,' + R + 'B2:B=' + L + ',' + R + 'J2:J<>""),";")))<>"")),"(no answers yet)")');
  for (let r = 5; r <= 14; r++) {
    d.getRange('E' + r).setFormula('=IF(OR(D' + r + '="",D' + r + '="(no answers yet)"),"",SUMPRODUCT((' + R + 'B2:B=' + L + ')*ISNUMBER(SEARCH(D' + r + ',' + R + 'J2:J))))');
  }
  // Hot leads
  d.getRange('A24').setValue('🔥 HOT LEADS · Yes / Tell me more (newest first)').setFontWeight('bold');
  d.getRange('A25').setFormula('=IFERROR(QUERY(' + R + 'A2:U,"select A, E, F, H, N, I, L, M where B = \'"&' + L + '&"\' and (N = \'Yes\' or N = \'Tell me more\') order by A desc label A \'Received\', E \'Name\', F \'Email\', H \'WhatsApp\', N \'Wants\', I \'Rating\', L \'Confidence\', M \'Blocker\'",0),"No hot leads yet")');
  // Quotes
  d.getRange('J24').setValue('💬 LATEST CONSENTED QUOTES').setFontWeight('bold');
  d.getRange('J25').setFormula('=IFERROR(QUERY(' + R + 'A2:U,"select E, K, I where B = \'"&' + L + '&"\' and O = \'Yes\' and K <> \'\' order by A desc limit 10 label E \'Name\', K \'Most useful (quote)\', I \'Rating\'",0),"No consented quotes yet")');
  d.getRange('A25:L25').setFontWeight('bold').setBackground('#F5C242');
  d.getRange('A26:A200').setNumberFormat('dd mmm yyyy hh:mm');
  // Charts
  d.insertChart(d.newChart().setChartType(Charts.ChartType.PIE).addRange(d.getRange('A19:B21'))
    .setOption('title', 'Q6 routing').setOption('pieHole', 0.45).setOption('colors', ['#E2AE3A', '#8A6420', '#555555'])
    .setPosition(4, 7, 0, 0).setOption('width', 380).setOption('height', 240).build());
  d.insertChart(d.newChart().setChartType(Charts.ChartType.BAR).addRange(d.getRange('D5:E14'))
    .setOption('title', 'What they got (Q2)').setOption('legend', { position: 'none' }).setOption('colors', ['#E2AE3A'])
    .setPosition(4, 11, 0, 0).setOption('width', 420).setOption('height', 240).build());
  d.setColumnWidth(1, 170); d.setColumnWidth(4, 260); d.setColumnWidth(11, 320);
  d.setFrozenRows(2);
  ss.setActiveSheet(d);
}

/** All labs, one row each (also built by setup). */
function setupSummary() {
  ensureHeaders_(sheet_(RESPONSES));
  const s = sheet_(SUMMARY);
  s.clear();
  s.getRange('A1').setValue('Per-lab summary (auto-updates)').setFontWeight('bold');
  s.getRange('A3:H3').setValues([['Lab','Responses','Avg rating','Avg confidence','Yes','Tell me more','Not now','Emails sent']]).setFontWeight('bold');
  s.getRange('A4').setFormula('=SORT(UNIQUE(FILTER(Responses!B2:B,Responses!B2:B<>"")),1,FALSE)');
  for (let r = 4; r <= 60; r++) {
    s.getRange('B' + r + ':H' + r).setFormulas([[
      '=IF(A' + r + '="","",COUNTIF(Responses!B:B,A' + r + '))',
      '=IF(A' + r + '="","",ROUND(AVERAGEIF(Responses!B:B,A' + r + ',Responses!I:I),2))',
      '=IF(A' + r + '="","",ROUND(AVERAGEIF(Responses!B:B,A' + r + ',Responses!L:L),2))',
      '=IF(A' + r + '="","",COUNTIFS(Responses!B:B,A' + r + ',Responses!N:N,"Yes"))',
      '=IF(A' + r + '="","",COUNTIFS(Responses!B:B,A' + r + ',Responses!N:N,"Tell me more"))',
      '=IF(A' + r + '="","",COUNTIFS(Responses!B:B,A' + r + ',Responses!N:N,"Not now"))',
      '=IF(A' + r + '="","",COUNTIFS(Responses!B:B,A' + r + ',Responses!R:R,"yes"))'
    ]]);
  }
  s.setFrozenRows(3);
}

/** Optional: run once to check email works (sends a test to yourself). */
function testEmail() {
  sendThanks_({ lab: '05', lab_title: 'Test lab', name: 'Test', reward_title: 'Test ebook' },
    Session.getActiveUser().getEmail(), SITE_URL);
}

function sheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}
function ensureHeaders_(sh) {
  if (sh.getLastRow() === 0 || sh.getRange(1, 1).getValue() !== HEADERS[0]) {
    if (sh.getLastRow() === 0) sh.appendRow(HEADERS); else { sh.insertRowBefore(1); sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]); }
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#F5C242');
    sh.setFrozenRows(1);
  }
}
/** Lab ids are stored as text like "Lab 05" so Sheets never turns 05 into 5. */
function labKey_(id) { return 'Lab ' + String(id == null ? '' : id).trim(); }
function safeUrl_(u) { u = String(u || ''); return (u.indexOf(SITE_URL) === 0 && /^[^\s"'<>]+$/.test(u)) ? u : ''; } // only links on our own site
function esc_(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
