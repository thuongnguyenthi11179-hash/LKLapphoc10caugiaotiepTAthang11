import imgKindness from '../assets/images/classroom_kindness_helping_1793525300569.jpg';
import imgListenSpeak from '../assets/images/classroom_listen_speak_1793525301298.jpg';
import imgTeamworkCleanup from '../assets/images/classroom_teamwork_cleanup_1793525301405.jpg';

export interface PhraseWord {
  word: string;
  phonetic: string;
  meaning: string;
}

export interface PhraseItem {
  id: number;
  english: string;
  phonetic: string;
  vietnamese: string;
  category: 'Văn hóa lớp học' | 'Nề nếp kỷ luật' | 'Động lực & Tinh thần' | 'Giao tiếp tiếng Anh';
  categoryEn: string;
  themeColor: string;
  accentBg: string;
  contextVi: string;
  contextEn: string;
  dialogue: {
    teacher: string;
    teacherVi: string;
    students: string;
    studentsVi: string;
  };
  wordsBreakdown: PhraseWord[];
  teacherTip: string;
  tprGesture: string; // Total Physical Response body language for primary kids
  chant: string;
  image: string;
  audioKey: string;
}

export const CLASSROOM_PHRASES: PhraseItem[] = [
  {
    id: 1,
    english: "Be kind to everyone!",
    phonetic: "/biː kaɪnd tuː ˈevriwʌn/",
    vietnamese: "Hãy đối xử tốt và chan hòa với tất cả mọi người!",
    category: "Văn hóa lớp học",
    categoryEn: "Class Culture",
    themeColor: "from-rose-500 to-pink-600",
    accentBg: "bg-rose-50 text-rose-700 border-rose-200",
    contextVi: "Giáo viên nhắc nhở vào đầu tuần, đầu buổi học hoặc khi học sinh cùng chơi, chia sẻ đồ dùng học tập.",
    contextEn: "Reminder at the start of class or when students share school supplies.",
    dialogue: {
      teacher: "Remember class, be kind to everyone!",
      teacherVi: "Các em hãy nhớ luôn chan hòa và yêu thương mọi người nhé!",
      students: "Yes, Teacher! We will be kind friends!",
      studentsVi: "Vâng ạ, chúng em sẽ là những người bạn tốt!"
    },
    wordsBreakdown: [
      { word: "Be", phonetic: "/biː/", meaning: "Hãy, là (thì, là, ở)" },
      { word: "kind", phonetic: "/kaɪnd/", meaning: "tử tế, nhân hậu, tốt bụng" },
      { word: "to", phonetic: "/tuː/", meaning: "với, đối với" },
      { word: "everyone", phonetic: "/ˈevriwʌn/", meaning: "tất cả mọi người" }
    ],
    teacherTip: "Thầy cô có thể hướng dẫn học sinh mỉm cười và đặt hai tay lên tim khi đọc câu này để tạo cảm xúc ấm áp.",
    tprGesture: "Đặt hai bàn tay lên ngực trái (trái tim) và mỉm cười với bạn bên cạnh.",
    chant: "Be kind, be kind, to everyone! / Learning together is so much fun!",
    image: imgKindness,
    audioKey: "be-kind-to-everyone"
  },
  {
    id: 2,
    english: "Listen carefully",
    phonetic: "/ˈlɪsn ˈkeəfəli/",
    vietnamese: "Hãy lắng nghe thật chăm chú!",
    category: "Nề nếp kỷ luật",
    categoryEn: "Discipline",
    themeColor: "from-sky-500 to-blue-600",
    accentBg: "bg-sky-50 text-sky-700 border-sky-200",
    contextVi: "Dùng trước khi giáo viên hướng dẫn nội dung bài mới, giải thích bài tập hoặc luật chơi trò chơi.",
    contextEn: "Used before explaining rules, instructions, or new lesson content.",
    dialogue: {
      teacher: "Eyes on me, and listen carefully!",
      teacherVi: "Mắt hướng lên cô, và lắng nghe thật chăm chú nào!",
      students: "Eyes on you, ears open wide!",
      studentsVi: "Mắt nhìn cô, tai lắng nghe rõ!"
    },
    wordsBreakdown: [
      { word: "Listen", phonetic: "/ˈlɪsn/", meaning: "lắng nghe (âm 't' câm)" },
      { word: "carefully", phonetic: "/ˈkeəfəli/", meaning: "cẩn thận, chú ý, chăm chú" }
    ],
    teacherTip: "Dạy âm câm chữ 't' trong từ 'Listen'. Thầy cô làm hiệu ứng '1-2-3, Eyes on me!' để cả lớp đáp lại '1-2, Eyes on you!'.",
    tprGesture: "Đưa một tay khum sau vành tai và hướng đầu về phía người nói.",
    chant: "Listen, listen, carefully! / 1, 2, 3, look at me!",
    image: imgListenSpeak,
    audioKey: "listen-carefully"
  },
  {
    id: 3,
    english: "Help each other!",
    phonetic: "/help iːtʃ ˈʌðə(r)/",
    vietnamese: "Hãy tương trợ và giúp đỡ lẫn nhau!",
    category: "Văn hóa lớp học",
    categoryEn: "Class Culture",
    themeColor: "from-amber-500 to-orange-600",
    accentBg: "bg-amber-50 text-amber-700 border-amber-200",
    contextVi: "Khi học sinh làm việc theo cặp (pair-work), thảo luận nhóm, hoặc khi thấy bạn bên cạnh chưa hiểu bài.",
    contextEn: "During pair-work, group discussions, or when someone needs assistance.",
    dialogue: {
      teacher: "Work in pairs and help each other!",
      teacherVi: "Các em hãy thực hành theo cặp và giúp đỡ nhau nhé!",
      students: "Yes, Teacher! We help and share!",
      studentsVi: "Vâng ạ, chúng em sẽ giúp đỡ và chia sẻ cùng nhau!"
    },
    wordsBreakdown: [
      { word: "Help", phonetic: "/help/", meaning: "giúp đỡ, trợ giúp" },
      { word: "each other", phonetic: "/iːtʃ ˈʌðə(r)/", meaning: "lẫn nhau, với nhau" }
    ],
    teacherTip: "Khuyến khích bạn học giỏi kèm bạn còn chậm hơn để xây dựng tinh thần đoàn kết tại trường TH Lê Kim Lăng.",
    tprGesture: "Hai bàn tay nắm lại với nhau hoặc hướng lòng bàn tay mở ra mời bạn.",
    chant: "You and me, help each other! / Happy sister, happy brother!",
    image: imgKindness,
    audioKey: "help-each-other"
  },
  {
    id: 4,
    english: "Never give up!",
    phonetic: "/ˈnevə ɡɪv ʌp/",
    vietnamese: "Đừng bao giờ bỏ cuộc! Hãy kiên trì cố gắng!",
    category: "Động lực & Tinh thần",
    categoryEn: "Motivation",
    themeColor: "from-indigo-500 to-purple-600",
    accentBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    contextVi: "Khích lệ khi học sinh gặp bài toán khó, từ vựng mới khó nhớ hoặc làm bài thi đua chưa đạt kết quả cao.",
    contextEn: "Encouraging students when facing difficult tasks or challenging exercises.",
    dialogue: {
      teacher: "It's tricky, but never give up!",
      teacherVi: "Bài này hơi thử thách đấy, nhưng các em đừng nản lòng nhé!",
      students: "We can do it! Never give up!",
      studentsVi: "Chúng em làm được! Quyết không bỏ cuộc!"
    },
    wordsBreakdown: [
      { word: "Never", phonetic: "/ˈnevə(r)/", meaning: "không bao giờ" },
      { word: "give up", phonetic: "/ɡɪv ʌp/", meaning: "từ bỏ, bỏ cuộc (cụm động từ)" }
    ],
    teacherTip: "Nhắc nhở học sinh nối âm giữa 'give' và 'up' thành /ɡɪ'vʌp/.",
    tprGesture: "Nắm chặt bàn tay thành nắm đấm và giơ lên phía trước thể hiện quyết tâm.",
    chant: "Never give up, try, try, try! / Reach your dreams up to the sky!",
    image: imgKindness,
    audioKey: "never-give-up"
  },
  {
    id: 5,
    english: "Do your best!",
    phonetic: "/duː jɔːr best/",
    vietnamese: "Hãy nỗ lực hết sức mình nhé!",
    category: "Động lực & Tinh thần",
    categoryEn: "Motivation",
    themeColor: "from-emerald-500 to-teal-600",
    accentBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    contextVi: "Lời chúc và hiệu lệnh trước bài kiểm tra, bài thi nói tiếng Anh, hoặc trước khi bắt đầu trò chơi thi đua.",
    contextEn: "Cheering students before exams, speaking presentations, or competitions.",
    dialogue: {
      teacher: "Ready for the quiz? Do your best!",
      teacherVi: "Các em đã sẵn sàng làm bài chưa? Hãy cố gắng hết sức nhé!",
      students: "We will do our best! Yes!",
      studentsVi: "Chúng em sẽ làm hết sức mình! Dạ sẵn sàng!"
    },
    wordsBreakdown: [
      { word: "Do", phonetic: "/duː/", meaning: "làm, thực hiện" },
      { word: "your", phonetic: "/jɔː(r)/", meaning: "của bạn, của các em" },
      { word: "best", phonetic: "/best/", meaning: "tốt nhất, nỗ lực cao nhất" }
    ],
    teacherTip: "Nhấn mạnh âm đuôi /st/ trong từ 'best'. Kết hợp khen ngợi sự tiến bộ cá nhân thay vì chỉ chú trọng điểm số.",
    tprGesture: "Giơ ngón tay cái 'Like' (Thumb up) và gật đầu tự tin.",
    chant: "Do your best, shine so bright! / Every answer will be right!",
    image: imgListenSpeak,
    audioKey: "do-your-best"
  },
  {
    id: 6,
    english: "Speak English!",
    phonetic: "/spiːk ˈɪŋɡlɪʃ/",
    vietnamese: "Hãy nói bằng Tiếng Anh nào!",
    category: "Giao tiếp tiếng Anh",
    categoryEn: "Communication",
    themeColor: "from-violet-500 to-fuchsia-600",
    accentBg: "bg-violet-50 text-violet-700 border-violet-200",
    contextVi: "Nhắc nhở học sinh sử dụng tiếng Anh trong giờ học ngoại ngữ, giờ sinh hoạt CLB Tiếng Anh trường TH Lê Kim Lăng.",
    contextEn: "Encouraging students to practice target language during English lessons and clubs.",
    dialogue: {
      teacher: "English time! Please speak English!",
      teacherVi: "Đến giờ Tiếng Anh rồi! Các em hãy nói bằng Tiếng Anh nào!",
      students: "Yes, Teacher! Hello, good morning!",
      studentsVi: "Vâng thưa cô! Xin chào cô, chúc cô buổi sáng tốt lành!"
    },
    wordsBreakdown: [
      { word: "Speak", phonetic: "/spiːk/", meaning: "nói, phát âm" },
      { word: "English", phonetic: "/ˈɪŋɡlɪʃ/", meaning: "tiếng Anh (chú ý âm đuôi /ʃ/ cong môi)" }
    ],
    teacherTip: "Luyện âm đuôi /ʃ/ của 'English' (cong môi thổi hơi). Giáo viên có thể giơ bảng cờ Anh hoặc vẫy tay khẩu lệnh.",
    tprGesture: "Chỉ tay vào môi rồi mở lòng bàn tay hướng về phía các bạn để mời nói.",
    chant: "Speak English, 1, 2, 3! / Speak English, you and me!",
    image: imgListenSpeak,
    audioKey: "speak-english"
  },
  {
    id: 7,
    english: "Keep your classroom clean!",
    phonetic: "/kiːp jɔːr ˈklɑːsruːm kliːn/",
    vietnamese: "Hãy giữ gìn lớp học luôn sạch sẽ và ngăn nắp!",
    category: "Nề nếp kỷ luật",
    categoryEn: "Discipline",
    themeColor: "from-teal-500 to-emerald-600",
    accentBg: "bg-teal-50 text-teal-700 border-teal-200",
    contextVi: "Sau các tiết học thủ công, vẽ tranh, xé dán hoặc trước giờ ra về để xây dựng nề nếp trường học xanh - sạch - đẹp.",
    contextEn: "After craft/art sessions or at dismissal to keep desks and floor tidy.",
    dialogue: {
      teacher: "Put paper in the bin! Keep your classroom clean!",
      teacherVi: "Bỏ giấy vào thùng rác nào! Hãy giữ lớp học thật sạch đẹp!",
      students: "Clean desks, clean floor, ready to go!",
      studentsVi: "Bàn sạch, sàn sạch, sẵn sàng về nhà!"
    },
    wordsBreakdown: [
      { word: "Keep", phonetic: "/kiːp/", meaning: "giữ gìn, duy trì" },
      { word: "your", phonetic: "/jɔː(r)/", meaning: "của các em" },
      { word: "classroom", phonetic: "/ˈklɑːsruːm/", meaning: "phòng học, lớp học" },
      { word: "clean", phonetic: "/kliːn/", meaning: "sạch sẽ, ngăn nắp" }
    ],
    teacherTip: "Luyện phát âm phụ âm đôi 'cl' /kl/ trong cả hai từ 'classroom' và 'clean'. Tạo thói quen 1 phút dọn bàn trước khi ra về.",
    tprGesture: "Làm động tác quét nhẹ tay trên mặt bàn thu dọn đồ dùng.",
    chant: "Clean, clean, clean and green! / The cleanest classroom ever seen!",
    image: imgTeamworkCleanup,
    audioKey: "keep-your-classroom-clean"
  },
  {
    id: 8,
    english: "Line up quietly!",
    phonetic: "/laɪn ʌp ˈkwaɪətli/",
    vietnamese: "Hãy xếp hàng ngay ngắn và giữ trật tự!",
    category: "Nề nếp kỷ luật",
    categoryEn: "Discipline",
    themeColor: "from-blue-600 to-indigo-700",
    accentBg: "bg-blue-50 text-blue-700 border-blue-200",
    contextVi: "Khi di chuyển xuống sân chào cờ, sang phòng Tin học/Ngoại ngữ, thư viện, hoặc khi xếp hàng ra về.",
    contextEn: "When moving to the school yard, library, computer lab, or lining up for dismissal.",
    dialogue: {
      teacher: "Bell rings! Stand up and line up quietly!",
      teacherVi: "Chuông reo rồi! Cả lớp đứng lên và xếp hàng trật tự nào!",
      students: "Zip your lip, straight in line!",
      studentsVi: "Khép miệng lại, xếp hàng thật thẳng!"
    },
    wordsBreakdown: [
      { word: "Line up", phonetic: "/laɪn ʌp/", meaning: "xếp thành hàng (nối âm: /laɪ'nʌp/)" },
      { word: "quietly", phonetic: "/ˈkwaɪətli/", meaning: "yên lặng, trật tự, không ồn ào" }
    ],
    teacherTip: "Nối âm 'Line up' -> /laɪ'nʌp/. Giáo viên có thể kèm động tác ngón trỏ đặt nhẹ lên môi ra hiệu 'suỵt'.",
    tprGesture: "Đặt ngón trỏ nhẹ lên môi (suỵt) và chỉ tay thẳng hướng về phía trước theo hàng.",
    chant: "Line up, line up, 1, 2, 3! / Walk so quietly, follow me!",
    image: imgTeamworkCleanup,
    audioKey: "line-up-quietly"
  },
  {
    id: 9,
    english: "Raise your hands to speak!",
    phonetic: "/reɪz jɔːr hændz tuː spiːk/",
    vietnamese: "Hãy giơ tay khi muốn phát biểu ý kiến!",
    category: "Nề nếp kỷ luật",
    categoryEn: "Discipline",
    themeColor: "from-cyan-500 to-blue-600",
    accentBg: "bg-cyan-50 text-cyan-700 border-cyan-200",
    contextVi: "Khi học sinh nói tự do, chen ngang hoặc giáo viên đưa ra câu hỏi cần các em xung phong trả lời.",
    contextEn: "When asking questions to encourage disciplined participation without shouting.",
    dialogue: {
      teacher: "Who knows the answer? Raise your hands to speak!",
      teacherVi: "Ai biết câu trả lời nào? Hãy giơ tay phát biểu nhé!",
      students: "Teacher, Teacher, pick me please!",
      studentsVi: "Thưa cô, thưa cô, cho em trả lời ạ!"
    },
    wordsBreakdown: [
      { word: "Raise", phonetic: "/reɪz/", meaning: "giơ lên, nâng lên" },
      { word: "hands", phonetic: "/hændz/", meaning: "những bàn tay (số nhiều)" },
      { word: "to", phonetic: "/tuː/", meaning: "để" },
      { word: "speak", phonetic: "/spiːk/", meaning: "nói, phát biểu" }
    ],
    teacherTip: "Nhắc nhở học sinh giơ tay tay phải thẳng, lưng thẳng, không vẫy ồn ào để rèn tác phong chỉn chu.",
    tprGesture: "Giơ thẳng cánh tay phải lên cao, bàn tay mở hướng lên trần nhà.",
    chant: "Raise your hand, wait your turn! / That is how we happily learn!",
    image: imgListenSpeak,
    audioKey: "raise-your-hands-to-speak"
  },
  {
    id: 10,
    english: "Work together happily!",
    phonetic: "/wɜːk təˈɡeðə ˈhæpɪli/",
    vietnamese: "Hãy cùng nhau học tập thật vui tươi và đoàn kết!",
    category: "Văn hóa lớp học",
    categoryEn: "Class Culture",
    themeColor: "from-emerald-600 to-green-700",
    accentBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    contextVi: "Trong các hoạt động đóng vai, dự án nhóm nhỏ, thi đua giữa các tổ trong lớp học.",
    contextEn: "During group projects, role-play activities, or team competitions.",
    dialogue: {
      teacher: "It's group work time! Work together happily!",
      teacherVi: "Đã đến giờ sinh hoạt nhóm rồi! Hãy cùng làm việc thật vui vẻ nhé!",
      students: "Together we learn, together we smile!",
      studentsVi: "Cùng nhau học tập, cùng nhau nở nụ cười!"
    },
    wordsBreakdown: [
      { word: "Work", phonetic: "/wɜːk/", meaning: "làm việc, học tập" },
      { word: "together", phonetic: "/təˈɡeðə(r)/", meaning: "cùng nhau, chung sức" },
      { word: "happily", phonetic: "/ˈhæpɪli/", meaning: "một cách vui vẻ, hạnh phúc" }
    ],
    teacherTip: "Nhấn trọng âm từ 'toGEther' và 'HAPpily'. Kết thúc tiết học với lời khen ngợi tinh thần làm việc nhóm.",
    tprGesture: "Hai tay đưa sang hai bên vẫy nhẹ chào các bạn trong nhóm với nụ cười tươi.",
    chant: "Work together, hand in hand! / Happiest class in all the land!",
    image: imgKindness,
    audioKey: "work-together-happily"
  }
];

export interface QuizQuestion {
  id: number;
  type: 'listen' | 'translate' | 'situation' | 'scramble';
  promptVi: string;
  targetPhraseId: number;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    type: 'situation',
    promptVi: "Khi học sinh làm xong bài vẽ xé dán và trên sàn còn nhiều mẩu giấy vụn, cô giáo trường TH Lê Kim Lăng nên dùng câu lệnh tiếng Anh nào?",
    targetPhraseId: 7,
    options: [
      "Keep your classroom clean!",
      "Listen carefully",
      "Line up quietly!",
      "Raise your hands to speak!"
    ],
    correctAnswer: "Keep your classroom clean!",
    explanation: "'Keep your classroom clean!' nghĩa là 'Hãy giữ lớp học luôn sạch sẽ và ngăn nắp!'."
  },
  {
    id: 2,
    type: 'listen',
    promptVi: "Bấm nghe âm thanh và chọn câu khẩu lệnh chính xác:",
    targetPhraseId: 2,
    options: [
      "Listen carefully",
      "Never give up!",
      "Line up quietly!",
      "Do your best!"
    ],
    correctAnswer: "Listen carefully",
    explanation: "'Listen carefully' là khẩu lệnh yêu cầu lắng nghe chăm chú."
  },
  {
    id: 3,
    type: 'situation',
    promptVi: "Trước khi cả lớp bước vào bài thi hoặc trò chơi đua điểm số, thầy cô hô vang câu khẩu lệnh nào để động viên?",
    targetPhraseId: 5,
    options: [
      "Do your best!",
      "Line up quietly!",
      "Help each other!",
      "Be kind to everyone!"
    ],
    correctAnswer: "Do your best!",
    explanation: "'Do your best!' nghĩa là 'Hãy cố gắng hết sức mình nhé!'."
  },
  {
    id: 4,
    type: 'translate',
    promptVi: "Câu nào sau đây có nghĩa là 'Hãy xếp hàng ngay ngắn và giữ trật tự!'?",
    targetPhraseId: 8,
    options: [
      "Line up quietly!",
      "Raise your hands to speak!",
      "Speak English!",
      "Keep your classroom clean!"
    ],
    correctAnswer: "Line up quietly!",
    explanation: "'Line up quietly!' dùng khi học sinh xếp hàng di chuyển hoặc ra về."
  },
  {
    id: 5,
    type: 'situation',
    promptVi: "Khi các bạn tranh nhau nói tự do trong lớp, cô giáo muốn nhắc các em giữ nếp giơ tay phát biểu thì nói câu gì?",
    targetPhraseId: 9,
    options: [
      "Raise your hands to speak!",
      "Speak English!",
      "Work together happily!",
      "Never give up!"
    ],
    correctAnswer: "Raise your hands to speak!",
    explanation: "'Raise your hands to speak!' rèn luyện nếp giơ tay xin phép trước khi nói."
  },
  {
    id: 6,
    type: 'translate',
    promptVi: "Câu 'Never give up!' mang ý nghĩa gì trong lớp học?",
    targetPhraseId: 4,
    options: [
      "Đừng bao giờ bỏ cuộc! Cố lên nhé!",
      "Hãy giữ lớp học sạch đẹp!",
      "Hãy đối xử tốt với mọi người!",
      "Cùng nhau học tập thật vui vẻ!"
    ],
    correctAnswer: "Đừng bao giờ bỏ cuộc! Cố lên nhé!",
    explanation: "'Never give up!' là lời khích lệ sự bền bỉ, kiên trì của học sinh."
  }
];
