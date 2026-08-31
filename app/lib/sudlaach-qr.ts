export function sudlaachQrUrl(lng: string, empid: string) {
  return `https://www.nso.mn/${lng}/about-us/sudlaachQr/id/${encodeURIComponent(empid)}`;
}
