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
  {
    id: 'youtube-shane-whatley-nuki-2025', platform: 'YouTube', creator: 'Shane Whatley', handle: '@ShaneCreates', competitor: 'Nuki', publishedAt: '2025-07-02',
    title: "Europe's Favorite Smart Lock Just Hit the U.S.—Here's What I Think", url: 'https://www.youtube.com/watch?v=W0EXlJft_wI',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“Video is sponsored by Nuki”，并提供专属折扣码与联盟链接。', collaborationConfirmed: true,
    followers: 184000, views: 161654, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-un-loco-nuki-2025', platform: 'YouTube', creator: 'Un loco y su tecnología', handle: '@UnlocoysuTecnologia', competitor: 'Nuki', publishedAt: '2025-11-18',
    title: 'Nuki Smart Lock Pro 5 after 6 months: the REAL truth', url: 'https://www.youtube.com/watch?v=q1YpoVZScsg',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“Video sponsored by Nuki. The script and opinions are my own.”并提供折扣码。', collaborationConfirmed: true,
    followers: 206000, views: 44076, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-soldier-knows-best-kwikset-2017', platform: 'YouTube', creator: 'Soldier Knows Best', handle: '@SoldierKnowsBest', competitor: 'Kwikset', publishedAt: '2017-01-08',
    title: 'I Never Wanted a Smart Lock Until Now! (Kwikset)', url: 'https://www.youtube.com/watch?v=OIMwdI9giFs',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“Sponsored by Kwikset”。', collaborationConfirmed: true,
    followers: 807000, views: 101820, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-gregglestv-kwikset-2021', platform: 'YouTube', creator: 'GregglesTV', handle: '@GregglesTV', competitor: 'Kwikset', publishedAt: '2021-01-27',
    title: 'Kwikset Halo Touch Wi-Fi Enabled Fingerprint Smart Lock Review', url: 'https://www.youtube.com/watch?v=mABHGUMS-iE',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“Video Sponsored by Kwikset”，并披露联盟链接。', collaborationConfirmed: true,
    followers: 168000, views: 5930, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-pipl-systems-yale-2025', platform: 'YouTube', creator: 'Pipl Systems', handle: '@PiplSystems', competitor: 'Yale Home', publishedAt: '2025-09-24',
    title: 'Choosing the Right Yale Smart Lock', url: 'https://www.youtube.com/watch?v=DRVWU2EKMH8',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“This is a sponsored video”，并列出多款 Yale 智能锁与联盟链接。', collaborationConfirmed: true,
    followers: 37300, views: 5975, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-colleen-pastoor-schlage-2019', platform: 'YouTube', creator: 'Colleen Pastoor', handle: '@ColleenPastoor', competitor: 'Schlage', publishedAt: '2019-04-29',
    title: 'How To Install A Smart Door Lock | Schlage Sense + Entry Makeover', url: 'https://www.youtube.com/watch?v=Dhw-2h6q0bY',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“This video is sponsored by Schlage Canada”。', collaborationConfirmed: true,
    followers: 47400, views: 4690, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-life-at-cloverhill-schlage-2019', platform: 'YouTube', creator: 'Life at Cloverhill', handle: '@LifeatCloverhill', competitor: 'Schlage', publishedAt: '2019-02-18',
    title: 'Updating Our Door Hardware | Sponsored by Schlage Canada', url: 'https://www.youtube.com/watch?v=0ENEn8sE5_g',
    evidenceType: '明确赞助', relationship: '标题明确披露由 Schlage Canada 赞助，内容展示整套外门五金和 Schlage Sense。', collaborationConfirmed: true,
    followers: 3830, views: 1197, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-zollotech-level-lock-2020', platform: 'YouTube', creator: 'zollotech', handle: '@zollotech', competitor: 'Level Home', publishedAt: '2020-04-30',
    title: 'Level Lock Invisible Smart Lock - Install and Review', url: 'https://www.youtube.com/watch?v=rLQDx4MMsgg',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“This video is sponsored by Level Lock. All opinions are my own.”', collaborationConfirmed: true,
    followers: 2170000, views: 54983, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-paul-hibbert-tuya-2021', platform: 'YouTube', creator: 'Paul Hibbert (Hibbert Home Tech)', handle: '@paulhibbert', competitor: 'Tuya Smart', publishedAt: '2021-07-24',
    title: "Tuya's New Home Assistant Integration Just Saved The Smart Home Industry", url: 'https://www.youtube.com/watch?v=cd4aUJJl_s0',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“This video is sponsored by Tuya, all opinions are my own.”', collaborationConfirmed: true,
    followers: 289000, views: 173634, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-paul-hibbert-reolink-2025', platform: 'YouTube', creator: 'Paul Hibbert (Hibbert Home Tech)', handle: '@paulhibbert', competitor: 'Reolink', publishedAt: '2025-01-18',
    title: 'Reolink cameras and Home Assistant security system', url: 'https://www.youtube.com/watch?v=6B_xpP1KP4o',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“This video is sponsored by Reolink, all opinions are my own”，并列出多款摄像机和 NVR。', collaborationConfirmed: true,
    followers: 288000, views: 194668, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-matt-risinger-jeldwen-2021', platform: 'YouTube', creator: 'Matt Risinger', handle: '@buildshow', competitor: 'JELD-WEN', publishedAt: '2021-01-05',
    title: 'High-Performance Entry DOOR INSTALL: Start to Finish', url: 'https://www.youtube.com/watch?v=H97MqwueL-Y',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“In this video, sponsored by Jeld-Wen”，并完整演示 IWP Aurora 玻璃纤维入户门安装。', collaborationConfirmed: true,
    followers: 1230000, views: 92067, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-cozy-diy-home-masonite-2018', platform: 'YouTube', creator: 'Cozy DIY Home', handle: '@TheDIYMommy', competitor: 'Masonite', publishedAt: '2018-02-07',
    title: 'How To Paint & Install Interior Doors', url: 'https://www.youtube.com/watch?v=XPORgh0TFKc',
    evidenceType: '明确赞助', relationship: '视频简介 Disclosure 明确写明“This video is sponsored by Masonite”，并展示 Heritage Winslow 室内门。', collaborationConfirmed: true,
    followers: 852000, views: 11938, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-twincitieslive-andersen-2025', platform: 'YouTube', creator: 'Twin Cities Live', handle: '@TwinCitiesLiveKSTP', competitor: 'Andersen Windows & Doors', publishedAt: '2025-08-13',
    title: 'Andersen Storm Door Makeover', url: 'https://www.youtube.com/watch?v=MJEmRtY7tlI',
    evidenceType: '明确赞助', relationship: '标题明确披露“Sponsored by Andersen Windows & Doors”，内容为风暴门改造。', collaborationConfirmed: true,
    followers: 1310, views: 84, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-toolbox-divas-lockly-2021', platform: 'YouTube', creator: 'ToolBox Divas', handle: '@Toolboxdiva', competitor: 'Lockly', publishedAt: '2021-10-10',
    title: 'Unexpected Challenges When I Installed a Smart Lock | Patio Door Refresh', url: 'https://www.youtube.com/watch?v=lve-5PXDH2s',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“This video is sponsored by Lockly”，并提供专属优惠码。', collaborationConfirmed: true,
    followers: 35500, views: 1136, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-is-it-worth-it-kwikset-halo-2023', platform: 'YouTube', creator: 'Is It Worth It?', handle: '@IsItWorthItReviews', competitor: 'Kwikset', publishedAt: '2023-04-10',
    title: 'Should You Buy? Kwikset Halo Smart Door Lock', url: 'https://www.youtube.com/watch?v=uDqU61TI02M',
    evidenceType: '明确赞助', relationship: '视频简介 FTC 披露明确写明“This video is sponsored by Kwikset”，同时披露联盟链接佣金。', collaborationConfirmed: true,
    followers: 59800, views: 7498, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-cjknowstech-eufy-e30-2024', platform: 'YouTube', creator: 'CJKnowsTECH', handle: '@CJKnowsTECH', competitor: 'eufy Security', publishedAt: '2024-09-25',
    title: 'Unlock Your Home LIKE NEVER BEFORE eufy Smat Lock E30', url: 'https://www.youtube.com/watch?v=1lyEBgG1Xo4',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“This video is sponsored by eufy”，并提供 eufyLockE30 专属优惠码。', collaborationConfirmed: true,
    followers: 156000, views: 61079, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-justin-tse-aqara-living-room-2024', platform: 'YouTube', creator: 'Justin Tse', handle: '@JustinTse', competitor: 'Aqara', publishedAt: '2024-11-29',
    title: 'My Modern Tech Living Room Tour // The Ultimate Dream Condo (2024)', url: 'https://www.youtube.com/watch?v=jPP3_hoiZWA',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“Thanks to #aqara for sponsoring this video”，并提供官方活动链接。', collaborationConfirmed: true,
    followers: 971000, views: 620027, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-paul-hibbert-aqara-2023', platform: 'YouTube', creator: 'Paul Hibbert (Hibbert Home Tech)', handle: '@paulhibbert', competitor: 'Aqara', publishedAt: '2023-09-23',
    title: 'Best Smart Home System For Beginners', url: 'https://www.youtube.com/watch?v=UUZX5MA7klA',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“This video is sponsored by Aqara, all opinions are my own”，并含专属折扣码。', collaborationConfirmed: true,
    followers: 288000, views: 56082, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-hands-on-katie-reolink-2025', platform: 'YouTube', creator: 'Hands On Katie', handle: '@handsonkatie', competitor: 'Reolink', publishedAt: '2025-08-19',
    title: 'Local AI Cameras Are Finally Here (No Cloud, No Subscriptions): Reolink Elite Floodlight Wifi', url: 'https://www.youtube.com/watch?v=AQA31kRKMhY',
    evidenceType: '明确赞助', relationship: '视频简介大写披露“THANKS TO REOLINK FOR SPONSORING THIS VIDEO!”，并提供 Katie5 专属优惠码。', collaborationConfirmed: true,
    followers: 82400, views: 27409, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-frankie-off-grid-reolink-2026', platform: 'YouTube', creator: 'Frankie Off Grid', handle: '@FrankieOffGrid', competitor: 'Reolink', publishedAt: '2026-01-03',
    title: 'A Quiet Beginning to the New Year on Our Homestead | Family, Fire & Fresh Beginnings', url: 'https://www.youtube.com/watch?v=sqg1Z_rd_Fg',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“Thanks to Reolink for sponsoring today’s video”，并提供 FrankieOffGrid 专属优惠码。', collaborationConfirmed: true,
    followers: 75100, views: 30083, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-uravgconsumer-switchbot-2024', platform: 'YouTube', creator: 'UrAvgConsumer', handle: '@UrAvgConsumer', competitor: 'SwitchBot', publishedAt: '2024-11-20',
    title: 'Teching Out A New Home! - The First Upgrade!', url: 'https://www.youtube.com/watch?v=wm_1PncVG5k',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“Thanks to SwitchBot for sponsoring this video”。', collaborationConfirmed: true,
    followers: 3450000, views: 428204, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-paul-hibbert-switchbot-2024', platform: 'YouTube', creator: 'Paul Hibbert (Hibbert Home Tech)', handle: '@paulhibbert', competitor: 'SwitchBot', publishedAt: '2024-11-30',
    title: 'Bezos Wants You To Pay For Alexa+ ... I Got It Early...', url: 'https://www.youtube.com/watch?v=3av6tlinbAI',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“This video is sponsored by Switchbot, all opinions are my own”。', collaborationConfirmed: true,
    followers: 289000, views: 103695, metricsAsOf: '2026-11-19', confidence: '高',
  },
  {
    id: 'youtube-paul-hibbert-reolink-doorbell-2024', platform: 'YouTube', creator: 'Paul Hibbert (Hibbert Home Tech)', handle: '@paulhibbert', competitor: 'Reolink', publishedAt: '2024-11-09',
    title: "I've dumped Nest For Good : Reolink Doorbell", url: 'https://www.youtube.com/watch?v=xxpzriDcMUY',
    evidenceType: '明确赞助', relationship: '视频简介明确写明“This video is sponsored by Reolink, all opinions are my own”，并披露联盟链接。', collaborationConfirmed: true,
    followers: 289000, views: 139912, metricsAsOf: '2026-11-19', confidence: '高',
  },
]
