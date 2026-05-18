export function getDeviceInfo(): string {
  const ua = navigator.userAgent
  let browser = 'Unknown browser'
  if (ua.includes('Edg'))                                          browser = 'Edge'
  else if (ua.includes('Chrome') && !ua.includes('Edg'))          browser = 'Chrome'
  else if (ua.includes('Firefox'))                                 browser = 'Firefox'
  else if (ua.includes('Safari') && !ua.includes('Chrome'))       browser = 'Safari'

  let os = 'Unknown OS'
  if (ua.includes('Windows'))                                      os = 'Windows'
  else if (ua.includes('Mac') && !ua.includes('iPhone') && !ua.includes('iPad')) os = 'macOS'
  else if (ua.includes('iPhone') || ua.includes('iPad'))           os = 'iOS'
  else if (ua.includes('Android'))                                 os = 'Android'
  else if (ua.includes('Linux'))                                   os = 'Linux'

  return `${browser} on ${os}`
}
