/**
 * Mask benua untuk globe dot-matrix.
 *
 * Sumber: Natural Earth 110m land (domain publik), dirasterkan ke grid
 * 2 derajat (180 x 90 bit) lalu di-encode base64. Hasilnya 2,7 KB yang ikut
 * bundel, jadi globe tidak perlu memuat data peta dari jaringan sama sekali.
 *
 * Cara pakai: titik pada bola diubah ke koordinat lon/lat, lalu dicari
 * bit-nya. Bit 1 berarti daratan, 0 berarti laut.
 *
 *   x = floor((lon + 180) / 2)   -> 0..179
 *   y = floor((90 - lat) / 2)    -> 0..89
 *   indeks bit = y * 180 + x
 */
export const GLOBE_MASK_W = 180
export const GLOBE_MASK_H = 90

const MASK_B64 =
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
  "AP//7//wAAAAAAAAAAAAAAAAAAAAAAB///////AA/wDwAAHgAAAAAAAAAAAHf//////4AB/gAAAAD+AAAAAAAAAAD/v/8///"
  "/4AA/gAA+ADf4AGAAAAAAAH///4A///4AAAAAH4Af/8AP8AAAAAAH///+Af//wAAAAAeD////+H4AAwH/gf////4P//wAAD8"
  "AeH///////wRw//////9/4P//AAAP/nP//////////+///////3/H/wuAAf//////////////////////+H/B/AB////////"
  "//////Df/////7/8D8A8AP//////////////A//////gf8B4AAAP/////////////8A/8////wP+AAAAGP5///////////fQ"
  "AHwB///8H/AAAAPD7/////////8B8AAeAB////v/wAAAfD//////////9B8AAAAB//////4AAAfv///////////B4AAAAAf/"
  "////4AAAX////////////AwAAAAAf/////8AAAH////////////gAAAAAAH/////8AAAH////////////AAAAAAAD/////gA"
  "AAB//7////////7gAAAAAAH////8AAAAf//7f///////3gAAAAAAH////wAAAAfy/////////+HAAAAAAAD///+AAAAAfi//"
  "///////+GAAAAAAAD///+AAAAAf/7////////+OAAAAAAAB///+AAAAAP/Bz///////n+AAAAAAAA///4AAAAAf/zB//////"
  "/jwAAAAAAAAf//wAAAAAf//////////hAAAAAAAAAP/9wAAAAB///////////wAAAAAAAAAP/A8AAAAD///////////gAAAA"
  "AAAAAH/AcAAAAD///////////gAAAAACAAAD/B8AAAAH//////H///+gAAAAADgAAAfPeAAAAH//////B///wgAAAAABgAAA"
  "f+P8AAAH////v+A/j+wwAAAAAAAAAAP9EsAAAH/////+A/B/hwAAAAAAAAAABfgAAAAH/////4A+B/hwAAAAAAAAAAAPgwAA"
  "AH/////wAeAfg4AAAAAAAAAAADj/AAAH/////wAcAXh4AAAAAAAAAAAB//gAAD/////wAOAbDcAAAAAAAAAAAAf/4AAB////"
  "/gAOAcC8AAAAAAAAAAAAH/+AAAfv///gACB8HIAAAAAAAAAAAAP/+AAAAD///AAAA8/EAAAAAAAAAAAAf//AAAAD//+AAAAe"
  "/+AAAAAAAAAAAAf//wAAAD//8AAAAO/38AAAAAAAAAAAf//+AAAD//4AAAAPf//mAAAAAAAAAAf///gAAB//wAAAAHHw/vAA"
  "AAAAAAAAf///gAAA//wAAAAD8AX9wAAAAAAAAAP///gAAA//wAAAAAf8PcYAAAAAAAAAP///AAAA//4AAAAAA57cMAAAAAAA"
  "AAH///AAAA//5wAAAAAH7AAAAAAAAAAAH//+AAAB//7wAAAAAP7gBAgAAAAAAAB//+AAAB///wAAAAAf/wBDAAAAAAAAA//+"
  "AAAB//jgAAAAB//4ADAAAAAAAAA//8AAAA//HgAAAAH//4DAAAAAAAAAA//8AAAAf/HAAAAAP//8BAAAAAAAAAA//gAAAAf/"
  "HAAAAAP//+AAAAAAAAAAA//AAAAAf+AAAAAAP//+AAAAAAAAAAA//AAAAAP+AAAAAAH//+AAAAAAAAAAA/+AAAAAP8AAAAAA"
  "H//+AAAAAAAAAAA/8AAAAAP4AAAAAAH8/+AAAAAAAAAAB/8AAAAAGAAAAAAAHQf8AMAAAAAAAAB/wAAAAAAAAAAAAAAAH8AP"
  "AAAAAAAAB/wAAAAAAAAAAAAAAADwAPAAAAAAAAD+AAAAAAAAAAAAAAAAA4AeAAAAAAAAD+AAAAAAAAAAAAAAAAA4A4AAAAAA"
  "AAD8AAAAAAAAAAAAAAAAAABwAAAAAAAAD8AAAAAAAAAAAAAAAAAABgAAAAAAAAD8AAAAAAAAAADAAAAAAAAAAAAAAAAADxwA"
  "AAAAAAAAAAAAAAAAAAAAAAAAAAD5gAAAAAAAAAAAAAAAAAAAAAAAAAAAB8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAA"
  "AAAAAAAAAAAAAAAHgAAAAAAAAOAAAGIAQAAAAAAAAAAAAOAAAAAAAAD/+D/////wAAAAAAAAAAA+AAAAAEsH//+///////wA"
  "AAAAAAPAD/AAAA///////////////wAAAAPkP///AAAH///////////////wAAD///////AAAf///////////////AAD////"
  "///wAgf///////////////+AAP//////+BD4/////////////////AAB////////v/////////////////4ABAf/////////"
  "/////////////////g//////////////////////////////////////////////////////////////////////////////"
  "////////////"

let cache: Uint8Array | null = null

/** Bit mask sebagai byte, dihitung sekali lalu dipakai terus. */
export function globeMask(): Uint8Array {
  if (cache) return cache
  const biner = atob(MASK_B64)
  const out = new Uint8Array(biner.length)
  for (let i = 0; i < biner.length; i++) out[i] = biner.charCodeAt(i)
  cache = out
  return out
}

/** Apakah koordinat ini daratan? */
export function isDarat(lon: number, lat: number, mask: Uint8Array): boolean {
  const x = Math.floor((lon + 180) / 2)
  const y = Math.floor((90 - lat) / 2)
  if (x < 0 || x >= GLOBE_MASK_W || y < 0 || y >= GLOBE_MASK_H) return false
  const idx = y * GLOBE_MASK_W + x
  const byte = mask[idx >> 3]
  return ((byte >> (7 - (idx & 7))) & 1) === 1
}
