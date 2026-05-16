import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

let cachedDoc: GoogleSpreadsheet | null = null
let cachedAt = 0
const DOC_TTL = 10 * 60 * 1000  // 10 min

export async function getDoc(): Promise<GoogleSpreadsheet> {
  const now = Date.now()
  if (cachedDoc && now - cachedAt < DOC_TTL) return cachedDoc

  const config = useRuntimeConfig()
  const jwt = new JWT({
    email: config.googleServiceAccountEmail,
    key: config.googleServiceAccountKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const doc = new GoogleSpreadsheet(config.sheetId, jwt)
  await doc.loadInfo()

  cachedDoc = doc
  cachedAt = now
  return doc
}

export async function getSheet(title: 'families' | 'members' | 'admins') {
  const doc = await getDoc()
  const sheet = doc.sheetsByTitle[title]
  if (!sheet) throw createError({ statusCode: 500, message: `Sheet "${title}" not found` })
  return sheet
}
