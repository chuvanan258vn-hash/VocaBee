/**
 * Returns Tailwind CSS classes for labels based on the word type.
 * Supports common abbreviations in both English and Vietnamese.
 */
export function getWordTypeColor(wordType: string | null | undefined): string {
    if (!wordType) return "bg-slate-500 text-white";

    const type = wordType.toLowerCase().trim();

    // Noun / Danh từ
    if (["n", "noun", "danh từ", "dt", "n."].includes(type)) {
        return "bg-blue-500 text-white";
    }

    // Verb / Động từ
    if (["v", "verb", "động từ", "đt", "v."].includes(type)) {
        return "bg-emerald-500 text-white";
    }

    // Adjective / Tính từ
    if (["adj", "a", "tính từ", "tt", "adj."].includes(type)) {
        return "bg-rose-500 text-white";
    }

    // Adverb / Trạng từ
    if (["adv", "trạng từ", "tr", "adv."].includes(type)) {
        return "bg-amber-500 text-white";
    }

    // Phrase / Cụm từ
    if (type.includes("cụm") || type.includes("phrase") || ["phr", "phr."].includes(type)) {
        return "bg-indigo-500 text-white";
    }

    // Idiom / Thành ngữ
    if (["idiom", "thành ngữ", "idm", "idm."].includes(type)) {
        return "bg-purple-500 text-white";
    }

    // Preposition / Giới từ
    if (["prep", "giới từ", "pre", "prep."].includes(type)) {
        return "bg-cyan-500 text-white";
    }

    // Default
    return "bg-slate-500 text-white";
}

/**
 * Pronounces text using the browser's Speech Synthesis API.
 * Supports US, UK, and AU accents from localStorage.
 */
export function speak(text: string) {
    if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Get preferred accent from localStorage (default to US)
        const accent = localStorage.getItem("vocabee-accent") || "US";
        const accentMap: Record<string, string> = {
            "US": "en-US",
            "UK": "en-GB",
            "AU": "en-AU"
        };

        utterance.lang = accentMap[accent] || "en-US";
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }
}

/**
 * Exports data to a CSV file and triggers download.
 */
export function exportToCSV(data: any[], filename: string) {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).filter(k => k !== 'id' && k !== 'userId' && k !== 'createdAt' && k !== 'updatedAt' && k !== 'nextReview' && k !== 'interval' && k !== 'repetition' && k !== 'efactor');
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const cell = row[header] === null || row[header] === undefined ? "" : row[header];
            // Escape quotes and wrap in quotes if contains comma
            const stringified = String(cell).replace(/"/g, '""');
            return stringified.includes(',') ? `"${stringified}"` : stringified;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Enhanced CSV parser with support for Vietnamese headers and different locales.
 */
export function parseCSV(text: string): any[] {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    // Mapping of possible Excel headers to internal keys
    const headerMap: Record<string, string> = {
        "từ vựng": "word",
        "word": "word",
        "nghĩa tiếng việt": "meaning",
        "meaning": "meaning",
        "loại từ": "wordType",
        "type": "wordType",
        "phiên âm": "pronunciation",
        "pronunciation": "pronunciation",
        "từ đồng nghĩa": "synonyms",
        "synonyms": "synonyms",
        "ví dụ toeic": "example",
        "ví dụ": "example",
        "example": "example"
    };

    // Detect delimiter (comma or semicolon)
    const headerLine = lines[0];
    const delimiter = headerLine.includes(';') && !headerLine.includes(',') ? ';' : ',';

    const rawHeaders = headerLine.split(delimiter).map(h => h.trim().toLowerCase());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Split by delimiter considering quotes
        const regex = new RegExp(`${delimiter}(?=(?:(?:[^"]*"){2})*[^"]*$)`);
        const values = line.split(regex);

        const obj: any = {};
        rawHeaders.forEach((rawHeader, index) => {
            const internalKey = headerMap[rawHeader];
            if (internalKey) {
                let val = values[index]?.trim() || "";
                // Remove surrounding quotes and handle escaped quotes
                if (val.startsWith('"') && val.endsWith('"')) {
                    val = val.substring(1, val.length - 1).replace(/""/g, '"');
                }
                obj[internalKey] = val;
            }
        });

        // Only add if at least word and meaning exist
        if (obj.word && obj.meaning) {
            result.push(obj);
        }
    }
    return result;
}

/**
 * Specialized CSV parser for Grammar Cards
 */
export function parseGrammarCSV(text: string): any[] {
    // Remove BOM if present (happens often with Excel CSV)
    const cleanText = text.replace(/^\uFEFF/, '');
    const lines = cleanText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headerLine = lines[0];

    // Improved delimiter detection: check for Tab, Semicolon, or Comma
    let delimiter = ',';
    if (headerLine.includes('\t')) delimiter = '\t';
    else if (headerLine.includes(';') && !headerLine.includes(',')) delimiter = ';';
    else if (headerLine.includes(',') && !headerLine.includes(';')) delimiter = ',';
    else if (headerLine.includes(';')) delimiter = ';'; // Favor semicolon if both exist (Excel EU/VN style)

    const rawHeaders = headerLine.split(delimiter).map(h => h.trim().toLowerCase());

    // Exact mapping for grammar (including user's common headers)
    const headerMap: Record<string, string> = {
        "type": "type",
        "loại": "type",
        "prompt": "prompt",
        "câu hỏi": "prompt",
        "đề bài": "prompt",
        "short example": "prompt",
        "ví dụ": "prompt",
        "answer": "answer",
        "đáp án": "answer",
        "practice activity": "answer",
        "bài tập": "answer",
        "options": "options",
        "lựa chọn": "options",
        "explanation": "explanation",
        "giải thích": "explanation",
        "what to master": "explanation",
        "kiến thức": "explanation",
        "hint": "hint",
        "gợi ý": "hint",
        "tags": "tags",
        "nhãn": "tags",
        "topic": "topic",
        "chủ đề": "topic",
        "subtopic": "subtopic"
    };

    const result = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const regex = new RegExp(`${delimiter}(?=(?:(?:[^"]*"){2})*[^"]*$)`);
        const values = line.split(regex);

        const obj: any = {};
        rawHeaders.forEach((rawHeader, index) => {
            const internalKey = headerMap[rawHeader];
            if (internalKey) {
                let val = values[index]?.trim() || "";
                if (val.startsWith('"') && val.endsWith('"')) {
                    val = val.substring(1, val.length - 1).replace(/""/g, '"');
                }
                obj[internalKey] = val;
            }
        });

        // Smart Mapping & Defaults
        const finalObj: any = {
            type: obj.type || "PRODUCTION",
            prompt: obj.prompt || "",
            answer: obj.answer || "",
            options: obj.options || null,
            hint: obj.hint || "",
            explanation: obj.explanation || "",
            tags: obj.tags || ""
        };

        // If user provided topic/subtopic but no tags, combine them
        if (!finalObj.tags && (obj.topic || obj.subtopic)) {
            finalObj.tags = [obj.topic, obj.subtopic].filter(Boolean).join(", ");
        }

        if (finalObj.prompt && finalObj.answer) {
            result.push(finalObj);
        }
    }
    return result;
}
