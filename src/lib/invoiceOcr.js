function cleanValue(value = '') {
  return value
    .replace(/^[\s:：|]+/, '')
    .replace(/[\s|]+$/, '')
    .replace(/^(名称|名\s*称)[\s:：]*/i, '')
    .trim()
}

function findParty(block = '') {
  const lines = block.split(/\n+/).map((line) => line.trim()).filter(Boolean)
  for (const line of lines) {
    const match = line.match(/(?:名称|名\s*称)[\s:：]*([^\n]{2,80})/i)
    if (match) return cleanValue(match[1])
  }
  return ''
}

export function extractInvoiceParties(rawText = '') {
  const text = rawText.replace(/\r/g, '\n').replace(/[ \t]+/g, ' ')
  const buyerStart = text.search(/购\s*买\s*方|购\s*方/i)
  const sellerStart = text.search(/销\s*售\s*方|销\s*方/i)
  let buyerName = ''
  let sellerName = ''

  if (buyerStart >= 0) {
    const end = sellerStart > buyerStart ? sellerStart : Math.min(text.length, buyerStart + 600)
    buyerName = findParty(text.slice(buyerStart, end))
  }
  if (sellerStart >= 0) sellerName = findParty(text.slice(sellerStart, Math.min(text.length, sellerStart + 700)))

  if (!buyerName) {
    const direct = text.match(/(?:购\s*买\s*方|购\s*方)[\s\S]{0,100}?(?:名称|名\s*称)[\s:：]*([^\n]{2,80})/i)
    buyerName = cleanValue(direct?.[1])
  }
  if (!sellerName) {
    const direct = text.match(/(?:销\s*售\s*方|销\s*方)[\s\S]{0,100}?(?:名称|名\s*称)[\s:：]*([^\n]{2,80})/i)
    sellerName = cleanValue(direct?.[1])
  }

  return { buyerName, sellerName }
}

async function extractPdfText(file) {
  const pdfjs = await import('pdfjs-dist')
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
  let text = ''
  let preview = null
  for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, 3); pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    text += `${content.items.map((item) => item.str).join(' ')}\n`
    if (pageNumber === 1) {
      const viewport = page.getViewport({ scale: 2 })
      preview = document.createElement('canvas')
      preview.width = viewport.width
      preview.height = viewport.height
      await page.render({ canvasContext: preview.getContext('2d'), viewport }).promise
    }
  }
  return { text, preview }
}

export async function recognizeInvoice(file, onProgress = () => {}) {
  let text = ''
  let ocrSource = file
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    onProgress('正在读取 PDF 发票…')
    const pdfResult = await extractPdfText(file)
    text = pdfResult.text
    ocrSource = pdfResult.preview
    const parties = extractInvoiceParties(text)
    if (parties.buyerName || parties.sellerName) return { ...parties, text }
  }

  if (!file.type.startsWith('image/') && !ocrSource) return { ...extractInvoiceParties(text), text }
  onProgress('正在识别发票图片…')
  const { recognize } = await import('tesseract.js')
  const result = await recognize(ocrSource, 'chi_sim+eng', {
    logger: (message) => {
      if (message.status === 'recognizing text') onProgress(`正在识别发票… ${Math.round((message.progress || 0) * 100)}%`)
    },
  })
  text = result.data.text || text
  return { ...extractInvoiceParties(text), text }
}
