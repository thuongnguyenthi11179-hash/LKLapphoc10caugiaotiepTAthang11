// Utility to export Lesson Plans & Student Worksheets to Microsoft Word (.doc)
// and Teacher Dashboard records to Excel (.csv with UTF-8 BOM)

import { PhraseItem, CLASSROOM_PHRASES } from '../data/phrasesData';
import { TeacherRecord } from '../data/teacherStorage';

export interface LessonPlanExportData {
  phrase: PhraseItem;
  grade: string;
  activityTypeLabel: string;
  step1?: string;
  step2?: string;
  step3?: string;
  teacherName?: string;
}

function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Exports a formatted Lesson Plan to a Word-compatible .doc file
 */
export function exportLessonPlanToWord(data: LessonPlanExportData): void {
  const { phrase, grade, activityTypeLabel, step1, step2, step3, teacherName } = data;
  const now = new Date();
  const dateStr = `Đà Nẵng, ngày ${now.getDate().toString().padStart(2, '0')} tháng ${(now.getMonth() + 1).toString().padStart(2, '0')} năm ${now.getFullYear()}`;

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Giáo án Tiếng Anh Tháng 11 - TH Lê Kim Lăng</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.5; color: #111827; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        .header-table td { border: none; text-align: center; vertical-align: top; }
        .content-table th, .content-table td { border: 1px solid #374151; padding: 8px 10px; text-align: left; }
        .content-table th { background-color: #f0fdfa; color: #0f766e; font-weight: bold; }
        h1 { font-size: 16pt; text-align: center; color: #0f766e; text-transform: uppercase; margin: 12px 0 4px 0; }
        h2 { font-size: 14pt; color: #1e3a8a; margin: 14px 0 6px 0; }
        .box { border: 1px solid #0d9488; background-color: #f0fdfa; padding: 10px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <table class="header-table">
        <tr>
          <td style="width: 45%;">
            <strong>UBND PHƯỜNG HÒA XUÂN</strong><br/>
            <strong>TRƯỜNG TIỂU HỌC LÊ KIM LĂNG</strong><br/>
            <span>---o0o---</span>
          </td>
          <td style="width: 55%;">
            <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
            <strong>Độc lập - Tự do - Hạnh phúc</strong><br/>
            <span>---------------</span>
          </td>
        </tr>
      </table>

      <h1>KẾ HOẠCH HOẠT ĐỘNG GIAO TIẾP TIẾNG ANH LỚP HỌC THÁNG 11</h1>
      <p style="text-align: center; font-style: italic; margin-top: 0;">
        Chủ điểm: "10 Classroom Language Sentences for Teachers in November"
      </p>

      <table class="content-table">
        <tr>
          <th style="width: 30%;">Mẫu câu trọng tâm (#${phrase.id})</th>
          <td><strong>${phrase.english}</strong> <em>(${phrase.phonetic})</em></td>
        </tr>
        <tr>
          <th>Ý nghĩa Tiếng Việt</th>
          <td>${phrase.vietnamese}</td>
        </tr>
        <tr>
          <th>Khối lớp & Hình thức</th>
          <td>${grade} · ${activityTypeLabel}</td>
        </tr>
        <tr>
          <th>Tình huống sư phạm</th>
          <td>${phrase.contextVi}</td>
        </tr>
        <tr>
          <th>Động tác phản xạ (TPR)</th>
          <td>${phrase.tprGesture}</td>
        </tr>
      </table>

      <h2>I. MỤC TIÊU & PHÂN TÍCH NGỮ ÂM (BƯỚC 1)</h2>
      <div class="box">
        ${
          step1
            ? step1.replace(/\n/g, '<br/>')
            : `<ul>
                <li>Học sinh hiểu và phản xạ nhanh với khẩu lệnh <strong>"${phrase.english}"</strong> (${phrase.vietnamese}).</li>
                <li>Phát âm chuẩn phiên âm quốc tế IPA: <strong>${phrase.phonetic}</strong>.</li>
                <li>Thực hiện đồng bộ động tác TPR: ${phrase.tprGesture}.</li>
              </ul>`
        }
      </div>

      <h2>II. KỊCH BẢN TỔ CHỨC HOẠT ĐỘNG TƯƠNG TÁC (BƯỚC 2)</h2>
      <div>
        ${
          step2
            ? step2.replace(/\n/g, '<br/>')
            : `<p><strong>1. Làm mẫu (Model & Repeat):</strong> Giáo viên hô to: <em>"${phrase.dialogue.teacher}"</em> (${phrase.dialogue.teacherVi}) kết hợp làm cử chỉ TPR: ${phrase.tprGesture}.</p>
               <p><strong>2. Học sinh phản hồi:</strong> Cả lớp đồng thanh đáp lại: <em>"${phrase.dialogue.students}"</em> (${phrase.dialogue.studentsVi}).</p>
               <p><strong>3. Thi đua phản xạ tổ nhóm:</strong> Giáo viên chia lớp thành 4 tổ, làm động tác không lời để các tổ thi xem tổ nào hô đúng câu tiếng Anh nhanh và rõ nhất.</p>`
        }
      </div>

      <h2>III. VÈ ĐỒNG DAO VỖ TAY & CỦNG CỐ (BƯỚC 3)</h2>
      <div class="box">
        <p><strong>Bài vè vỗ tay nhịp 2/4 (Clapping Chant):</strong> <em>"${phrase.chant}"</em></p>
        ${step3 ? `<p>${step3.replace(/\n/g, '<br/>')}</p>` : ''}
        <p><strong>Mẹo sư phạm:</strong> ${phrase.teacherTip}</p>
      </div>

      <table class="header-table" style="margin-top: 28px;">
        <tr>
          <td style="width: 50%;">
            <strong>TỔ CHUYÊN MÔN DUYỆT</strong><br/>
            <em>(Ký và ghi rõ họ tên)</em>
          </td>
          <td style="width: 50%;">
            <em>${dateStr}</em><br/>
            <strong>GIÁO VIÊN SOẠN BÀI</strong><br/><br/><br/>
            <strong>${teacherName || 'Giáo viên TH Lê Kim Lăng'}</strong>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8'
  });
  triggerFileDownload(blob, `Giao_An_Tieng_Anh_Thang_11_Cau_${phrase.id}_TH_Le_Kim_Lang.doc`);
}

/**
 * Exports a printable A4 Student Worksheet (.doc) covering all 10 Classroom Phrases
 */
export function exportWorksheetToWord(): void {
  const rowsHtml = CLASSROOM_PHRASES.map(
    (p, idx) => `
      <tr>
        <td style="text-align: center;"><strong>${idx + 1}</strong></td>
        <td><strong>${p.english}</strong><br/><em>${p.phonetic}</em></td>
        <td>${p.vietnamese}</td>
        <td>${p.tprGesture}</td>
      </tr>
    `
  ).join('');

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Phiếu Bài Tập 10 Câu Tiếng Anh Tháng 11 - TH Lê Kim Lăng</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12.5pt; line-height: 1.45; color: #111827; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #374151; padding: 6px 8px; }
        th { background-color: #f0fdfa; color: #0f766e; }
        h1 { font-size: 15pt; text-align: center; color: #0f766e; margin-bottom: 4px; }
        h2 { font-size: 13pt; color: #1e3a8a; margin-top: 16px; }
      </style>
    </head>
    <body>
      <p style="text-align: center; font-weight: bold; margin: 0;">
        TRƯỜNG TIỂU HỌC LÊ KIM LĂNG · PHƯỜNG HÒA XUÂN, TP ĐÀ NẴNG
      </p>
      <h1>PHIẾU ÔN TẬP & BÀI TẬP 10 CÂU TIẾNG ANH LỚP HỌC THÁNG 11</h1>
      <p style="text-align: center;">
        Họ và tên: ........................................................................... Lớp: ...................
      </p>

      <h2>PHẦN 1: BẢNG GHI NHỚ 10 MẪU CÂU GIAO TIẾP THÁNG 11</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 8%;">STT</th>
            <th style="width: 32%;">Mẫu câu Tiếng Anh & IPA</th>
            <th style="width: 30%;">Ý nghĩa Tiếng Việt</th>
            <th style="width: 30%;">Động tác phản xạ (TPR)</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <h2>PHẦN 2: BÀI TẬP ĐIỀN TỪ CÒN THIẾU (FILL IN THE BLANKS)</h2>
      <ol>
        <li>Be ........................ to everyone! <em>(Hãy đối xử tốt với mọi người!)</em></li>
        <li>Listen ........................! <em>(Hãy lắng nghe thật chăm chú!)</em></li>
        <li>........................ each other! <em>(Hãy giúp đỡ lẫn nhau!)</em></li>
        <li>Never ........................ up! <em>(Đừng bao giờ bỏ cuộc!)</em></li>
        <li>Do your ........................! <em>(Hãy cố gắng hết sức mình!)</em></li>
        <li>Speak ........................! <em>(Hãy nói bằng Tiếng Anh nào!)</em></li>
        <li>Keep your ........................ clean! <em>(Hãy giữ lớp học sạch đẹp!)</em></li>
        <li>Line up ........................! <em>(Hãy xếp hàng ngay ngắn và giữ trật tự!)</em></li>
        <li>Raise your ........................ to speak! <em>(Hãy giơ tay khi muốn phát biểu!)</em></li>
        <li>Work ........................ happily! <em>(Hãy cùng nhau học tập thật vui vẻ!)</em></li>
      </ol>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8'
  });
  triggerFileDownload(blob, 'Phieu_Bai_Tap_10_Cau_Tieng_Anh_Thang_11_TH_Le_Kim_Lang.doc');
}

/**
 * Exports the Teacher Dashboard records to an Excel-compatible UTF-8 CSV file
 */
export function exportTeachersToCSV(teachers: TeacherRecord[]): void {
  const headers = [
    'STT',
    'Họ và tên giáo viên',
    'Tổ chuyên môn',
    'Số sao thi đua',
    'Kỹ năng Nghe (Listen)',
    'Kỹ năng Nói (Speak)',
    'Kỹ năng Đọc (Read)',
    'Kỹ năng Viết (Write)',
    'Trò chơi (Practice)',
    'Thời gian tham gia',
    'Ghi chú'
  ];

  const escapeCsv = (val: string | number) => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = teachers.map((t, idx) => [
    idx + 1,
    t.name,
    t.role,
    t.stars || 0,
    t.completedSkills?.listen ? 'Đã hoàn thành' : 'Chưa hoàn thành',
    t.completedSkills?.speak ? 'Đã hoàn thành' : 'Chưa hoàn thành',
    t.completedSkills?.read ? 'Đã hoàn thành' : 'Chưa hoàn thành',
    t.completedSkills?.write ? 'Đã hoàn thành' : 'Chưa hoàn thành',
    t.completedSkills?.practice ? 'Đã hoàn thành' : 'Chưa hoàn thành',
    t.joinedAt,
    t.notes || ''
  ]);

  const csvBody = [
    headers.map(escapeCsv).join(','),
    ...rows.map(r => r.map(escapeCsv).join(','))
  ].join('\r\n');

  // Add UTF-8 BOM (\uFEFF) so Microsoft Excel opens Vietnamese characters accurately
  const blob = new Blob(['\uFEFF' + csvBody], {
    type: 'text/csv;charset=utf-8;'
  });
  triggerFileDownload(blob, 'Danh_Sach_Giao_Vien_Tieng_Anh_Thang_11_TH_Le_Kim_Lang.csv');
}
