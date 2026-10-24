/**
 * RSVP receiver for the Nida & Juned invitation.
 *
 * Paste this into Extensions → Apps Script of the Google Sheet that should collect replies,
 * then follow "RSVP: connect your Google Sheet" in README.md. It appends one row per reply to
 * a tab called "RSVPs" (created automatically): time received (IST), name, attending.
 *
 * Only requests carrying the secret stored in Script Properties (RSVP_SECRET) are accepted,
 * so nobody can write to your sheet just by finding this address.
 */

var SHEET_NAME = 'RSVPs';

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var expected = PropertiesService.getScriptProperties().getProperty('RSVP_SECRET');
    if (!expected || data.secret !== expected) {
      return reply({ ok: false, error: 'unauthorized' });
    }

    var name = clean(data.name);
    var attending = data.attending === 'yes' ? 'Yes' : data.attending === 'no' ? 'No' : '';
    if (!name || !attending) {
      return reply({ ok: false, error: 'invalid' });
    }

    lock.waitLock(10000);
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Received (IST)', 'Name', 'Attending']);
      sheet.setFrozenRows(1);
    }
    var received = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm');
    sheet.appendRow([received, name, attending]);
    return reply({ ok: true });
  } catch (error) {
    return reply({ ok: false, error: 'server' });
  } finally {
    lock.releaseLock();
  }
}

/** Trims, limits length and stops text being treated as a spreadsheet formula. */
function clean(value) {
  var text = String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
