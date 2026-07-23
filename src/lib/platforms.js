import { Instagram, Youtube, Facebook, Twitter, Music2, Linkedin } from 'lucide-react'

// 平台元数据：图标 + 主色，供账号列表 / 竞品 / 品牌卡复用
export const PLATFORMS = {
  instagram: { label: 'Instagram', Icon: Instagram, color: '#E1306C' },
  youtube: { label: 'YouTube', Icon: Youtube, color: '#FF0000' },
  facebook: { label: 'Facebook', Icon: Facebook, color: '#1877F2' },
  twitter: { label: 'X/Twitter', Icon: Twitter, color: '#0f172a' },
  tiktok: { label: 'TikTok', Icon: Music2, color: '#0f172a' },
  linkedin: { label: 'LinkedIn', Icon: Linkedin, color: '#0A66C2' },
}

export function platformMeta(key) {
  return PLATFORMS[(key || '').toLowerCase()] || { label: key || '未知', Icon: Instagram, color: '#64748b' }
}
