/**
 * CMAC – Nhận yêu cầu tư vấn từ website (https://cmacvn.github.io)
 *
 * Mỗi yêu cầu khách gửi từ form "Gửi yêu cầu trao đổi" sẽ:
 *   1. Ghi thành một dòng trong trang tính "Yêu cầu tư vấn" của Google Sheet này.
 *   2. Gửi email báo về NOTIFY_EMAIL.
 *
 * Cài đặt: xem file HUONG-DAN-FORM.md trong thư mục website.
 */

const NOTIFY_EMAIL = "Ceo.cmac@gmail.com";
const SHEET_NAME = "Yêu cầu tư vấn";
const HEADERS = [
  "Thời gian", "Họ và tên", "Số điện thoại", "Email", "Doanh nghiệp",
  "Chức danh", "Quan tâm", "Tình hình hiện tại", "Trạng thái", "Ghi chú CMAC",
];
const MAX_LEN = 2000;

/** Chạy 1 lần trong trình soạn thảo để tạo trang tính và cấp quyền. */
function setup() {
  getSheet_();
  MailApp.getRemainingDailyQuota();
  Logger.log("Đã sẵn sàng. Trang tính: " + SHEET_NAME);
}

/** Mở URL Web App trên trình duyệt để kiểm tra script đang chạy. */
function doGet() {
  return json_({ ok: true, message: "CMAC form endpoint đang hoạt động." });
}

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};

    // Bẫy spam: ô "website" bị ẩn với người thật, chỉ bot mới điền.
    if (p.website) return json_({ ok: true });

    const data = {
      name: clean_(p.name),
      phone: clean_(p.phone),
      email: clean_(p.email),
      company: clean_(p.company),
      role: clean_(p.role),
      need: clean_(p.need),
      msg: clean_(p.msg),
    };

    const digits = data.phone.replace(/\D/g, "");
    if (!data.name || digits.length < 9 || digits.length > 11) {
      return json_({ ok: false, error: "Thiếu họ tên hoặc số điện thoại không hợp lệ." });
    }
    if (p.consent !== "yes") {
      return json_({ ok: false, error: "Khách chưa đồng ý cho CMAC sử dụng thông tin." });
    }

    // Chặn gửi trùng cùng một số điện thoại trong 2 phút.
    const cache = CacheService.getScriptCache();
    if (cache.get("p_" + digits)) return json_({ ok: true, duplicate: true });
    cache.put("p_" + digits, "1", 120);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      getSheet_().appendRow([
        new Date(), safe_(data.name), "'" + data.phone, safe_(data.email), safe_(data.company),
        safe_(data.role), safe_(data.need), safe_(data.msg), "Mới", "",
      ]);
    } finally {
      lock.releaseLock();
    }

    notify_(data);
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: "Lỗi hệ thống, vui lòng liên hệ qua Zalo hoặc điện thoại." });
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME, 0);
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight("bold").setBackground("#1B2A41").setFontColor("#F5F1EC");
    sh.setFrozenRows(1);
    sh.getRange("A:A").setNumberFormat("dd/MM/yyyy HH:mm");
    sh.setColumnWidths(1, HEADERS.length, 160);
    sh.setColumnWidth(8, 360);
  }
  return sh;
}

function notify_(d) {
  const sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  const rows = [
    ["Họ và tên", d.name], ["Số điện thoại", d.phone], ["Email", d.email],
    ["Doanh nghiệp", d.company], ["Chức danh", d.role], ["Quan tâm", d.need],
    ["Tình hình hiện tại", d.msg],
  ].filter((r) => r[1]);

  const html =
    '<div style="font-family:Arial,sans-serif;color:#333;max-width:560px">' +
    '<h2 style="color:#1B2A41;margin:0 0 4px">Yêu cầu tư vấn mới từ website</h2>' +
    '<p style="color:#8C654A;margin:0 0 16px">' + Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "HH:mm dd/MM/yyyy") + "</p>" +
    '<table style="border-collapse:collapse;width:100%">' +
    rows.map((r) =>
      '<tr><td style="padding:8px;border-bottom:1px solid #DDD3C8;color:#6B6B6B;width:140px;vertical-align:top">' + r[0] +
      '</td><td style="padding:8px;border-bottom:1px solid #DDD3C8;white-space:pre-wrap">' + escape_(r[1]) + "</td></tr>"
    ).join("") +
    "</table>" +
    '<p style="margin-top:16px"><a href="' + sheetUrl + '" style="color:#8C654A">Mở danh sách yêu cầu</a></p>' +
    "</div>";

  const opts = { to: NOTIFY_EMAIL, subject: "[CMAC Website] " + d.name + " – " + (d.need || "Yêu cầu tư vấn"), htmlBody: html, name: "CMAC Website" };
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) opts.replyTo = d.email;
  MailApp.sendEmail(opts);
}

function clean_(v) {
  return String(v == null ? "" : v).trim().slice(0, MAX_LEN);
}

// Tránh công thức độc hại khi mở bằng Sheets/Excel.
function safe_(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function escape_(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
