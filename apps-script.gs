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
var DUPLICATE_WINDOW_SECONDS = 120;
var DISCORD_WEBHOOK_PROPERTY = 'DISCORD_WEBHOOK_URL';

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

  var rows = sh.getRange(2, 1, last - 1, 6).getValues();
  var out = [];

  for (var i = 0; i < rows.length; i++) {
    var luc = rows[i][0];
    var ten = String(rows[i][1] || '').trim();
    var loi = String(rows[i][2] || '').trim();
    var hien = rows[i][3];
    var attendance = String(rows[i][4] || '').trim();
    var khachMoi = String(rows[i][5] || '').trim();

    if (!loi) continue;
    if (hien === false || String(hien).toUpperCase() === 'FALSE') continue;  // ẩn thủ công trong Sheet

    out.push({
      id: 'r' + (i + 2),
      ten: ten || 'Ẩn danh',
      loi: loi,
      attendance: attendance,
      khachMoi: khachMoi,
      luc: (luc instanceof Date) ? luc.toISOString() : String(luc || '')
    });
  }

  return out.reverse().slice(0, MAX_ROWS_RETURNED);   // mới nhất lên đầu
}

function addWish(p) {
  var ten = String(p.ten || '').trim().replace(/\s+/g, ' ').slice(0, MAX_NAME);
  var loi = String(p.loi || '').trim().slice(0, MAX_MSG);
  var attendance = String(p.attendance || '').trim();
  var khachMoi = String(p.khachMoi || 'BẠN').trim().replace(/\s+/g, ' ').slice(0, 60);

  if (!ten) return { ok: false, error: 'Thiếu tên người gửi.' };
  if (loi.length < 2) return { ok: false, error: 'Lời chúc còn trống.' };
  if (attendance !== 'yes' && attendance !== 'no') return { ok: false, error: 'Chưa chọn khả năng tham dự.' };

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { ok: false, error: 'Hệ thống đang bận, bạn thử lại sau vài giây nha.' };
  }

  try {
    return addWishLocked(ten, loi, attendance, khachMoi);
  } finally {
    lock.releaseLock();
  }
}

function addWishLocked(ten, loi, attendance, khachMoi) {
  var sh = getSheet();

  // Chặn gửi trùng: cùng tên + cùng nội dung trong vòng 2 phút
  var last = sh.getLastRow();
  if (last >= 2) {
    var check = Math.min(20, last - 1);
    var recent = sh.getRange(last - check + 1, 1, check, 3).getValues();
    var now = Date.now();
    for (var i = 0; i < recent.length; i++) {
      var t = recent[i][0] instanceof Date ? recent[i][0].getTime() : 0;
      if (now - t < DUPLICATE_WINDOW_SECONDS * 1000 &&
          String(recent[i][1]).trim() === ten &&
          String(recent[i][2]).trim() === loi) {
        return { ok: false, error: 'Lời chúc này vừa được gửi rồi nha.' };
      }
    }
  }

  var luc = new Date();
  sh.appendRow([luc, ten, loi, true, attendance, khachMoi]);
  var discord = sendDiscordNotification(ten, loi, luc, attendance, khachMoi);

  return {
    ok: true,
    data: { ten: ten, loi: loi, attendance: attendance, khachMoi: khachMoi, luc: luc.toISOString() },
    discord: discord
  };
}

function sendDiscordNotification(ten, loi, luc, attendance, khachMoi) {
  var webhookUrl = PropertiesService.getScriptProperties().getProperty(DISCORD_WEBHOOK_PROPERTY);
  if (!webhookUrl) return { ok: false, error: 'Chưa cấu hình Discord webhook.' };

  var payload = {
    username: 'Sổ lưu bút Hoài Thương',
    allowed_mentions: { parse: [] },
    embeds: [{
      title: 'Có lời chúc mới',
      color: 10184504,
      fields: [
        { name: 'Người gửi', value: ten, inline: true },
        { name: 'Khách mời', value: khachMoi || 'BẠN', inline: true },
        { name: 'Tham dự', value: attendance === 'yes' ? 'Có' : 'Không', inline: true },
        { name: 'Lời chúc', value: loi, inline: false }
      ],
      timestamp: luc.toISOString(),
      footer: { text: 'Thiệp mời Lễ Tốt Nghiệp' }
    }]
  };

  try {
    var response = UrlFetchApp.fetch(webhookUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    var code = response.getResponseCode();
    if (code >= 300) {
      Logger.log('Discord webhook lỗi HTTP ' + code + ': ' + response.getContentText());
      return { ok: false, status: code, error: response.getContentText() };
    }
    Logger.log('Discord webhook đã gửi thành công. HTTP ' + code);
    return { ok: true, status: code };
  } catch (err) {
    Logger.log('Không gửi được Discord webhook: ' + err);
    return { ok: false, error: String(err) };
  }
}

function testDiscordWebhook() {
  var result = sendDiscordNotification(
    'Kiểm tra kết nối',
    'Webhook Discord đã kết nối với Google Apps Script.',
    new Date(),
    'yes',
    'BẢN KIỂM TRA'
  );
  Logger.log(JSON.stringify(result));
  return result;
}

/* ---------------------------------------------------------- *
 * Tiện ích
 * ---------------------------------------------------------- */

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);

  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['Thời gian', 'Tên', 'Lời chúc', 'Hiển thị', 'Tham dự', 'Khách mời']);
    sh.getRange(1, 1, 1, 6).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 160);
    sh.setColumnWidth(2, 160);
    sh.setColumnWidth(3, 460);
    sh.setColumnWidth(5, 120);
    sh.setColumnWidth(6, 180);
  }

  // Bổ sung cột cho các Sheet cũ, kể cả khi getLastColumn() đã tăng do dữ liệu/định dạng.
  if (String(sh.getRange(1, 5).getValue()).trim() !== 'Tham dự') {
    sh.getRange(1, 5).setValue('Tham dự').setFontWeight('bold');
    sh.setColumnWidth(5, 120);
  }
  if (String(sh.getRange(1, 6).getValue()).trim() !== 'Khách mời') {
    sh.getRange(1, 6).setValue('Khách mời').setFontWeight('bold');
    sh.setColumnWidth(6, 180);
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
