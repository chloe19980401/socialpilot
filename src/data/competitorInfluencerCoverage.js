// 竞品达人合作公开证据库。
// 仅把内容页明确出现 sponsored / sponsor / #PR 等披露的记录列为合作；
// 频率由前端按「达人 + 竞品」对本文件中的已核验内容计数，代表当前审计样本，不代表全网完整次数。
export const INFLUENCER_AUDIT_DATE = '2026-11-19'

export const INFLUENCER_PLATFORMS = ['YouTube', 'Instagram', 'TikTok']
export const INFLUENCER_EVIDENCE_TYPES = ['明确赞助', 'PR / 商业内容', '送测 / 赠品', '联盟营销', '普通提及']

export const COMPETITOR_INFLUENCER_COVERAGE = [
  {
    id: 'youtube-tech-with-brett-eufy-e30-2024', platform: 'YouTube', creator: 'Tech With Brett', handle: '@TechWithBrett', competitor: 'eufy Security', publishedAt: '2024-11-14',
    title: 'The eufy Smart Lock E30 Has it All Without a Hub', url: 'https://www.youtube.com/watch?v=C4FAlY3Ts0U',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“Thank you to eufy for sponsoring this video!”', collaborationConfirmed: true,
    followers: 507000, views: 13817, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-tech-with-brett-eufy-s2-2026', platform: 'YouTube', creator: 'Tech With Brett', handle: '@TechWithBrett', competitor: 'eufy Security', publishedAt: '2026-03-31',
    title: 'eufy Omni S2 sponsored review', url: 'https://www.youtube.com/watch?v=1FX-qoRWY9k',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“Thank you to eufy for sponsoring this video!”并含专属优惠码。', collaborationConfirmed: true,
    followers: 507000, views: 20147, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-authentech-eufy-lock-2021', platform: 'YouTube', creator: 'AuthenTech - Ben Schmanke', handle: '@AuthenTech', competitor: 'eufy Security', publishedAt: '2021-03-24',
    title: 'Best Smart Lock? Fingerprint Scanner + Keypad + WiFi!', url: 'https://www.youtube.com/watch?v=nKWUSCJ4lws',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“Huge thanks to eufy for sponsoring this video.”并披露联盟链接。', collaborationConfirmed: true,
    followers: 2720000, views: 8643, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-shortcircuit-aqara-u400-2026', platform: 'YouTube', creator: 'ShortCircuit', handle: '@ShortCircuit', competitor: 'Aqara', publishedAt: '2026-01-28',
    title: 'Keys are Obsolete - Aqara Smart Lock U400', url: 'https://www.youtube.com/watch?v=oIs2ZCcj2Vg',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“Thanks to Aqara for sponsoring this video!”', collaborationConfirmed: true,
    followers: 2550000, views: 176036, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-jon-rettinger-aqara-2026', platform: 'YouTube', creator: 'Jon Rettinger', handle: '@JonRettinger', competitor: 'Aqara', publishedAt: '2026-04-07',
    title: 'I Fixed My Smart Home!', url: 'https://www.youtube.com/watch?v=gyZCcG1tRuI',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“This video was sponsored by Aqara.”并展示 U400、W200、G410。', collaborationConfirmed: true,
    followers: 1660000, views: 342988, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-shane-whatley-switchbot-room-2025', platform: 'YouTube', creator: 'Shane Whatley', handle: '@ShaneCreates', competitor: 'SwitchBot', publishedAt: '2025-01-26',
    title: "Smart Home Tech You Can't See! (Room Makeover)", url: 'https://www.youtube.com/watch?v=guk2EREuHGs',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“Sponsored by SwitchBot”，并披露联盟链接。', collaborationConfirmed: true,
    followers: 184000, views: 22934, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-shane-whatley-switchbot-hub2-2023', platform: 'YouTube', creator: 'Shane Whatley', handle: '@ShaneCreates', competitor: 'SwitchBot', publishedAt: '2023-04-16',
    title: "Smart Thermostats & Temperature Automations: Everything I've Learned", url: 'https://www.youtube.com/watch?v=So1d5-j8FjY',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“Sponsored by SwitchBot”，并提供 Hub 2 专属优惠码。', collaborationConfirmed: true,
    followers: 185000, views: 111157, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-takahiro-switchbot-2026', platform: 'YouTube', creator: 'takahiro', handle: '@takahiro_qol', competitor: 'SwitchBot', publishedAt: '2026-07-06',
    title: 'Smart Home Setup in a 1K 8-Tatami Room with Alexa & SwitchBot | 25 Use Cases', url: 'https://www.youtube.com/watch?v=_t9PTfDxGHM',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“Sponsored by: SwitchBot”，并列出完整产品与联盟链接。', collaborationConfirmed: true,
    followers: 39100, views: 31068, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'tiktok-yosuke-switchbot-meter-2022', platform: 'TikTok', creator: 'ようすけ', handle: '@yamasakifuufu.kochi', competitor: 'SwitchBot', publishedAt: '2022-08-18',
    title: 'SwitchBot 温湿度计联动空调教程', url: 'https://notes.tiktok.com/%40yamasakifuufu.kochi/7133170465270678021?region=jp',
    evidenceType: 'PR / 商业内容', relationship: '公开内容包含 #pr 标签，可确认商业推广属性；页面未披露具体付费、送测或佣金形式。', collaborationConfirmed: true,
    followers: null, views: null, metricsAsOf: '2026-11-19', confidence: '中',
  },
  {
    id: 'youtube-911reviews-ultraloq-2026', platform: 'YouTube', creator: '911Reviews - Shopping, Gadgets & Tech', handle: '@911Reviews', competitor: 'Ultraloq', publishedAt: '2026-06-23',
    title: 'ULTRALOQ Bolt NFC - A next-gen smart lock', url: 'https://www.youtube.com/watch?v=Rg9YodESAd8',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“This is a sponsored video”，同时披露 Amazon 推荐链接与专属折扣码。', collaborationConfirmed: true,
    followers: 1190000, views: 153666, metricsAsOf: '2026-11-19', confidence: '高',
  },
]
