import topics from './topics.json';

export function searchTopics(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];
  
  const words = q.split(/\s+/).filter(w => w.length > 1);
  
  const scored = topics.map(t => {
    let score = 0;
    const titleLower = t.title.toLowerCase();
    const subLower = t.subModule.toLowerCase();
    const shortLower = t.shortDescription.toLowerCase();
    const aliases = (t.aliases || []).map(a => a.toLowerCase());

    // Exact match boost
    if (titleLower === q || aliases.includes(q)) score += 20;
    if (titleLower.includes(q)) score += 10;
    
    // Alias phrase matching
    for (const a of aliases) {
      if (a.includes(q)) score += 8;
      if (q.includes(a)) score += 6;
    }

    // Word token occurrences
    for (const w of words) {
      if (w.length < 3) continue;
      if (titleLower.includes(w)) score += 4;
      if (subLower.includes(w)) score += 3;
      if (shortLower.includes(w)) score += 2;
      for (const a of aliases) {
        if (a.includes(w)) score += 3;
      }
    }

    // Domain specific natural language phrase mappings
    if ((q.includes("supplier") || q.includes("vendor")) && t.subModule === "Vendor") score += 5;
    if ((q.includes("po") || q.includes("purchase order") || q.includes("buy")) && t.subModule === "Purchase Orders") score += 5;
    if ((q.includes("pr") || q.includes("purchase request")) && t.subModule === "Purchase Requests") score += 5;
    if ((q.includes("di") || q.includes("dispatch")) && t.subModule === "Dispatch Instructions") score += 5;
    if ((q.includes("leave") || q.includes("off") || q.includes("vacation")) && t.id.startsWith("attendance-leave")) score += 6;
    if ((q.includes("punch") || q.includes("clock") || q.includes("mark attendance") || q.includes("gps")) && t.id === "attendance-punch") score += 6;

    return { topic: t, score };
  }).filter(r => r.score >= 3);

  scored.sort((a, b) => b.score - a.score);
  return scored.map(r => r.topic);
}

export function getTopicById(id) {
  return topics.find(t => t.id === id) || null;
}

export function getTopicsBySubModule(subModuleName) {
  return topics.filter(t => t.subModule === subModuleName);
}

export { topics };
