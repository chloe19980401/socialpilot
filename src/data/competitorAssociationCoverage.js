// 竞品与协会关系、论坛/峰会/标准活动证据库。
// 所有记录均来自协会或品牌官方页面；活动频率仅代表本轮已核验样本，不代表完整历史次数。
export const ASSOCIATION_COVERAGE_AUDIT_DATE = '2026-11-19'

export const ASSOCIATION_RELATIONSHIP_TYPES = ['正式会员', '董事会 / 行业伙伴', '工作组 / 标准生态', '认证生态']
export const ASSOCIATION_EVENT_ROLES = ['主办 / 圆桌', '演讲 / 分享', '赞助', '参展 / 产品展示', '董事会 / 年会', '标准发布 / 工作组']

export const COMPETITOR_ASSOCIATION_COVERAGE = [
  relationship('schlage-csa', 'Schlage', 'association-csa', 'Connectivity Standards Alliance', '董事会 / 行业伙伴', '母公司', 'Allegion 为 CSA 董事会成员；Schlage 属于其门锁品牌，本条按母公司范围标注。', '2026-02-26', 'https://csa-iot.org/newsroom/introducing-aliro-1-0-a-unified-standard-to-transform-the-access-control-ecosystem/'),
  relationship('yale-csa', 'Yale Home', 'association-csa', 'Connectivity Standards Alliance', '董事会 / 行业伙伴', '母公司', 'ASSA ABLOY 加入联盟董事会，官方公告明确覆盖 Yale 品牌生态。', '2022-02-03', 'https://csa-iot.org/newsroom/assa-abloy-joins-board/'),
  relationship('kwikset-csa', 'Kwikset', 'association-csa', 'Connectivity Standards Alliance', '认证生态', '品牌', 'Kwikset 被列为 Aliro 1.0 首批预期认证企业之一；不等同董事会成员。', '2026-02-26', 'https://csa-iot.org/newsroom/introducing-aliro-1-0-a-unified-standard-to-transform-the-access-control-ecosystem/'),
  relationship('aqara-csa', 'Aqara', 'association-csa', 'Connectivity Standards Alliance', '工作组 / 标准生态', '品牌', 'Aqara 官方说明其参与 Matter 社区及 Matter Working Group。', '2021-09-09', 'https://www.aqara.com/en/news/aqara-to-support-matter-a-new-connectivity-standard/'),
  relationship('nuki-csa', 'Nuki', 'association-csa', 'Connectivity Standards Alliance', '认证生态', '品牌', 'Nuki Home Solutions 被列为 Aliro 1.0 首批预期认证企业之一。', '2026-02-26', 'https://csa-iot.org/newsroom/introducing-aliro-1-0-a-unified-standard-to-transform-the-access-control-ecosystem/'),
  relationship('tuya-csa', 'Tuya Smart', 'association-csa', 'Connectivity Standards Alliance', '董事会 / 行业伙伴', '品牌', 'Tuya 官方以 CSA 董事会成员和 Promoter 身份参加会员会议并展示 Matter 方案。', '2023-06-19', 'https://www.tuya.com/news-details/tuya-smart-presents-latest-advances-of-its-solutions-for-matter-at-connectivity-standards-alliance-membership-meeting-Kcp1xmpdik2lc'),
  relationship('schlage-zwave', 'Schlage', 'association-zwave', 'Z-Wave Alliance', '正式会员', '品牌', 'Z-Wave Alliance 官方会员公司目录列出 Schlage。', '2026-11-19', 'https://z-wavealliance.org/z-wave-alliance-member-companies/'),
  relationship('yale-zwave', 'Yale Home', 'association-zwave', 'Z-Wave Alliance', '正式会员', '母公司 / 品牌', '联盟官方 CEDIA Expo 公告将 ASSA ABLOY（Yale）列为成员企业。', '2022-09-20', 'https://z-wavealliance.org/news_p/smart-home-solutions-showcased-by-z-wave-alliance-at-cedia-expo/'),
  relationship('kwikset-zwave', 'Kwikset', 'association-zwave', 'Z-Wave Alliance', '正式会员', '母公司 / 品牌', '官方会员页明确 Spectrum Brands HHI 旗下包含 Kwikset。', '2026-11-19', 'https://z-wavealliance.org/mem_company/spectrum-brands/'),
  relationship('schlage-bhma', 'Schlage', 'association-bhma', 'Builders Hardware Manufacturers Association', '董事会 / 行业伙伴', '母公司', 'Allegion 为 BHMA 董事会及行业伙伴；按 Schlage 母公司关系标注。', '2025-10-28', 'https://buildershardware.com/Portals/0/Files/News%20Coverage/2025/BHMA%20Announces%20Industry%20Partners%20Press%20Release.pdf?ver=2025-10-28-002413-777'),
  relationship('yale-bhma', 'Yale Home', 'association-bhma', 'Builders Hardware Manufacturers Association', '董事会 / 行业伙伴', '母公司', 'ASSA ABLOY 为 BHMA 董事会及行业伙伴；按 Yale 母公司关系标注。', '2025-10-28', 'https://buildershardware.com/About-Us/Leadership'),
  relationship('jeldwen-wdma', 'JELD-WEN', 'association-wdma', 'Window & Door Manufacturers Association', '董事会 / 行业伙伴', '品牌', 'WDMA 官方董事会名单列出 JELD-WEN 代表。', '2026-11-19', 'https://www.wdma.com/wdma-board-of-directors'),
  relationship('masonite-wdma', 'Masonite', 'association-wdma', 'Window & Door Manufacturers Association', '董事会 / 行业伙伴', '品牌', 'WDMA 官方资料记录 Masonite 代表担任董事及主席。', '2022-01-01', 'https://www.wdma.com/assets/docs/Policy_Agenda/2022%20WDMA%20National%20Policy%20Agenda.pdf'),
  relationship('andersen-wdma', 'Andersen Windows & Doors', 'association-wdma', 'Window & Door Manufacturers Association', '董事会 / 行业伙伴', '品牌', 'WDMA 当前董事会及执行委员会列出 Andersen 代表。', '2026-11-19', 'https://www.wdma.com/wdma-board-of-directors'),
  relationship('ultraloq-zwave', 'Ultraloq', 'association-zwave', 'Z-Wave Alliance', '认证生态', '品牌产品', '联盟 ISC West 活动展示 XThings 的 Ultraloq Bolt Z-Wave；仅证明产品生态与活动展示，不据此声明正式会员。', '2026-03-24', 'https://z-wavealliance.org/isc-west-2026-z-wave-smart-security/'),
]

export const COMPETITOR_ASSOCIATION_EVENTS = [
  event('hormann-bau-2025', 'Hormann', 'event-bau', 'BAU', 'BAU 2025', '建筑展会', '2025-01-13', '参展 / 产品展示', '在 B3 馆 302 展位以超过 1,600 平方米展区展示门、门框、车库门和驱动系统。', 'https://www.hoermann.de/presse/detail/hoermann-praesentiert-sich-gewohnt-vielfaeltig-auf-der-bau-2025-ein-klares-ja-zur-messeteilnahme/'),
  event('barausse-salone-2026', 'Barausse', 'event-salone-del-mobile', 'Salone del Mobile.Milano', 'Salone del Mobile 2026', '家具与设计展会', '2026-04-21', '参展 / 产品展示', '在 14 号馆 B26 展位展示室内门、隔断系统与整体空间方案。', 'https://www.barausse.com/en/barausse-x-salone-del-mobile_111_12'),
  event('dierre-fuorisalone-2022', 'Dierre', 'event-milan-design-week', 'Milano Design Week', 'Fuorisalone 2022', '设计周活动', '2022-06-07', '主办 / 圆桌', '在米兰设计周期间通过合作展厅展示安全门、室内门与空间解决方案；按展期品牌活动记录。', 'https://www.dierre.com/en/salone-del-mobile/'),
  event('oikos-salone-2025', 'Oikos', 'event-salone-del-mobile', 'Salone del Mobile.Milano', 'Salone del Mobile 2025', '家具与设计展会', '2025-04-08', '参展 / 产品展示', '品牌官方确认参加 Salone del Mobile 2025，展示入口建筑与高端入户门方案。', 'https://oikos.it/en/news/oikos-at-salone-del-mobile-2025/'),
  event('andersen-ibs-2026', 'Andersen Windows & Doors', 'event-ibs', 'NAHB International Builders’ Show', 'IBS 2026', '建筑展会', '2026-02-17', '参展 / 产品展示', '参加面向住宅建筑、定制建造、设计和改造专业人士的 IBS 2026，并在多个专业专区持续展示门窗方案。', 'https://www.andersenwindows.com/for-professionals/nahb-ibs'),
  event('oikos-bau-2025', 'Oikos', 'event-bau', 'BAU', 'BAU 2025', '建筑展会', '2025-01-13', '参展 / 产品展示', '在 526 号展位发布新的入口建筑和滑动入户门 Vela。', 'https://oikos.it/en/event/appointments-2025-the-new-oikos-entrance-architecture-unveiled-at-bau-munich-and-wdf-riyadh-come-discover-it/'),
  event('oikos-wdf-2025', 'Oikos', 'event-wdf-riyadh', 'Windows, Doors & Facades', 'WDF Riyadh 2025', '门窗幕墙展会', '2025-02-24', '参展 / 产品展示', '在 NO-3D51 展位展示高端入户门和入口建筑解决方案。', 'https://oikos.it/en/event/appointments-2025-the-new-oikos-entrance-architecture-unveiled-at-bau-munich-and-wdf-riyadh-come-discover-it/'),
  event('pirnar-dom-2025', 'Pirnar', 'event-dom-fair', 'DOM Fair Ljubljana', '63rd DOM Fair 2025', '建筑家居展会', '2025-03-05', '参展 / 产品展示', '在斯洛文尼亚大型建筑展展示铝制与木制入户门、OneTouch 自动把手及 CarbonCore 门体。', 'https://www.pirnar.si/sejmi-dogodki/pirnar-na-sejmu-dom-z-bogatim-izborom-vhodnih-vrat'),
  event('garofoli-fuorisalone-2025', 'Garofoli', 'event-milan-design-week', 'Milano Design Week', 'Fuorisalone 2025', '设计周活动', '2025-04-08', '主办 / 圆桌', '在米兰设计周期间于品牌店展示室内门、护墙板、滑动系统与整体空间方案；属于展期品牌活动。', 'https://www.garofoli.com/it/garofoli-al-fuori-salone-2025/'),
  event('salto-iscwest-2026', 'SALTO Systems', 'event-isc-west', 'ISC West', 'ISC West 2026', '安防展会', '2026-03-25', '参展 / 产品展示', '在 13074 号展位展示门禁、智能锁和身份管理创新方案。', 'https://saltosystems.com/en-us/news/salto-showcase-its-latest-access-and-smart-locking-innovations-isc-west-las-vegas/'),
  event('hid-iscwest-2026', 'HID', 'event-isc-west', 'ISC West', 'ISC West 2026', '安防展会', '2026-03-25', '参展 / 产品展示', 'ASSA ABLOY 集团旗下独立品牌 HID 在 9053 号展位展示身份、门禁和安全发行方案。', 'https://newsroom.hidglobal.com/es/node/40582'),
  event('suprema-intersec-2025', 'Suprema', 'event-intersec', 'Intersec', 'Intersec 2025', '安防展会', '2025-01-14', '参展 / 产品展示', '展示企业级生物识别门禁、移动凭证和统一安防平台。', 'https://www.supremainc.com/jp/about/news-detail.asp?News_Type=&iBOARD_CONT_NO=7399&iNextPg=-22'),
  event('axis-iscwest-2024', 'Axis Communications', 'event-isc-west', 'ISC West', 'ISC West 2024', '安防展会', '2024-04-10', '参展 / 产品展示', '在 14051 号展位展示视频监控、音频、分析、门禁控制器及合作伙伴生态。', 'https://www.americas-comms.axis.com/isc-west-2024'),
  event('genetec-iscwest-2025', 'Genetec', 'event-isc-west', 'ISC West', 'ISC West 2025', '安防展会', '2025-04-01', '参展 / 产品展示', '在 13062 号展位展示 Security Center SaaS、门禁控制与入侵管理方案。', 'https://www.genetec.com/press-center/press-releases/2025/03/genetec-to-showcase-latest-innovations-at-isc-west-2025'),
  event('gallagher-iscwest-2025', 'Gallagher Security', 'event-isc-west', 'ISC West', 'ISC West 2025', '安防展会', '2025-04-01', '参展 / 产品展示', '在 28045 号展位展示门禁、入侵与周界安全方案，并发布 QuickSwitch。', 'https://security.gallagher.com/en/News/Gallagher-Security-gears-up-for-a-people-first-ISC-West-2025-and-hints-at-new-product-reveals'),
  event('geze-bau-2025', 'GEZE', 'event-bau', 'BAU', 'BAU 2025', '建筑展会', '2025-01-13', '参展 / 产品展示', '在 B1 馆展位展示智能门窗、门控自动化、防火与无障碍通行方案。', 'https://www.geze.com/en/newsroom/geze-at-bau-2025'),
  event('assa-security-au-2026', 'ASSA ABLOY', 'event-asial-security', 'ASIAL Security Exhibition & Conference', 'Security Exhibition & Conference 2026', '安防展会', '2026-09-02', '参展 / 产品展示', '集团旗下 HID、Entrance Systems、SKIDATA、VingCard 等实体在 D37 展位联合展示门禁与安防方案。', 'https://www.assaabloy.com/au/en/about-us/events/past-events/2026/asial-conference-2026'),
  event('assa-intersec-2026', 'ASSA ABLOY', 'event-intersec', 'Intersec', 'Intersec 2026', '安防展会', '2026-01-12', '参展 / 产品展示', '在 C43 展位展示数据中心安全、住宅门禁、PRIMO、Aperio、SMARTair 与安全门方案。', 'https://www.assaabloy.com/ae/en/campaigns/intersec-2026'),
  event('assa-security-essen-2026', 'ASSA ABLOY', 'event-security-essen', 'Security Essen', 'Security Essen 2026', '安防展会', '2026-09-22', '参展 / 产品展示', '在 6 号馆 C23 展位展示电子锁、门禁、逃生通道安全和关键基础设施方案。', 'https://www.assaabloy.com/de/de/stories/news/security-2026'),
  event('dormakaba-bau-2025', 'dormakaba', 'event-bau', 'BAU', 'BAU 2025', '建筑展会', '2025-01-13', '参展 / 产品展示', '展示面向建筑全生命周期的综合门禁、无障碍通行、能效和安全解决方案。', 'https://go.dormakaba.com/bg/bau'),
  event('dormakaba-iscwest-2025', 'dormakaba', 'event-isc-west', 'ISC West', 'ISC West 2025', '安防展会', '2025-04-01', '参展 / 产品展示', '展示从外围到门锁与保险柜锁的分层综合安防方案。', 'https://report.dormakaba.com/2024_25/app/uploads/dormakaba_Group_Management_Report_2024_25.pdf'),
  event('dormakaba-passenger-terminal-2025', 'dormakaba', 'event-passenger-terminal-expo', 'Passenger Terminal EXPO', 'Passenger Terminal EXPO 2025', '交通基建展会', '2025-04-08', '参展 / 产品展示', '在国际机场航站楼专业展会面向机场管理者、建筑师、工程师与供应商展示通行方案。', 'https://int.dormakaba.com/pt-pt/eventos'),
  event('allegion-iscwest-2025', 'Allegion', 'event-isc-west', 'ISC West', 'ISC West 2025', '安防展会', '2025-04-01', '参展 / 产品展示', 'Allegion Americas 与 Zentra 联合参展，展示门禁安全解决方案与技术。', 'https://www.allegion.com/corp/en/news/blog/2025/Allegion-out-and-about.html'),
  event('allegion-archifest-2025', 'Allegion', 'event-singapore-archifest', 'Singapore Institute of Architects', 'Singapore Archifest 2025', '建筑专业展会', '2025-06-25', '参展 / 产品展示', 'Allegion Southeast Asia 在新加坡建筑节展示建筑门控与安防方案。', 'https://www.allegion.com/corp/en/news/blog/2025/Allegion-out-and-about.html'),
  event('aqara-cedia-2026', 'Aqara', 'association-cedia', 'CEDIA', 'CEDIA Expo 2026', '展会', '2026-09-02', '参展 / 产品展示', '展示下一代空间感知与智能家居方案。', 'https://www.aqara.com/en/news/aqara-showcases-next-gen-spatial-sensing-solutions-at-cedia-expo-2026/'),
  event('aqara-cedia-2025', 'Aqara', 'association-cedia', 'CEDIA', 'CEDIA Expo / CIX 2025', '展会', '2025-09-04', '参展 / 产品展示', '在 729 号展位现场展示 Edge Hub M300 与专业安装生态。', 'https://www.aqara.com/en/news/aqara-unveils-professional-grade-edge-hub-m300-and-aqara-studio-connect-for-installers-and-integrators/'),
  event('aqara-matter-launch-2022', 'Aqara', 'association-csa', 'Connectivity Standards Alliance', 'Matter 全球发布会（阿姆斯特丹）', '标准发布会', '2022-11-03', '标准发布 / 工作组', 'Aqara Thread 传感器在 NXP 展台进行 Matter 展示。', 'https://www.aqara.com/eu/news-eu/aqara-releases-details-around-its-first-matter-compatible-devices/'),
  event('tuya-csa-membership-2023', 'Tuya Smart', 'association-csa', 'Connectivity Standards Alliance', 'CSA Membership Meeting Boston 2023', '会员会议', '2023-06-19', '参展 / 产品展示', '以董事会成员和 Promoter 身份展示 Matter 解决方案。', 'https://www.tuya.com/news-details/tuya-smart-presents-latest-advances-of-its-solutions-for-matter-at-connectivity-standards-alliance-membership-meeting-Kcp1xmpdik2lc'),
  event('tuya-matter-media-2022', 'Tuya Smart', 'association-csa', 'Connectivity Standards Alliance', 'Matter Global Media Conference 2022', '媒体论坛', '2022-11-03', '演讲 / 分享', '受 CSA 邀请参加阿姆斯特丹发布活动，展示并参与 Matter 生态讨论。', 'https://www.tuya.com/news-details/tuya-demonstrated-solutions-for-matter-at-the-matters-global-media-conference-to-build-an-open-and-smart-ecosystem-Kc2dfaq06pfdc'),
  event('tuya-ces-2023', 'Tuya Smart', 'association-csa', 'Connectivity Standards Alliance', 'Tuya Day · CES 2023', '峰会 / 圆桌', '2023-01-05', '主办 / 圆桌', '主办 Matter 生态与商业化主题圆桌，CSA 等组织参与。', 'https://www.tuya.com/news-details/tuya-and-partners-shared-insights-on-the-matter-ecosystem-and-its-application-scenarios-at-ces-2023-Kc8slmi7jz1b4'),
  event('tuya-ces-2024', 'Tuya Smart', 'association-csa', 'Connectivity Standards Alliance', 'Tuya Developer Day · CES 2024', '开发者峰会', '2024-01-10', '主办 / 圆桌', '主办开发者日，CSA、Thread Group、Bluetooth SIG 与 Wi-Fi Alliance 参与论坛。', 'https://www.tuya.com/news-details/tuya-developer-day-at-ces-2024-features-inspiring-panel-on-jointly-driving-smart-secure-connected-future-Kd99x4lwpoj6n'),
  event('tuya-ifa-2025', 'Tuya Smart', 'association-csa', 'Connectivity Standards Alliance', 'Tuya Global Developer Summit Europe · IFA 2025', '开发者峰会', '2025-09-08', '主办 / 圆桌', '在 IFA 主办欧洲开发者峰会，CSA 战略负责人发表主题演讲。', 'https://www.tuya.com/news-details/2025-tuya-global-developer-summit-europe-officially-opens-exploring-a-new-future-of-ai-applications-Kexjluj4ag3kc'),
  event('tuya-ces-2026', 'Tuya Smart', 'association-csa', 'Connectivity Standards Alliance', 'Tuya Developer Day · CES 2026', '开发者峰会', '2026-01-07', '主办 / 圆桌', '主办圆桌，Wi-Fi Alliance、Bluetooth SIG 与 CSA 共同参与。', 'https://www.tuya.com/news-details/Kf7j458r2uh5p'),
  event('yale-schlage-cedia-2022-yale', 'Yale Home', 'association-zwave', 'Z-Wave Alliance', 'CEDIA Expo 2022 · Z-Wave Interop Wall', '展会', '2022-09-20', '参展 / 产品展示', 'Yale 作为联盟成员品牌参与 Z-Wave 互操作展示。', 'https://z-wavealliance.org/news_p/smart-home-solutions-showcased-by-z-wave-alliance-at-cedia-expo/'),
  event('yale-schlage-cedia-2022-schlage', 'Schlage', 'association-zwave', 'Z-Wave Alliance', 'CEDIA Expo 2022 · Z-Wave Interop Wall', '展会', '2022-09-20', '参展 / 产品展示', 'Schlage 作为联盟成员参与 Z-Wave 互操作展示。', 'https://z-wavealliance.org/news_p/smart-home-solutions-showcased-by-z-wave-alliance-at-cedia-expo/'),
  event('yale-iscwest-2026', 'Yale Home', 'association-zwave', 'Z-Wave Alliance', 'ISC West 2026 · Z-Wave Pavilion', '安防展会', '2026-03-24', '赞助', 'Yale 为 Z-Wave Pavilion Gold Sponsor 并展示智能安防产品。', 'https://z-wavealliance.org/isc-west-2026-z-wave-smart-security/'),
  event('kwikset-iscwest-2026', 'Kwikset', 'association-zwave', 'Z-Wave Alliance', 'ISC West 2026 · Z-Wave Pavilion', '安防展会', '2026-03-24', '赞助', 'Kwikset 为 Z-Wave Pavilion Gold Sponsor。', 'https://z-wavealliance.org/isc-west-2026-z-wave-smart-security/'),
  event('ultraloq-iscwest-2026', 'Ultraloq', 'association-zwave', 'Z-Wave Alliance', 'ISC West 2026 · Z-Wave Pavilion', '安防展会', '2026-03-24', '参展 / 产品展示', 'XThings 展示 Ultraloq Bolt Z-Wave；按产品展示记录，不外推品牌会员身份。', 'https://z-wavealliance.org/isc-west-2026-z-wave-smart-security/'),
  event('schlage-bhma-2023', 'Schlage', 'association-bhma', 'Builders Hardware Manufacturers Association', 'BHMA Annual Fall Meeting 2023', '协会年会', '2023-10-18', '董事会 / 年会', 'Schlage 母公司 Allegion 代表在年度会议周期担任 BHMA 主席。', 'https://buildershardware.com/Portals/0/BHMA%202023-24%20Board%20of%20Directors%20Press%20Release.pdf'),
  event('yale-bhma-2023', 'Yale Home', 'association-bhma', 'Builders Hardware Manufacturers Association', 'BHMA Annual Fall Meeting 2023', '协会年会', '2023-10-18', '董事会 / 年会', 'Yale 母公司 ASSA ABLOY 代表进入 BHMA 董事会。', 'https://buildershardware.com/Portals/0/BHMA%202023-24%20Board%20of%20Directors%20Press%20Release.pdf'),
  event('andersen-wdma-tech', 'Andersen Windows & Doors', 'association-wdma', 'Window & Door Manufacturers Association', 'WDMA Technical & Manufacturing Conference', '技术论坛', '2023-06-01', '演讲 / 分享', 'Andersen 技术负责人在 WDMA 技术与制造会议获行业终身成就奖，并有长期委员会/标准工作。', 'https://www.wdma.com/index.php?category=news&id=9%3Awdma-recognizes-mark-mikkelson-with-the-james-krahn-lifetime-achievement-award&option=com_dailyplanetblog&view=entry'),
  event('masonite-wdma-board-2021', 'Masonite', 'association-wdma', 'Window & Door Manufacturers Association', 'WDMA Board Meeting 2021', '董事会会议', '2021-02-01', '董事会 / 年会', 'Masonite 代表以 WDMA 卸任主席身份参加领导层交接。', 'https://www.wdma.com/index.php?category=news&id=2%3Awdma-announces-new-leadership-team-2021&option=com_dailyplanetblog&view=entry'),
]

const EXHIBITION_RELATIONS = {
  'hormann-bau-2025': { exhibition: 'BAU 2025', exhibitionRelation: '确认参展', venueDetail: 'Hall B3 · Stand 302 · 1,600+ m²' },
  'barausse-salone-2026': { exhibition: 'Salone del Mobile 2026', exhibitionRelation: '确认参展', venueDetail: 'Hall 14 · Booth B26' },
  'dierre-fuorisalone-2022': { exhibition: 'Milano Design Week 2022', exhibitionRelation: '展会同期主办活动', venueDetail: '米兰合作展厅 · 品牌展示活动' },
  'oikos-salone-2025': { exhibition: 'Salone del Mobile 2025', exhibitionRelation: '确认参展', venueDetail: '品牌官方参展公告' },
  'andersen-ibs-2026': { exhibition: 'IBS 2026', exhibitionRelation: '确认参展', venueDetail: 'Orange County Convention Center · 多个专业专区' },
  'oikos-bau-2025': { exhibition: 'BAU 2025', exhibitionRelation: '确认参展', venueDetail: 'Stand 526' },
  'oikos-wdf-2025': { exhibition: 'WDF Riyadh 2025', exhibitionRelation: '确认参展', venueDetail: 'Stand NO-3D51' },
  'pirnar-dom-2025': { exhibition: '63rd DOM Fair 2025', exhibitionRelation: '确认参展', venueDetail: 'Ljubljana Exhibition and Convention Centre' },
  'garofoli-fuorisalone-2025': { exhibition: 'Milano Design Week 2025', exhibitionRelation: '展会同期主办活动', venueDetail: 'Garofoli Store · Via Santa Sofia 21' },
  'salto-iscwest-2026': { exhibition: 'ISC West 2026', exhibitionRelation: '确认参展', venueDetail: 'Booth 13074' },
  'hid-iscwest-2026': { exhibition: 'ISC West 2026', exhibitionRelation: '确认参展', venueDetail: 'Booth 9053 · ASSA ABLOY 旗下品牌' },
  'suprema-intersec-2025': { exhibition: 'Intersec 2025', exhibitionRelation: '确认参展', venueDetail: 'Dubai World Trade Centre · 企业安防展区' },
  'axis-iscwest-2024': { exhibition: 'ISC West 2024', exhibitionRelation: '确认参展', venueDetail: 'Booth 14051' },
  'genetec-iscwest-2025': { exhibition: 'ISC West 2025', exhibitionRelation: '确认参展', venueDetail: 'Booth 13062' },
  'gallagher-iscwest-2025': { exhibition: 'ISC West 2025', exhibitionRelation: '确认参展', venueDetail: 'Booth 28045' },
  'geze-bau-2025': { exhibition: 'BAU 2025', exhibitionRelation: '确认参展', venueDetail: 'Hall B1 · 品牌展位' },
  'assa-security-au-2026': { exhibition: 'Security Exhibition & Conference 2026', exhibitionRelation: '确认参展', venueDetail: 'ICC Sydney · Stand D37' },
  'assa-intersec-2026': { exhibition: 'Intersec 2026', exhibitionRelation: '确认参展', venueDetail: 'Sheikh Saeed Hall 2 · Stand C43' },
  'assa-security-essen-2026': { exhibition: 'Security Essen 2026', exhibitionRelation: '确认参展', venueDetail: 'Hall 6 · Stand C23' },
  'dormakaba-bau-2025': { exhibition: 'BAU 2025', exhibitionRelation: '确认参展', venueDetail: '品牌官方 BAU 专题展台' },
  'dormakaba-iscwest-2025': { exhibition: 'ISC West 2025', exhibitionRelation: '确认参展', venueDetail: '集团年报确认现场展示' },
  'dormakaba-passenger-terminal-2025': { exhibition: 'Passenger Terminal EXPO 2025', exhibitionRelation: '确认参展', venueDetail: 'IFEMA Feria de Madrid' },
  'allegion-iscwest-2025': { exhibition: 'ISC West 2025', exhibitionRelation: '确认参展', venueDetail: 'Allegion Americas × Zentra' },
  'allegion-archifest-2025': { exhibition: 'Singapore Archifest 2025', exhibitionRelation: '确认参展', venueDetail: 'Sands Expo and Convention Center' },
  'aqara-cedia-2026': { exhibition: 'CEDIA Expo 2026', exhibitionRelation: '确认参展', venueDetail: '品牌官方展示下一代空间感知方案' },
  'aqara-cedia-2025': { exhibition: 'CEDIA Expo / CIX 2025', exhibitionRelation: '确认参展', venueDetail: '729 号展位' },
  'tuya-ces-2023': { exhibition: 'CES 2023', exhibitionRelation: '展会同期主办活动', venueDetail: 'Tuya Day 与 Matter 生态圆桌' },
  'tuya-ces-2024': { exhibition: 'CES 2024', exhibitionRelation: '展会同期主办活动', venueDetail: 'Tuya Developer Day' },
  'tuya-ifa-2025': { exhibition: 'IFA 2025', exhibitionRelation: '展会同期主办活动', venueDetail: 'Tuya Global Developer Summit Europe' },
  'tuya-ces-2026': { exhibition: 'CES 2026', exhibitionRelation: '展会同期主办活动', venueDetail: 'Tuya Developer Day 与联盟圆桌' },
  'yale-schlage-cedia-2022-yale': { exhibition: 'CEDIA Expo 2022', exhibitionRelation: '确认参展', venueDetail: 'Z-Wave Interop Wall' },
  'yale-schlage-cedia-2022-schlage': { exhibition: 'CEDIA Expo 2022', exhibitionRelation: '确认参展', venueDetail: 'Z-Wave Interop Wall' },
  'yale-iscwest-2026': { exhibition: 'ISC West 2026', exhibitionRelation: '展区赞助', venueDetail: 'Z-Wave Pavilion Gold Sponsor' },
  'kwikset-iscwest-2026': { exhibition: 'ISC West 2026', exhibitionRelation: '展区赞助', venueDetail: 'Z-Wave Pavilion Gold Sponsor' },
  'ultraloq-iscwest-2026': { exhibition: 'ISC West 2026', exhibitionRelation: '产品随生态伙伴展示', venueDetail: 'XThings 展示 Ultraloq Bolt Z-Wave' },
}

// 展会参与需单独区分：参展/展区赞助可视为明确展会参与；
// “展会同期主办活动”只证明品牌在展期举办论坛，不外推为官方参展商。
export const COMPETITOR_EXHIBITION_EVENTS = COMPETITOR_ASSOCIATION_EVENTS
  .filter((item) => EXHIBITION_RELATIONS[item.id])
  .map((item) => ({ ...item, ...EXHIBITION_RELATIONS[item.id] }))

export const EXHIBITION_RELATION_TYPES = ['确认参展', '展区赞助', '产品随生态伙伴展示', '展会同期主办活动']

function relationship(id, competitor, associationId, association, relationshipType, scope, evidence, evidenceDate, sourceUrl) {
  return { id, competitor, associationId, association, relationshipType, scope, evidence, evidenceDate, sourceUrl, confidence: '高' }
}

function event(id, competitor, associationId, association, eventName, eventType, eventDate, role, participation, sourceUrl) {
  return { id, competitor, associationId, association, eventName, eventType, eventDate, role, participation, sourceUrl, confidence: '高' }
}
