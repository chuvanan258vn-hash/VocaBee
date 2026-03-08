const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

const sampleCards = [
    {
        "card_type": 1,
        "grammar_category": "Relative Clauses",
        "front_side": "The architect ________ designed the new headquarters received an international award.\n(who / whom / whose / which)",
        "expected_input": "who",
        "back_side": "✅ Đáp án: **who**\n\n📐 Công thức: S + [who + V + O] + Main Verb\n\n💡 'who' thay thế cho chủ ngữ (người) trong mệnh đề quan hệ. Sau 'who' là động từ 'designed' → đây là Relative Pronoun làm Subject.",
        "hint": "Đại từ quan hệ nào thay thế cho chủ ngữ chỉ người?"
    },
    {
        "card_type": 1,
        "grammar_category": "Relative Clauses",
        "front_side": "The report ________ was submitted last Friday contained several errors.\n(who / which / whom / whose)",
        "expected_input": "which",
        "back_side": "✅ Đáp án: **which**\n\n📐 Công thức: N (vật) + [which + V + ...] + Main Verb\n\n💡 'which' thay thế cho danh từ chỉ vật ('The report'). Sau 'which' là 'was submitted' → làm Subject trong mệnh đề.",
        "hint": "Danh từ 'report' là người hay vật?"
    },
    {
        "card_type": 1,
        "grammar_category": "Relative Clauses",
        "front_side": "Ms. Park, ________ expertise in data analysis is widely recognized, will lead the project.\n(who / whom / whose / that)",
        "expected_input": "whose",
        "back_side": "✅ Đáp án: **whose**\n\n📐 Công thức: N (người/vật) + [whose + N + V + ...]\n\n💡 'whose' = sở hữu. Sau 'whose' luôn là một DANH TỪ ('expertise'). Dấu hiệu nhận biết: _____ + Noun.",
        "hint": "Sau chỗ trống là danh từ 'expertise' → cần đại từ chỉ sở hữu."
    },
    {
        "card_type": 2,
        "grammar_category": "Relative Clauses",
        "front_side": "📖 Phân tích câu sau:\n\n\"The employees who completed the training program will receive a certificate of achievement.\"\n\n❓ Nhiệm vụ: Xác định MỆNH ĐỀ QUAN HỆ trong câu.",
        "expected_input": "who completed the training program",
        "back_side": "🧩 Sơ đồ phân tích:\n\n• **Subject**: The employees\n• **Relative Clause**: 👉 who completed the training program\n• **Main Verb**: will receive\n• **Object**: a certificate of achievement\n\n📐 Cấu trúc: S + [Relative Clause] + V + O\n\n⚠️ Khi gặp câu dài, hãy tách riêng mệnh đề 'who/which/that...' ra — phần còn lại chính là câu chính (Main Clause).",
        "hint": "Tìm cụm bắt đầu bằng 'who' và kết thúc trước động từ chính."
    },
    {
        "card_type": 2,
        "grammar_category": "Relative Clauses",
        "front_side": "📖 Phân tích câu sau:\n\n\"The marketing strategy that the team developed last quarter has significantly increased revenue.\"\n\n❓ Nhiệm vụ: Xác định ĐỘNG TỪ CHÍNH (Main Verb) của câu.",
        "expected_input": "has increased",
        "back_side": "🧩 Sơ đồ phân tích:\n\n• **Subject**: The marketing strategy\n• **Relative Clause**: that the team developed last quarter ← (bổ nghĩa cho 'strategy')\n• **Main Verb**: 👉 has (significantly) increased\n• **Object**: revenue\n\n📐 Cấu trúc: S + [that + S2 + V2 + ...] + Main Verb + O\n\n⚠️ BẪY: Nhiều bạn chọn nhầm 'developed' là V chính. Nhưng 'developed' nằm TRONG mệnh đề quan hệ 'that...quarter'.",
        "hint": "Động từ chính nằm SAU mệnh đề quan hệ, không nằm bên trong nó."
    },
    {
        "card_type": 2,
        "grammar_category": "Relative Clauses",
        "front_side": "📖 Phân tích câu sau:\n\n\"Applicants whose resumes are received after the deadline will not be considered for the position.\"\n\n❓ Nhiệm vụ: Xác định CHỦ NGỮ CHÍNH (Main Subject) của câu.",
        "expected_input": "Applicants",
        "back_side": "🧩 Sơ đồ phân tích:\n\n• **Subject**: 👉 Applicants\n• **Relative Clause**: whose resumes are received after the deadline\n• **Main Verb**: will not be considered\n• **Complement**: for the position\n\n📐 Cấu trúc: S + [whose + N + V + ...] + Main Verb\n\n⚠️ 'resumes' KHÔNG phải chủ ngữ chính — nó là chủ ngữ của mệnh đề phụ. Chủ ngữ chính luôn đứng TRƯỚC đại từ quan hệ.",
        "hint": "Chủ ngữ chính đứng ngay đầu câu, trước 'whose'."
    },
    {
        "card_type": 3,
        "grammar_category": "Relative Clauses",
        "front_side": "⚡ QUY TẮC VÀNG:\n\nKhi nào KHÔNG được dùng 'that' trong mệnh đề quan hệ?",
        "expected_input": "sau dấu phẩy",
        "back_side": "🏆 Quy tắc:\n\n❌ KHÔNG dùng 'that' sau DẤU PHẨY (Non-defining Relative Clause)\n\n✅ Đúng: Mr. Lee, **who** is our CEO, will attend.\n❌ Sai: Mr. Lee, **that** is our CEO, will attend.\n\n📐 Công thức:\n• Defining (xác định): who / which / **that** đều được\n• Non-defining (không xác định, có dấu phẩy): CHỈ dùng who / which\n\n🎯 Mẹo TOEIC: Thấy dấu phẩy trước chỗ trống → Loại 'that' ngay!",
        "hint": "Liên quan đến dấu phẩy và mệnh đề quan hệ không xác định."
    },
    {
        "card_type": 3,
        "grammar_category": "Relative Clauses",
        "front_side": "⚡ BẪY THƯỜNG GẶP:\n\nPhân biệt 'who' và 'whom' trong TOEIC. Khi nào dùng 'whom'?",
        "expected_input": "whom",
        "back_side": "🏆 Quy tắc:\n\n• **who** → Thay thế CHỦ NGỮ (Subject)\n  ✅ The manager **who** approved the budget... (who = Subject → approved)\n\n• **whom** → Thay thế TÂN NGỮ (Object)\n  ✅ The candidate **whom** we interviewed... (whom = Object, 'we' là Subject)\n\n📐 Mẹo nhanh:\n• Sau 'whom' PHẢI có một Subject khác (we, they, the company...)\n• Sau 'who' là ĐỘNG TỪ trực tiếp\n\n🎯 Signal: _____ + S + V → chọn **whom**\n🎯 Signal: _____ + V → chọn **who**",
        "hint": "Nhìn xem sau chỗ trống có một chủ ngữ khác không."
    },
    {
        "card_type": 3,
        "grammar_category": "Relative Clauses",
        "front_side": "⚡ QUY TẮC VÀNG:\n\nKhi nào có thể LƯỢC BỎ đại từ quan hệ (who/which/that)?",
        "expected_input": "tân ngữ",
        "back_side": "🏆 Quy tắc:\n\nChỉ được lược bỏ khi đại từ quan hệ làm **TÂN NGỮ** (Object):\n\n✅ Lược bỏ được:\n• The book **(which/that)** I bought → OK (I = Subject riêng)\n\n❌ KHÔNG lược bỏ được:\n• The book **which** is on the table → SAI nếu bỏ (không có Subject khác)\n\n📐 Mẹo: Nếu sau đại từ quan hệ có S + V → có thể lược bỏ.\nNếu sau đại từ quan hệ là V ngay → KHÔNG được lược bỏ.\n\n🎯 TOEIC thường hỏi ngược lại: cho câu đã lược bỏ, yêu cầu chọn đại từ phù hợp nếu phải thêm vào.",
        "hint": "Khi đại từ quan hệ đóng vai trò gì thì mới bỏ được?"
    }
];

async function main() {
    const user = await prisma.user.findFirst(); // Get any user
    if (!user) {
        console.error("No user found");
        return;
    }

    for (const card of sampleCards) {
        let type = "TOEIC_P5"; // Type 1
        if (card.card_type === 2) type = "TOEIC_P6"; // Structural -> mapped to P6 for UI rendering
        if (card.card_type === 3) type = "TOEIC_P7"; // Rule -> mapped to P7 for UI rendering

        await prisma.$executeRawUnsafe(
            `INSERT INTO GrammarCard (id, userId, type, prompt, answer, hint, explanation, grammarCategory, interval, repetition, efactor, nextReview, createdAt, updatedAt, isDeferred, source, importanceScore)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 2.0, ?, ?, ?, 0, 'TOEIC', 0)`,
            crypto.randomUUID(),
            user.id,
            type,
            card.front_side,
            card.expected_input,
            card.hint,
            card.back_side,
            card.grammar_category,
            new Date().toISOString(),
            new Date().toISOString(),
            new Date().toISOString()
        );
    }

    console.log("Inserted 9 TOEIC cards successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
