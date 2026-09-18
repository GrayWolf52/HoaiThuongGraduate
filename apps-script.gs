/**
 * ============================================================
 * Sổ lưu bút — Thiệp mời Lễ Tốt Nghiệp của Hoài Thương
 * Google Apps Script gắn với Google Sheet
 * ============================================================
 *
 * Cách dùng: xem HUONG-DAN-LOI-CHUC.md
 * Trả kết quả dạng JSONP (có tham số ?callback=) nên trang thiệp
 * gọi được mà không vướng CORS.
 */

var SHEET_NAME = 'LoiChuc';
var MAX_NAME = 40;
var MAX_MSG = 300;
var MAX_ROWS_RETURNED = 200;

/* ---------------------------------------------------------- *
 * Điểm vào
 * ---------------------------------------------------------- */

function doGet(e) {
  return handle(e);
}

function doPost(e) {
  return handle(e);
}

function handle(e) {
  var p = (e && e.parameter) || {};
  var out;

  try {
    out = (p.action === 'add') ? addWish(p) : { ok: true, data: listWishes() };
  } catch (err) {
    out = { ok: false, error: String(err && err.message ? err.message : err) };
  }

  return reply(out, p.callback);
}

/* ---------------------------------------------------------- *
 * Đọc / ghi
 * ---------------------------------------------------------- */

function listWishes() {
  var sh = getSheet();
  var last = sh.getLastRow();
  if (last < 2) return [];

  var rows = sh.getRange(2, 1, last - 1, 4).getValues();
  var out = [];

  for (var i = 0; i < rows.length; i++) {
    var luc = rows[i][0];
    var ten = String(rows[i][1] || '').trim();
    var loi = String(rows[i][2] || '').trim();
    var hien = rows[i][3];

    if (!loi) continue;
    if (hien === false || String(hien).toUpperCase() === 'FALSE') continue;  // ẩn thủ công trong Sheet

    out.push({
      id: 'r' + (i + 2),
      ten: ten || 'Ẩn danh',
      loi: loi,
      luc: (luc instanceof Date) ? luc.toISOString() : String(luc || '')
    });
  }

  return out.reverse().slice(0, MAX_ROWS_RETURNED);   // mới nhất lên đầu
}

function addWish(p) {
  var ten = String(p.ten || '').trim().replace(/\s+/g, ' ').slice(0, MAX_NAME);
  var loi = String(p.loi || '').trim().slice(0, MAX_MSG);

  if (!ten) return { ok: false, error: 'Thiếu tên người gửi.' };
  if (loi.length < 2) return { ok: false, error: 'Lời chúc còn trống.' };

  var sh = getSheet();

  // Chặn gửi trùng: cùng tên + cùng nội dung trong vòng 2 phút
  var last = sh.getLastRow();
  if (last >= 2) {
    var check = Math.min(20, last - 1);
    var recent = sh.getRange(last - check + 1, 1, check, 3).getValues();
    var now = Date.now();
    for (var i = 0; i < recent.length; i++) {
      var t = recent[i][0] instanceof Date ? recent[i][0].getTime() : 0;
      if (now - t < 2 * 60 * 1000 &&
          String(recent[i][1]).trim() === ten &&
          String(recent[i][2]).trim() === loi) {
        return { ok: false, error: 'Lời chúc này vừa được gửi rồi nha.' };
      }
    }
  }

  var luc = new Date();
  sh.appendRow([luc, ten, loi, true]);

  return { ok: true, data: { ten: ten, loi: loi, luc: luc.toISOString() } };
}

/* ---------------------------------------------------------- *
 * Tiện ích
 * ---------------------------------------------------------- */

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);

  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['Thời gian', 'Tên', 'Lời chúc', 'Hiển thị']);
    sh.getRange(1, 1, 1, 4).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 160);
    sh.setColumnWidth(2, 160);
    sh.setColumnWidth(3, 460);
  }

  return sh;
}

function reply(obj, callback) {
  var json = JSON.stringify(obj);

  // Chỉ chấp nhận tên hàm callback hợp lệ để tránh chèn mã lạ
  if (callback && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
