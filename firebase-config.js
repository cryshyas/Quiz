/**
 * ==============================================================================
 * 🔥 Firebase 연동 및 오프라인 영속성 설정 (firebase-config.js)
 * ==============================================================================
 * 
 * 💡 [선생님을 위한 안내]
 * 1. Firebase 콘솔(https://console.firebase.google.com)에서 프로젝트를 생성한 뒤,
 *    아래 `firebaseConfig` 객체 안의 값들을 선생님의 프로젝트 정보로 채워 넣으시면 됩니다.
 * 2. 만약 아직 Firebase 설정을 넣지 않았더라도 걱정하지 마세요!
 *    앱이 자동으로 '로컬 오프라인 모드'로 작동하여 모든 퀴즈와 금고를 정상적으로 플레이할 수 있습니다.
 */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

class FirebaseSyncService {
  constructor() {
    this.isInitialized = false;
    this.db = null;
    this.auth = null;
    this.studentNum = null;
    this.isOfflineMode = true;
    this.init();
  }

  init() {
    // 키가 실제 입력되었는지 검사 (기본 템플릿 문구가 아닐 때만 활성화)
    const isConfigValid = firebaseConfig.apiKey && 
      !firebaseConfig.apiKey.startsWith("YOUR_") &&
      typeof firebase !== "undefined";

    if (!isConfigValid) {
      console.log("ℹ️ [Firebase] 설정 키가 없거나 기본 템플릿 상태입니다. 로컬/오프라인 모드로 실행합니다.");
      this.isOfflineMode = true;
      return;
    }

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      this.auth = firebase.auth();
      this.db = firebase.firestore();

      // 오프라인 영속성 활성화 (학교 와이파이가 일시적으로 끊겨도 끊김 없는 풀이 지원)
      this.db.enablePersistence({ synchronizeTabs: true })
        .catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn("⚠️ [Firestore] 여러 탭이 열려 있어 오프라인 캐시가 단일 탭으로 제한됩니다.");
          } else if (err.code === 'unimplemented') {
            console.warn("⚠️ [Firestore] 현재 브라우저 환경에서는 인덱스DB 캐시를 지원하지 않습니다.");
          }
        });

      // 익명 로그인 자동 수행 (학생들이 로그인할 필요 없이 즉시 접속)
      this.auth.signInAnonymously()
        .then(() => {
          console.log("✅ [Firebase] 익명 인증 및 Firestore 연결 완료!");
          this.isOfflineMode = false;
        })
        .catch((err) => {
          console.warn("⚠️ [Firebase] 익명 인증 실패 (로컬 모드 유지):", err.message);
          this.isOfflineMode = true;
        });

      this.isInitialized = true;
    } catch (err) {
      console.warn("⚠️ [Firebase] 초기화 중 예외 발생 (로컬 모드로 진행):", err);
      this.isOfflineMode = true;
    }
  }

  setStudentNumber(num) {
    this.studentNum = num;
  }

  // 1. 학생 세트 클리어 기록 전송
  async recordSetClear(studentNum, caseCode, keyLetter) {
    if (!studentNum) return;
    const num = parseInt(studentNum, 10);
    const docId = `student_${String(num).padStart(2, "0")}`;

    // 로컬 스토리지에 백업 저장
    const localCleared = JSON.parse(localStorage.getItem(`student_${num}_cleared`) || "[]");
    if (!localCleared.includes(caseCode)) {
      localCleared.push(caseCode);
      localStorage.setItem(`student_${num}_cleared`, JSON.stringify(localCleared));
    }

    if (this.isOfflineMode || !this.db) {
      console.log(`[LocalSync] 학생 #${num} 세트 [${caseCode}] 클리어 저장 완료`);
      return;
    }

    try {
      const studentRef = this.db.collection("students").doc(docId);
      await studentRef.set({
        studentNum: num,
        clearedSets: firebase.firestore.FieldValue.arrayUnion(caseCode),
        keys: firebase.firestore.FieldValue.arrayUnion(keyLetter),
        lastActive: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn("⚠️ 클리어 기록 전송 중 오류 (오프라인 큐 대기):", err);
    }
  }

  // 2. 문항 오답 발생 기록 전송
  async recordMistake(questionId) {
    // 로컬 스토리지에 오답 카운트 누적
    const localMistakes = JSON.parse(localStorage.getItem("quiz_mistakes_stats") || "{}");
    localMistakes[questionId] = (localMistakes[questionId] || 0) + 1;
    localStorage.setItem("quiz_mistakes_stats", JSON.stringify(localMistakes));

    if (this.isOfflineMode || !this.db) {
      return;
    }

    try {
      const statsRef = this.db.collection("stats").doc("question_mistakes");
      await statsRef.set({
        [questionId]: firebase.firestore.FieldValue.increment(1),
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn("⚠️ 오답 기록 전송 중 오류:", err);
    }
  }

  // 3. 최종 금고 오픈 기록 전송
  async recordVaultUnlocked(studentNum) {
    if (!studentNum) return;
    const num = parseInt(studentNum, 10);
    const docId = `student_${String(num).padStart(2, "0")}`;

    localStorage.setItem(`student_${num}_vault`, "true");

    if (this.isOfflineMode || !this.db) {
      console.log(`[LocalSync] 학생 #${num} 최종 금고 잠금 해제 기록 완료`);
      return;
    }

    try {
      const studentRef = this.db.collection("students").doc(docId);
      await studentRef.set({
        vaultUnlocked: true,
        vaultTime: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn("⚠️ 금고 오픈 기록 전송 중 오류:", err);
    }
  }

  // 4. 교사용 실시간 리스너 구독 (학생 현황)
  subscribeStudents(callback) {
    if (this.isOfflineMode || !this.db) {
      // 로컬 스토리지 데이터 폴링으로 시뮬레이션
      const readLocal = () => {
        const list = [];
        for (let i = 1; i <= 21; i++) {
          const cleared = JSON.parse(localStorage.getItem(`student_${i}_cleared`) || "[]");
          const vault = localStorage.getItem(`student_${i}_vault`) === "true";
          list.push({
            studentNum: i,
            clearedSets: cleared,
            vaultUnlocked: vault
          });
        }
        callback(list);
      };
      readLocal();
      const interval = setInterval(readLocal, 2000);
      return () => clearInterval(interval);
    }

    return this.db.collection("students").onSnapshot((snapshot) => {
      const studentsMap = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        studentsMap[data.studentNum] = data;
      });

      const fullList = [];
      for (let i = 1; i <= 21; i++) {
        fullList.push(studentsMap[i] || {
          studentNum: i,
          clearedSets: [],
          vaultUnlocked: false
        });
      }
      callback(fullList);
    }, (err) => {
      console.warn("⚠️ 학생 실시간 구독 오류:", err);
    });
  }

  // 5. 교사용 실시간 리스너 구독 (오답 통계)
  subscribeMistakes(callback) {
    if (this.isOfflineMode || !this.db) {
      const readLocal = () => {
        const stats = JSON.parse(localStorage.getItem("quiz_mistakes_stats") || "{}");
        callback(stats);
      };
      readLocal();
      const interval = setInterval(readLocal, 2000);
      return () => clearInterval(interval);
    }

    return this.db.collection("stats").doc("question_mistakes").onSnapshot((doc) => {
      if (doc.exists) {
        callback(doc.data() || {});
      } else {
        callback({});
      }
    }, (err) => {
      console.warn("⚠️ 오답 통계 구독 오류:", err);
    });
  }

  // 6. 교사용 리허설 활동 초기화
  async resetAllData() {
    // 로컬 스토리지 초기화
    for (let i = 1; i <= 21; i++) {
      localStorage.removeItem(`student_${i}_cleared`);
      localStorage.removeItem(`student_${i}_vault`);
    }
    localStorage.removeItem("quiz_mistakes_stats");

    if (this.isOfflineMode || !this.db) {
      console.log("✅ [LocalSync] 로컬 데이터 전체 초기화 완료");
      return true;
    }

    try {
      const batch = this.db.batch();
      
      // 학생 데이터 21명 초기화
      for (let i = 1; i <= 21; i++) {
        const docId = `student_${String(i).padStart(2, "0")}`;
        const ref = this.db.collection("students").doc(docId);
        batch.delete(ref);
      }

      // 통계 초기화
      const statsRef = this.db.collection("stats").doc("question_mistakes");
      batch.delete(statsRef);

      await batch.commit();
      console.log("✅ [Firebase] Firestore 데이터 전체 초기화 완료");
      return true;
    } catch (err) {
      console.error("❌ 초기화 중 오류:", err);
      throw err;
    }
  }
}

// 전역 인스턴스 생성
window.fbService = new FirebaseSyncService();
