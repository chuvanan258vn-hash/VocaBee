/**
 * Normalizes messy word types from the database into a standard set of categories.
 */
export function normalizeWordType(wordType: string | null | undefined): string {
    if (!wordType) return "Khác";
    const type = wordType.toLowerCase().trim();

    // Stricter checks for single letter labels to avoid substrings in "phrase", "verb", etc.
    const isNoun = ["noun", "danh từ", "dt", "n.", "danh từ/cụm từ", "danh từ/tính từ"].some(t => type.includes(t)) || type === "n";
    const isVerb = ["verb", "động từ", "đt", "v.", "cụm động từ"].some(t => type.includes(t)) || type === "v";
    const isAdj = ["adj", "tính từ", "tt", "adj.", "adjective"].some(t => type.includes(t)) || type === "a";
    const isAdv = ["adv", "trạng từ", "tr", "adv.", "adverb", "phó từ"].some(t => type.includes(t));
    const isPhrase = ["phr", "phrase", "cụm từ", "phr.", "cụm"].some(t => type.includes(t));
    const isIdiom = ["idiom", "thành ngữ", "idm"].some(t => type.includes(t));
    const isPrep = ["prep", "giới từ", "pre"].some(t => type.includes(t));

    // Order matters: More specific types first
    if (isPhrase) return "Cụm từ";
    if (isIdiom) return "Thành ngữ";
    if (isNoun) return "Danh từ";
    if (isVerb) return "Động từ";
    if (isAdj) return "Tính từ";
    if (isAdv) return "Trạng từ";
    if (isPrep) return "Giới từ";

    return "Khác";
}

/**
 * Returns Tailwind CSS classes for labels based on the word type.
 */
export function getWordTypeColor(wordType: string | null | undefined): string {
    return getWordTypeStyles(wordType).bg;
}

/**
 * Returns an object with specific Tailwind color classes for the word type.
 */
export function getWordTypeStyles(wordType: string | null | undefined) {
    const normalized = normalizeWordType(wordType);

    switch (normalized) {
        case "Danh từ": return { bg: "bg-blue-600", border: "border-blue-600", text: "text-blue-600", ring: "ring-blue-600" };
        case "Động từ": return { bg: "bg-emerald-600", border: "border-emerald-600", text: "text-emerald-600", ring: "ring-emerald-600" };
        case "Tính từ": return { bg: "bg-rose-600", border: "border-rose-600", text: "text-rose-600", ring: "ring-rose-600" };
        case "Trạng từ": return { bg: "bg-amber-600", border: "border-amber-600", text: "text-amber-600", ring: "ring-amber-600" };
        case "Cụm từ": return { bg: "bg-indigo-600", border: "border-indigo-600", text: "text-indigo-600", ring: "ring-indigo-600" };
        case "Thành ngữ": return { bg: "bg-purple-600", border: "border-purple-600", text: "text-purple-600", ring: "ring-purple-600" };
        case "Giới từ": return { bg: "bg-cyan-600", border: "border-cyan-600", text: "text-cyan-600", ring: "ring-cyan-600" };
        default: return { bg: "bg-slate-600", border: "border-slate-600", text: "text-slate-600", ring: "ring-slate-600" };
    }
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

export function cn(...inputs: any[]) {
    return inputs.flat().filter(Boolean).join(" ");
}
