/**
 * Product Matching Utilities - Optimized for AI-powered recommendations
 * Shared by chatRecipeAI.jsx and healthyChatAI.jsx
 */

// Normalization helper - xử lý tiếng Việt
export const normalize = (text = "") =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

// Tokenization - tách từ và lọc từ quá ngắn
export const tokenize = (text = "") =>
  normalize(text)
    .split(" ")
    .filter(Boolean)
    .filter((t) => t.length > 2)

/**
 * Extract ingredients/nutrients with fallback strategies
 * Tries multiple patterns to ensure extraction
 */
export const extractIngredients = (aiAnswer = "") => {
  const patterns = [
    /\*\*Nguyên liệu:?\*\*([\s\S]*?)(\*\*|$)/i,
    /Nguyên liệu:?\s*([\s\S]*?)(?:Các bước|Cách làm|Hướng dẫn|$)/i,
    /[-•]\s+([^:\n]+):\s*([^\n]+)/g, // bullet format
  ]

  let extractedText = ""
  
  for (const pattern of patterns) {
    if (pattern.global) {
      let match
      while ((match = pattern.exec(aiAnswer)) !== null) {
        extractedText += " " + match[0]
      }
    } else {
      const match = aiAnswer.match(pattern)
      if (match) {
        extractedText = match[1]
        break
      }
    }
  }

  // Fallback: nếu không match, extract từng dòng có dấu bullet
  if (!extractedText.trim()) {
    extractedText = aiAnswer
  }

  return extractedText
    .split(/\r?\n|,|;/)
    .map((line) => line.replace(/^[-\d.)\s•*]+/g, "").trim())
    .filter(Boolean)
    .filter((line) => line.length > 2)
    .map(normalize)
}

/**
 * Extract nutrients with fallback strategies
 */
export const extractNutrients = (aiAnswer = "") => {
  const patterns = [
    /\*\*(?:thực phẩm|dinh dưỡng|chất dinh dưỡng):?\*\*([\s\S]*?)(\*\*|$)/i,
    /(?:thực phẩm|dinh dưỡng|chất dinh dưỡng):?\s*([\s\S]*?)(?:Lợi ích|Cảnh báo|$)/i,
  ]

  let extractedText = ""
  
  for (const pattern of patterns) {
    const match = aiAnswer.match(pattern)
    if (match) {
      extractedText = match[1]
      break
    }
  }

  if (!extractedText.trim()) {
    extractedText = aiAnswer
  }

  return extractedText
    .split(/\r?\n|,|;/)
    .map((l) => l.replace(/^[-\d.)\s•*]+/g, "").trim())
    .filter(Boolean)
    .filter((l) => l.length > 2)
    .map(normalize)
}

/**
 * Extract ALL keywords from user question + AI answer
 * More comprehensive matching by tokenizing entire content
 */
export const extractAllKeywords = (userQuestion = "", aiAnswer = "") => {
  const fullText = `${userQuestion} ${aiAnswer}`
  // Tokenize entire text and collect all unique tokens
  const allTokens = tokenize(fullText)
  
  // Also extract from sentences for more context
  const sentences = fullText
    .split(/[.!?\n]+/)
    .filter((s) => s.trim().length > 0)
    .flatMap((sentence) => tokenize(sentence))
  
  // Combine and deduplicate
  return Array.from(new Set([...allTokens, ...sentences]))
}

/**
 * Optimized token-based matching using Set for O(1) lookup
 * Returns true if token matches any question token
 */
const createTokenSet = (tokens) => new Set(tokens)

const matchesTokenSet = (token, tokenSet) => {
  for (const qt of tokenSet) {
    if (qt.includes(token) || token.includes(qt)) return true
  }
  return false
}

/**
 * Find relevant products - optimized version
 * Memoization pattern: cache scoring results per user message
 */
export const createProductFinder = (products, fuseRef) => {
  const memoCache = new Map() // message content -> products

  return (userQuestion, aiAnswer = "") => {
    const cacheKey = `${userQuestion}|${aiAnswer}`
    if (memoCache.has(cacheKey)) {
      return memoCache.get(cacheKey)
    }

    // Extract all keywords from full content (more comprehensive)
    const allKeywords = extractAllKeywords(userQuestion, aiAnswer)
    
    // Also keep structured extraction for boosted scoring
    const ingredients = extractIngredients(aiAnswer || "")
    const nutrients = extractNutrients(aiAnswer || "")
    
    const fullTextNorm = normalize((userQuestion || "") + " " + (aiAnswer || ""))
    const questionTokens = tokenize(userQuestion || "")
    const questionTokenSet = createTokenSet(questionTokens)

    const scores = new Map() // id -> score
    const matchedTokensMap = new Map() // id -> Set(tokens)

    const processProductScore = (prod, scoreToAdd, matchedToken = null) => {
      const id = prod._id || prod.id
      if (!id) return
      
      if (!scores.has(id)) scores.set(id, 0)
      scores.set(id, scores.get(id) + scoreToAdd)
      
      if (matchedToken) {
        if (!matchedTokensMap.has(id)) matchedTokensMap.set(id, new Set())
        matchedTokensMap.get(id).add(matchedToken)
      }
    }

    // Preprocessing: normalize all keywords tokens once
    const allKeywordTokens = allKeywords.reduce((acc, kw) => acc.concat(tokenize(kw)), [])
    const allKeywordTokenSet = createTokenSet(allKeywordTokens)

    // Main scoring loop - optimized
    products.forEach((product) => {
      const normName = product.__normName || normalize(product.name || "")
      const tokens = product.__tokens || tokenize(product.name || "")
      const keywords = product.__keywords || [normName]
      const categoryName = product.category?.name ? normalize(product.category.name) : ""

      // Exact name match in question (80 points)
      if (matchesTokenSet(normName, questionTokenSet)) {
        processProductScore(product, 80, normName)
      }

      // Exact name match in ingredients/nutrients (100 points - highest priority)
      if (ingredients.some((ing) => ing.includes(normName) || normName.includes(ing)) ||
          nutrients.some((nut) => nut.includes(normName) || normName.includes(nut))) {
        processProductScore(product, 100, normName)
      }

      // Match in all extracted keywords (70 points - broad context)
      if (allKeywordTokens.some((kw) => kw.includes(normName) || normName.includes(kw))) {
        processProductScore(product, 70, normName)
      }

      // Token matches in question (40 points each)
      tokens.forEach((token) => {
        if (matchesTokenSet(token, questionTokenSet)) {
          processProductScore(product, 40, token)
        }
      })

      // Token matches in ingredients/nutrients (30 points each)
      tokens.forEach((token) => {
        if (ingredients.some((ing) => ing.includes(token)) ||
            nutrients.some((nut) => nut.includes(token))) {
          processProductScore(product, 30, token)
        }
      })

      // Token matches in all keywords (15 points - broader matching)
      tokens.forEach((token) => {
        if (allKeywordTokenSet.has(token) || allKeywordTokens.some((kw) => kw.includes(token))) {
          processProductScore(product, 15, token)
        }
      })

      // Keyword matches in ingredients/nutrients (50 points)
      keywords.forEach((k) => {
        if (ingredients.some((ing) => ing.includes(k)) ||
            nutrients.some((nut) => nut.includes(k))) {
          processProductScore(product, 50, k)
        }
      })

      // Matches in full text (5-10 points)
      if (fullTextNorm.includes(normName)) processProductScore(product, 10, normName)
      tokens.forEach((token) => {
        if (fullTextNorm.includes(token)) processProductScore(product, 5, token)
      })
      if (categoryName && fullTextNorm.includes(categoryName)) {
        processProductScore(product, 5, categoryName)
      }
    })

    // Fuzzy search - optimized with batch processing
    const fuse = fuseRef.current
    if (fuse) {
      // Use all keywords for fuzzy search instead of just structured ones
      const allSearchTokens = Array.from(new Set([...allKeywordTokens, ...questionTokens]))
      
      try {
        // Batch search - combine results instead of searching individually
        const fuseResults = new Map() // product id -> best fuzzy score
        
        allSearchTokens.forEach((token) => {
          try {
            const fRes = fuse.search(token).slice(0, 3) // limit to top 3
            fRes.forEach((r) => {
              const item = r.item
              const id = item._id || item.id
              const fuzzyScore = Math.round((1 - (r.score || 1)) * 40)
              
              if (fuzzyScore > 0) {
                // Keep best fuzzy score for each product
                if (!fuseResults.has(id) || fuzzyScore > fuseResults.get(id)) {
                  fuseResults.set(id, fuzzyScore)
                  processProductScore(item, fuzzyScore, token)
                }
              }
            })
          } catch (err) {
            console.warn('Fuse search error for token:', token, err)
          }
        })
      } catch (err) {
        console.warn('Fuse batch search failed', err)
      }
    }

    // Sort by score and apply minimum threshold (10 points minimum)
    const MIN_SCORE = 10
    const sorted = Array.from(scores.entries())
      .filter(([, score]) => score >= MIN_SCORE)
      .map(([id, score]) => {
        const product = products.find((p) => (p._id || p.id) === id)
        return { id, product, score }
      })
      .sort((a, b) => b.score - a.score)

    // Build enriched result
    const enriched = sorted.map((s) => ({
      product: s.product,
      matchedTokens: matchedTokensMap.has(s.id) ? Array.from(matchedTokensMap.get(s.id)) : [],
      score: s.score, // include score for debugging
    }))

    // Development logging
    if (import.meta.env.DEV) {
      console.debug('Product matching results:', {
        question: userQuestion,
        extracted_keywords: allKeywords.slice(0, 5),
        extracted_ingredients: ingredients.slice(0, 3),
        extracted_nutrients: nutrients.slice(0, 3),
        matched_count: enriched.length,
        top_matches: enriched
          .slice(0, 3)
          .map((e) => ({ name: e.product.name, score: e.score, tokens: e.matchedTokens })),
      })
    }

    const result = enriched.slice(0, 5)
    memoCache.set(cacheKey, result)

    // Clean cache if too large (prevent memory leak)
    if (memoCache.size > 50) {
      const firstKey = memoCache.keys().next().value
      memoCache.delete(firstKey)
    }

    return result
  }
}

/**
 * Highlight matched tokens in text
 * Maps normalized matches back to original text positions
 */
export const highlightText = (original = "", matchedTokens = []) => {
  if (!original || !matchedTokens || matchedTokens.length === 0) return original

  const orig = original
  const normChars = []
  const indexMap = [] // normIndex -> originalIndex

  // Build normalized character mapping
  for (let i = 0; i < orig.length; i++) {
    const ch = orig[i]
    let norm = ch.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    norm = norm.toLowerCase().replace(/[^a-z0-9]/g, " ")
    for (let k = 0; k < norm.length; k++) {
      normChars.push(norm[k])
      indexMap.push(i)
    }
  }

  const normStr = normChars.join("")
  const ranges = []

  // Find all match ranges
  matchedTokens.forEach((t) => {
    if (!t) return
    const token = normalize(t)
    let start = 0
    while (true) {
      const idx = normStr.indexOf(token, start)
      if (idx === -1) break
      const startOrig = indexMap[idx]
      const endOrig = indexMap[Math.min(idx + token.length - 1, indexMap.length - 1)] + 1
      ranges.push([startOrig, endOrig])
      start = idx + token.length
    }
  })

  if (ranges.length === 0) return original

  // Merge overlapping ranges
  ranges.sort((a, b) => a[0] - b[0])
  const merged = []
  let [curS, curE] = ranges[0]
  for (let i = 1; i < ranges.length; i++) {
    const [s, e] = ranges[i]
    if (s <= curE) curE = Math.max(curE, e)
    else {
      merged.push([curS, curE])
      curS = s
      curE = e
    }
  }
  merged.push([curS, curE])

  // Build highlighted fragments
  const parts = []
  let pos = 0
  merged.forEach(([s, e], idx) => {
    if (pos < s) parts.push(<span key={`t_${idx}_text`}>{orig.slice(pos, s)}</span>)
    parts.push(
      <strong key={`t_${idx}_bold`}>{orig.slice(s, e)}</strong>
    )
    pos = e
  })
  if (pos < orig.length) parts.push(<span key={`t_tail`}>{orig.slice(pos)}</span>)

  return parts
}
