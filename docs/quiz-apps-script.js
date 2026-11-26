/**
 * Método Barron — recebe o POST do quiz (LEADS_WEBHOOK_URL) e grava a aba "Quiz".
 *
 * Como publicar: docs/quiz-leads.md
 * Não cole a URL implantada neste arquivo.
 */
var QUIZ_HEADERS = [
  "createdAt",
  "name",
  "email",
  "contactType",
  "contact",
  "age",
  "capital",
  "experience",
  "goal",
  "dailyTime",
  "broker",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "source",
  "page",
  "consent",
];

function doPost(e) {
  try {
    var body = JSON.parse((e.postData && e.postData.contents) || "{}");
    if (body.kind && body.kind !== "quiz") {
      return json_({ ok: false, error: "not a quiz" });
    }
    var lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      var sheet = quizSheet_();
      ensureHeaders_(sheet);
      sheet.appendRow(
        QUIZ_HEADERS.map(function (key) {
          return cell_(body[key]);
        }),
      );
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function quizSheet_() {
  var ss = SpreadsheetApp.getActive();
  return ss.getSheetByName("Quiz") || ss.insertSheet("Quiz");
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(QUIZ_HEADERS);
    sheet.setFrozenRows(1);
    return;
  }
  var first = sheet.getRange(1, 1, 1, QUIZ_HEADERS.length).getValues()[0];
  if (first.join("") === "") {
    sheet.getRange(1, 1, 1, QUIZ_HEADERS.length).setValues([QUIZ_HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function cell_(value) {
  if (value == null) return "";
  var text = String(value).replace(/[\u0000-\u001F\u007F]/g, "").slice(0, 500);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
