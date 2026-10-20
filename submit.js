/**
 * ============================================================================
 * 🚀 submit.js : 응답 묶기와 Google Spreadsheet 전송 모듈
 * ============================================================================
 * [선생님을 위한 안내]
 * 이 파일은 학생이 퀴즈를 모두 풀었을 때 결과를 Google Sheets로 전송하는 파일입니다.
 * 
 * 📌 [심화 연수 실습 시 할 일]:
 * 1. 구글 스프레드시트에서 [확장 프로그램] > [Apps Script]를 엽니다.
 * 2. README.md에 적힌 doPost(e) 코드를 붙여넣고 [웹 앱으로 배포]합니다.
 * 3. 발급받은 웹 앱 URL을 바로 아래 'webAppUrl' 따옴표 안에 붙여넣기만 하면 끝!
 * ============================================================================
 */

const GOOGLE_SHEETS_CONFIG = {
  // ⬇️ [심화 연수] 선생님의 Google Apps Script 웹 앱 URL을 여기에 붙여넣으세요!
  // 예: "https://script.google.com/macros/s/AKfycbx.../exec"
  webAppUrl: ""
};

/**
 * 학생의 퀴즈 결과를 Google Apps Script(GAS) 웹 앱으로 전송합니다.
 * URL이 비어 있는 경우 자동으로 Mock(가상) 시뮬레이션 모드로 동작하여 
 * 실습 중에도 전송될 데이터 JSON 구조를 화면에서 직접 확인할 수 있습니다.
 * 
 * @param {Object} resultData - 전송할 결과 데이터 객체
 * @returns {Promise<Object>} 전송 결과 상태
 */
async function sendResultsToSpreadsheet(resultData) {
  console.log("📊 [Google Spreadsheet 연동] 전송 데이터 준비됨:", resultData);

  const statusBox = document.getElementById('gas-status-box');
  const statusTitle = document.getElementById('gas-status-title');
  const statusDesc = document.getElementById('gas-status-desc');
  const gasIcon = document.getElementById('gas-icon');

  const webAppUrl = GOOGLE_SHEETS_CONFIG.webAppUrl ? GOOGLE_SHEETS_CONFIG.webAppUrl.trim() : "";

  // 1. Mock 시뮬레이션 모드 (URL이 입력되지 않은 기본 상태)
  if (!webAppUrl) {
    console.info("💡 [Mock Mode] Google Sheet Web App URL이 설정되지 않아 가상 전송 모드로 기록되었습니다.");
    
    if (statusBox) {
      gasIcon.textContent = "💻";
      statusTitle.textContent = "가상 전송 모드 (연수 실습용)";
      statusDesc.textContent = "클릭하여 Google Sheet로 전달될 JSON 구조를 확인하세요.";
    }
    return { success: true, mode: 'mock', data: resultData };
  }

  // 2. 실제 Google Apps Script 웹앱 전송 모드
  try {
    if (statusBox) {
      gasIcon.textContent = "⏳";
      statusTitle.textContent = "Google 스프레드시트로 전송 중...";
      statusDesc.textContent = "선생님의 시트에 결과가 기록되고 있습니다.";
    }

    // Google Apps Script는 CORS 302 리다이렉트를 수행하므로 mode: 'no-cors'를 적용합니다.
    await fetch(webAppUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(resultData),
      mode: "no-cors"
    });

    if (statusBox) {
      gasIcon.textContent = "✅";
      statusTitle.textContent = "스프레드시트 전송 완료!";
      statusDesc.textContent = "선생님 시트에 학생의 점수가 안전하게 저장되었습니다.";
    }

    return { success: true, mode: 'live' };
  } catch (error) {
    console.error("❌ [Google Sheet 전송 실패]:", error);
    if (statusBox) {
      gasIcon.textContent = "⚠️";
      statusTitle.textContent = "스프레드시트 전송 오류";
      statusDesc.textContent = "인터넷 연결 또는 웹앱 URL을 확인해 주세요.";
    }
    return { success: false, error: error };
  }
}
