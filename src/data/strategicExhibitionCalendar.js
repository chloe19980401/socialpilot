// 2027–2028 建材与门窗目标展会日历。
// 日期、地点和定位仅采用主办方已公开的信息；本表是市场规划库，不代表竞品已确认参展。
export const STRATEGIC_EXHIBITION_AUDIT_DATE = '2026-11-23'

export const EXHIBITION_INDUSTRY_CATEGORIES = ['建材', '窗', '门', '幕墙', '智能建筑', '安防']
export const EXHIBITION_DETAIL_CATEGORY_LABELS = {
  door: '门类', smartLock: '智能锁', engineeringDoor: '工程门', fireDoor: '防火门',
  window: '窗类', curtainWall: '幕墙', smartHome: '智能家居', security: '安防', buildingMaterials: '综合建材',
}
export const EXHIBITION_SCOPE_LEVELS = ['区域性', '国家性']
export const EXHIBITION_CALENDAR_YEARS = ['2027', '2028']
export const EXHIBITION_REGISTRATION_STATES = ['报名已开放', '报名待开放', '报名时间待公布']

export const STRATEGIC_EXHIBITION_CALENDAR = [
  plannedExhibition({
    id: 'plan-bau-2027', exhibition: 'BAU 2027', eventDate: '2027-01-11', eventDateEnd: '2027-01-15', country: '德国', city: '慕尼黑', venue: 'Messe München', region: '欧洲',
    organizer: 'Messe München', categories: ['建材', '窗', '门', '幕墙', '智能建筑'], scopeLevel: '国家性', influenceTier: '全球旗舰',
    influenceBasis: '德国国家级建筑材料与系统展，同时具有全球采购影响力；作为国家级标杆样本保留。', audience: '建筑师、开发商、承包商、建材渠道、门窗幕墙及建筑系统采购',
    wonlyFit: '高', wonlyUse: '适合门、窗、智能锁和入口系统进入欧洲建筑设计与工程渠道。', scale: '官方称世界领先的建筑、材料与系统展',
    sourceUrl: 'https://bau-muenchen.com/en/trade-fair/', venueDetail: '完整 2027 档期已公布', dateStatus: '日期已公布', priority: '国家性补充',
  }),
  plannedExhibition({
    id: 'plan-ibs-2027', exhibition: 'NAHB International Builders’ Show 2027', aliases: ['IBS 2027', '国际建筑商展'], eventDate: '2027-02-02', eventDateEnd: '2027-02-04', country: '美国', city: '拉斯维加斯', venue: 'Las Vegas Convention Center', region: '北美',
    organizer: 'NAHB', categories: ['建材', '窗', '门', '智能建筑'], scopeLevel: '国家性', influenceTier: '全球旗舰',
    influenceBasis: '北美住宅建造行业旗舰展，官方披露覆盖 78,000+ 专业人士及 1,700+ 企业与品牌。', audience: '住宅建造商、开发商、建筑师、经销商、安装商与采购决策者',
    wonlyFit: '高', wonlyUse: '适合进入北美住宅门、窗、智能锁和渠道合作网络。', scale: '78,000+ 专业人士；1,700+ 企业与品牌',
    sourceUrl: 'https://www.buildersshow.com/about-ibs/', venueDetail: 'Las Vegas Convention Center', dateStatus: '日期已公布', priority: '国家性补充',
    registrationStatus: '观众报名已开放 · 早鸟截止 2026-12-11 · 常规价截止 2027-01-30', registrationState: '报名已开放', registrationUrl: 'https://www.buildersshow.com/fees-and-deadlines',
  }),
  plannedExhibition({
    id: 'plan-uzbuild-2027', exhibition: 'UzBuild 2027', aliases: ['乌兹别克斯坦国际建筑展'], eventDate: '2027-03-16', eventDateEnd: '2027-03-18', country: '乌兹别克斯坦', city: '塔什干', venue: 'Uzexpocentre NEC', region: '中亚',
    organizer: 'Iteca Exhibitions', categories: ['建材', '窗', '门', '智能建筑'], scopeLevel: '区域性', influenceTier: '区域核心',
    influenceBasis: '中亚建筑行业旗舰 B2B 展；官方披露上届 450 家企业、11,000+ 专业观众。', audience: '建材制造商、经销商、开发商、承包商、建筑师与政府项目方',
    wonlyFit: '高', wonlyUse: '适合中亚项目门、经销渠道和建筑五金合作。', scale: '450 家企业；11,000+ 专业观众',
    sourceUrl: 'https://uzbuild.uz/en/about-exhibition', venueDetail: 'Uzexpocentre NEC', dateStatus: '日期已公布', priority: '区域优先',
    registrationStatus: '展位申请与专业观众登记已开放 · 截止日期未公布', registrationState: '报名已开放', registrationUrl: 'https://uzbuild.uz/en/stand-reservation',
  }),
  plannedExhibition({
    id: 'plan-big5-uzbekistan-2027', exhibition: 'Big 5 Construct Uzbekistan 2027', aliases: ['乌兹别克斯坦五大行业展'], eventDate: '2027-10-27', eventDateEnd: '2027-10-29', country: '乌兹别克斯坦', city: '塔什干', venue: 'CAEx', region: '中亚',
    organizer: 'dmg events', categories: ['建材', '窗', '门', '智能建筑'], scopeLevel: '区域性', influenceTier: '区域核心',
    influenceBasis: 'dmg events 于 2027 年首次在乌兹别克斯坦举办 Big 5 Construct，并与 INDEX Uzbekistan 同期连接中亚建筑及室内采购；首届潜力高，但尚无真实往届实绩。', audience: '开发商、承包商、建筑师、工程顾问、建材经销商、政府及项目采购',
    wonlyFit: '高', wonlyUse: '适合中亚工程门、智能入口、建材渠道及 Big 5 国际采购生态拓展。', scale: '2027 首届；暂无上一届真实展商与观众数据',
    sourceUrl: 'https://www.dmgevents.com/media-pr/2026/october/dmg-events-brings-big-5-construct-and-index-to-uzbekistan-expanding-international-construction-and-interiors-connections-in-central-asia/', venueDetail: 'CAEx · 与 INDEX Uzbekistan 同期', dateStatus: '日期已公布', priority: '区域优先',
    registrationStatus: '首届展会已官宣 · 展位申请及观众登记截止时间待主办方公布', registrationState: '报名时间待公布', registrationUrl: 'https://www.dmgevents.com/media-pr/2026/october/dmg-events-brings-big-5-construct-and-index-to-uzbekistan-expanding-international-construction-and-interiors-connections-in-central-asia/',
    maturity: '首届待验证',
  }),
  plannedExhibition({
    id: 'plan-mosbuild-2027', exhibition: 'MosBuild 2027', aliases: ['莫斯科国际建材展'], eventDate: '2027-03-30', eventDateEnd: '2027-04-02', country: '俄罗斯', city: '莫斯科', venue: 'Crocus Expo', region: '东欧 / 独联体',
    organizer: 'ITE Group', categories: ['建材', '窗', '门', '智能建筑'], scopeLevel: '区域性', influenceTier: '区域核心',
    influenceBasis: '覆盖俄罗斯及独联体市场的综合建材展，官方披露 1,300+ 展商、70,000+ 观众。', audience: '分销商、开发商、承包商、建筑师、门窗与锁具采购',
    wonlyFit: '高', wonlyUse: '适合俄罗斯及独联体工程门、锁具与渠道代理拓展。', scale: '1,300+ 展商；70,000+ 观众；16 个品类',
    sourceUrl: 'https://mosbuild.com/exhibition/', venueDetail: 'Pavilions 1–3', dateStatus: '日期已公布', priority: '区域优先',
    registrationStatus: '专业观众电子票已开放 · 使用官方邀请码可免费登记', registrationState: '报名已开放', registrationUrl: 'https://mosbuild.com/exhibition/',
  }),
  plannedExhibition({
    id: 'plan-glass-west-2027', exhibition: 'Glass Expo West 2027', eventDate: '2027-02-10', eventDateEnd: '2027-02-11', country: '美国', city: '安大略（加州）', venue: 'Ontario Convention Center', region: '北美',
    organizer: 'Glass Expos / USGlass', categories: ['窗', '幕墙', '建材'], scopeLevel: '区域性', influenceTier: '区域核心',
    influenceBasis: '面向美国西部建筑玻璃与金属行业的两日区域专业展。', audience: '玻璃加工商、门窗制造商、幕墙承包商、安装商与区域经销商',
    wonlyFit: '高', wonlyUse: '适合验证美国西部门窗渠道、玻璃配套与工程合作伙伴。', scale: '区域展；主办方强调面对面连接决策人与买家',
    sourceUrl: 'https://glassexpos.com/events/list/', venueDetail: '2000 E Convention Center Way', dateStatus: '日期已公布', priority: '区域优先', registrationStatus: '2027 展商 / 观众登记入口待主办方开放', registrationUrl: 'https://glassexpos.com/events/list/',
  }),
  plannedExhibition({
    id: 'plan-rt-stuttgart-2027', exhibition: 'R+T Stuttgart 2027', aliases: ['R+T 2027', '斯图加特门窗遮阳展'], eventDate: '2027-02-15', eventDateEnd: '2027-02-19', country: '德国', city: '斯图加特', venue: 'Messe Stuttgart', region: '欧洲',
    organizer: 'Messe Stuttgart', categories: ['窗', '门', '智能建筑', '安防'], scopeLevel: '国家性', influenceTier: '全球旗舰',
    influenceBasis: '卷帘、门体和遮阳系统世界级专业展；官方上届数据 61,155 名观众、1,017 家展商。', audience: '门体制造商、遮阳企业、建筑师、规划师、安装商与渠道商',
    wonlyFit: '高', wonlyUse: '适合门体、门控、智能入口与建筑安防的全球渠道拓展。', scale: '61,155 名观众；1,017 家展商',
    sourceUrl: 'https://www.messe-stuttgart.de/r-t/en/en-r-t-2027-all-key-information-for-your-visit/', venueDetail: 'Messepiazza 1', dateStatus: '日期已公布', priority: '国家性补充',
    registrationStatus: '展位预订与观众购票已开放', registrationState: '报名已开放', registrationUrl: 'https://www.messe-stuttgart.de/r-t/en/en-r-t-2027-all-key-information-for-your-visit/',
  }),
  plannedExhibition({
    id: 'plan-windoor-china-2027', exhibition: 'WINDOOR 2027', eventDate: '2027-03-11', eventDateEnd: '2027-03-13', country: '中国', city: '广州', venue: '保利世贸博览馆', region: '中国 / 亚太',
    organizer: 'WINDOOR Expo', categories: ['窗', '门', '幕墙', '建材'], scopeLevel: '区域性', influenceTier: '区域核心',
    influenceBasis: '亚洲门窗幕墙与建筑围护系统专业展，覆盖华南制造集群和亚洲买家。', audience: '门窗制造商、型材与五金供应商、幕墙公司、建筑商、经销商与海外采购',
    wonlyFit: '高', wonlyUse: '适合供应链合作、出海渠道反查和门窗一体化方案展示。', scale: '第 33 届专业展；官方面向专业贸易观众',
    sourceUrl: 'https://en.windoorexpo.com/ldp_2027.aspx', venueDetail: '广州市海珠区新港东路 1000 号', dateStatus: '日期已公布', priority: '区域优先', registrationStatus: '专业观众预登记已开放 · 截止日期未公布', registrationUrl: 'https://en.windoorexpo.com/ldp_2027.aspx',
  }),
  plannedExhibition({
    id: 'plan-cf-istanbul-2027', exhibition: 'CF İstanbul 2027', eventDate: '2027-04-08', eventDateEnd: '2027-04-10', country: '土耳其', city: '伊斯坦布尔', venue: 'Istanbul Expo Center', region: '欧亚 / 中东',
    organizer: 'So Fuar Group', categories: ['建材', '窗', '门', '智能建筑'], scopeLevel: '区域性', influenceTier: '区域核心',
    influenceBasis: '连接土耳其、欧洲、西亚与中东采购的区域建材与建筑技术展。', audience: '建材制造商、建筑商、开发商、国际买家、门窗及智能建筑渠道',
    wonlyFit: '高', wonlyUse: '适合切入土耳其及周边市场的项目门、门窗和智能入口渠道。', scale: '官方预计 400+ 企业、20 国、2,000+ 国际买家',
    sourceUrl: 'https://cfistanbul.com/english', venueDetail: 'Yeşilköy', dateStatus: '日期已公布', priority: '区域优先', registrationStatus: '展商申请与观众登记已开放 · 截止日期未公布', registrationUrl: 'https://cfistanbul.com/english',
  }),
  plannedExhibition({
    id: 'plan-turkeybuild-2027', exhibition: 'Yapı – Turkeybuild Istanbul 2027', aliases: ['Turkeybuild 2027', '土耳其国际建材展'], eventDate: '2027-04-27', eventDateEnd: '2027-04-30', country: '土耳其', city: '伊斯坦布尔', venue: 'Tüyap Fair & Congress Center', region: '欧亚 / 中东',
    organizer: 'ICA Events', categories: ['建材', '窗', '门', '智能建筑'], scopeLevel: '区域性', influenceTier: '区域核心',
    influenceBasis: '连接土耳其、巴尔干、中东、中亚和北非买家的区域建筑建材平台。', audience: '建材渠道、开发商、承包商、建筑师、政府和国际买家',
    wonlyFit: '高', wonlyUse: '适合项目门、门窗、五金及欧亚区域代理商拓展。', scale: '官方参考数据 43,786 名观众、431 家展商',
    sourceUrl: 'https://yapifuari.com.tr/en/Articles/important-announcement-new-dates', venueDetail: 'Tüyap Fair & Congress Center', dateStatus: '日期已公布', priority: '区域优先',
    registrationStatus: '展位预订已开放 · 截止日期未公布', registrationState: '报名已开放', registrationUrl: 'https://yapifuari.com.tr/en/',
  }),
  plannedExhibition({
    id: 'plan-architect-2027', exhibition: 'Architect’27', aliases: ['ASA EXPO 2027', '泰国建筑师博览会'], eventDate: '2027-04-27', eventDateEnd: '2027-05-02', country: '泰国', city: '曼谷', venue: 'IMPACT Challenger Hall 1–3', region: '东南亚',
    organizer: 'ASA × TTF International', categories: ['建材', '窗', '门', '幕墙', '智能建筑'], scopeLevel: '区域性', influenceTier: '区域核心',
    influenceBasis: '东盟大型建筑技术与产品展，官方披露 1,000+ 展商、328,000+ 人次。', audience: '建筑师、设计师、开发商、承包商、工程师与材料采购',
    wonlyFit: '高', wonlyUse: '适合东南亚设计选型、建材渠道及门窗一体化方案。', scale: '1,000+ 展商；328,000+ 人次',
    sourceUrl: 'https://architectexpo.com/', venueDetail: 'IMPACT Muang Thong Thani', dateStatus: '日期已公布', priority: '区域优先',
    registrationStatus: '展位预订已开放 · 观众预登记尚未开放', registrationState: '报名待开放', registrationUrl: 'https://architectexpo.com/faqs/',
  }),
  plannedExhibition({
    id: 'plan-sydney-build-2027', exhibition: 'Sydney Build Expo 2027', aliases: ['悉尼国际建筑建材展'], eventDate: '2027-04-28', eventDateEnd: '2027-04-29', country: '澳大利亚', city: '悉尼', venue: 'ICC Sydney', region: '亚太',
    organizer: 'Nineteen Group', categories: ['建材', '窗', '门', '智能建筑'], scopeLevel: '国家性', influenceTier: '区域核心',
    influenceBasis: '澳大利亚大型建筑与设计展，官方披露 28,000+ 观众、700+ 展商。', audience: '承包商、开发商、建筑师、工程师、政府和建材采购',
    wonlyFit: '高', wonlyUse: '适合澳洲工程门、住宅建材及本地安装渠道拓展。', scale: '28,000+ 观众；700+ 展商；750+ 演讲嘉宾',
    sourceUrl: 'https://iccsydney.com.au/events/sydney-build-expo/', venueDetail: 'ICC Sydney Exhibition Centre', dateStatus: '日期已公布', priority: '国家性补充',
    registrationStatus: '参展意向登记已开放 · 具体截止时间待公布', registrationState: '报名已开放', registrationUrl: 'https://www.sydneybuildexpo.com/',
  }),
  plannedExhibition({
    id: 'plan-glass-texpo-2027', exhibition: 'Glass TEXpo 2027', eventDate: '2027-05-14', eventDateEnd: '2027-05-15', country: '美国', city: '圣安东尼奥（德州）', venue: 'Henry B. González Convention Center', region: '北美',
    organizer: 'Glass Expos / USGlass', categories: ['窗', '幕墙', '建材'], scopeLevel: '区域性', influenceTier: '区域核心',
    influenceBasis: '服务德州及美国南中部建筑玻璃与金属市场的区域专业展。', audience: '玻璃与门窗加工商、经销商、安装商、幕墙承包商和区域买家',
    wonlyFit: '高', wonlyUse: '适合接触德州建筑与改造市场的区域渠道和安装服务商。', scale: '两日区域专业展',
    sourceUrl: 'https://glassexpos.com/events/list/', venueDetail: '900 E Market St', dateStatus: '日期已公布', priority: '区域优先', registrationStatus: '2027 展商 / 观众登记入口待主办方开放', registrationUrl: 'https://glassexpos.com/events/list/',
  }),
  plannedExhibition({
    id: 'plan-big5-saudi-may-2027', exhibition: 'Big 5 Construct Saudi 2027 · May Edition', aliases: ['Big 5 Saudi 2027 春季展'], eventDate: '2027-05-24', eventDateEnd: '2027-05-27', country: '沙特阿拉伯', city: '利雅得', venue: 'Riyadh Front Exhibition & Conference Center', region: '中东',
    organizer: 'dmg events', categories: ['建材', '窗', '门', '幕墙', '智能建筑'], scopeLevel: '区域性', influenceTier: '区域核心',
    influenceBasis: '面向海湾大型建设项目和沙特 Vision 2030 采购需求的区域旗舰建造展。', audience: '大型承包商、开发商、政府项目、建筑师、经销商和采购负责人',
    wonlyFit: '高', wonlyUse: '适合工程门、门窗幕墙、智能入口与大型项目合作。', scale: '两届合计 65,000+ 专业观众、2,200+ 展商',
    sourceUrl: 'https://www.big5constructsaudi.com/', venueDetail: 'Riyadh Front', dateStatus: '日期已公布', priority: '区域优先',
    registrationStatus: '展位申请与免费观众登记入口已开放 · 截止日期未公布', registrationState: '报名已开放', registrationUrl: 'https://www.big5constructsaudi.com/',
  }),
  plannedExhibition({
    id: 'plan-big5-south-africa-2027', exhibition: 'Big 5 Construct South Africa 2027', aliases: ['南非约翰内斯堡国际建材五大行业展'], eventDate: '2027-06-08', eventDateEnd: '2027-06-10', country: '南非', city: '约翰内斯堡', venue: 'Gallagher Convention Centre', region: '非洲',
    organizer: 'dmg events', categories: ['建材', '窗', '门', '幕墙', '智能建筑'], scopeLevel: '区域性', influenceTier: '区域核心',
    influenceBasis: '南部非洲建筑与基础设施采购平台，与 South Africa Infrastructure Expo 同期。', audience: '承包商、开发商、工程师、政府、经销商与专业买家',
    wonlyFit: '高', wonlyUse: '适合南部非洲工程门、建材渠道与项目合作。', scale: '12,000+ 观众；350+ 展商；30+ 国家',
    sourceUrl: 'https://www.big5constructsouthafrica.com/', venueDetail: 'Gallagher Convention Centre', dateStatus: '日期已公布', priority: '区域优先',
    registrationStatus: '展位申请已开放 · 专业观众免费 · 截止时间未公布', registrationState: '报名已开放', registrationUrl: 'https://www.big5constructsouthafrica.com/',
  }),
  plannedExhibition({
    id: 'plan-archidex-2027', exhibition: 'ARCHIDEX 2027', eventDate: '2027-06-30', eventDateEnd: '2027-07-03', country: '马来西亚', city: '吉隆坡', venue: 'MITEC', region: '东南亚',
    organizer: 'PAM × C.I.S', categories: ['建材', '窗', '门', '幕墙', '智能建筑'], scopeLevel: '区域性', influenceTier: '区域核心',
    influenceBasis: '东南亚建筑、室内设计与建材商业平台，覆盖区域建筑师和项目决策人。', audience: '建筑师、开发商、设计师、承包商、建材品牌与渠道商',
    wonlyFit: '高', wonlyUse: '适合东南亚建材渠道、设计师选型和门窗产品本地合作。', scale: '官方 2027 场地 39,000㎡',
    sourceUrl: 'https://archidex.com.my/', venueDetail: 'Malaysia International Trade & Exhibition Centre', dateStatus: '日期已公布', priority: '区域优先', registrationStatus: '展商申请与观众登记已开放 · 截止日期未公布', registrationUrl: 'https://archidex.com.my/',
  }),
  plannedExhibition({
    id: 'plan-build4asia-2027', exhibition: 'Build4Asia 2027', eventDate: '2027-07-07', eventDateEnd: '2027-07-09', country: '中国香港', city: '香港', venue: '香港会议展览中心', region: '亚太',
    organizer: 'Informa Markets', categories: ['建材', '智能建筑', '安防', '门', '窗'], scopeLevel: '区域性', influenceTier: '区域核心',
    influenceBasis: '香港建筑技术、建材、电气与安防综合展，面向粤港澳及亚洲专业买家。', audience: '建筑师、物业与设施管理、工程顾问、承包商、系统集成商和采购方',
    wonlyFit: '高', wonlyUse: '适合智能门、智能锁、建筑五金和工程渠道的跨品类展示。', scale: '官方预计 600 个品牌/展商、6,000 名观众',
    sourceUrl: 'https://www.build4asia.com/about/', venueDetail: '专业贸易观众限定', dateStatus: '日期已公布', priority: '区域优先',
  }),
  plannedExhibition({
    id: 'plan-worldbex-2027', exhibition: 'WORLDBEX 2027', aliases: ['Philippine World Building and Construction Exposition'], eventDate: '2027-03-11', eventDateEnd: '2027-03-14', country: '菲律宾', city: '马尼拉', venue: 'WTC Metro Manila × SMX Convention Center Manila', region: '东南亚',
    organizer: 'Worldbex Services International', categories: ['建材', '窗', '门', '智能建筑'], scopeLevel: '国家性', influenceTier: '区域核心',
    influenceBasis: '菲律宾国家级建筑与建材展，双场馆覆盖全国与东南亚采购。', audience: '开发商、承包商、建筑师、经销商、室内设计与项目采购',
    wonlyFit: '高', wonlyUse: '适合菲律宾渠道商、项目门与智能锁合作。', scale: '双场馆国家级建造展',
    sourceUrl: 'https://worldbex.com/', venueDetail: 'WTCMM + SMX Manila', dateStatus: '日期已公布', priority: '国家性补充',
    registrationStatus: '官方已发布档期 · 展商与观众具体截止时间未公布', registrationState: '报名时间待公布', registrationUrl: 'https://worldbex.com/',
  }),
  plannedExhibition({
    id: 'plan-philbex-davao-2027', exhibition: 'PHILBEX Davao 2027', aliases: ['Philippine Building and Construction Exposition Davao'], eventDate: '2027-05-06', eventDateEnd: '2027-05-09', country: '菲律宾', city: '达沃', venue: 'SMX Convention Center Davao', region: '东南亚',
    organizer: 'Worldbex Services International', categories: ['建材', '窗', '门'], scopeLevel: '区域性', influenceTier: '区域核心',
    influenceBasis: '服务棉兰老岛建筑与建材渠道的区域展。', audience: '当地开发商、承包商、建筑师、经销商和项目采购',
    wonlyFit: '高', wonlyUse: '适合下沉菲律宾南部渠道和项目客户。', scale: 'WORLDBEX 区域系列',
    sourceUrl: 'https://worldbex.com/', venueDetail: 'SMX Davao', dateStatus: '日期已公布', priority: '区域优先',
    registrationStatus: '具体报名开放与截止时间待主办方公布', registrationState: '报名时间待公布', registrationUrl: 'https://worldbex.com/',
  }),
  plannedExhibition({
    id: 'plan-philbex-iloilo-2027', exhibition: 'PHILBEX Iloilo 2027', eventDate: '2027-07-08', eventDateEnd: '2027-07-11', country: '菲律宾', city: '伊洛伊洛', venue: 'Iloilo Convention Center', region: '东南亚',
    organizer: 'Worldbex Services International', categories: ['建材', '窗', '门'], scopeLevel: '区域性', influenceTier: '区域核心',
    influenceBasis: '服务西米沙鄢建筑与建材渠道的区域展。', audience: '当地开发商、承包商、建筑师、经销商和项目采购',
    wonlyFit: '中', wonlyUse: '适合验证菲律宾中部二线市场的经销网络。', scale: 'WORLDBEX 区域系列',
    sourceUrl: 'https://worldbex.com/', venueDetail: 'Iloilo Convention Center', dateStatus: '日期已公布', priority: '区域优先',
    registrationStatus: '具体报名开放与截止时间待主办方公布', registrationState: '报名时间待公布', registrationUrl: 'https://worldbex.com/',
  }),
  plannedExhibition({
    id: 'plan-philbex-cebu-2027', exhibition: 'PHILBEX Cebu 2027', eventDate: '2027-09-09', eventDateEnd: '2027-09-12', country: '菲律宾', city: '宿务', venue: 'IC3 Convention Center Cebu', region: '东南亚',
    organizer: 'Worldbex Services International', categories: ['建材', '窗', '门'], scopeLevel: '区域性', influenceTier: '区域核心',
    influenceBasis: '服务宿务及中部群岛建筑与建材渠道的区域展。', audience: '当地开发商、承包商、建筑师、经销商和项目采购',
    wonlyFit: '高', wonlyUse: '适合菲律宾中部重点城市的渠道及工程客户拓展。', scale: 'WORLDBEX 区域系列',
    sourceUrl: 'https://worldbex.com/', venueDetail: 'IC3 Cebu', dateStatus: '日期已公布', priority: '区域优先',
    registrationStatus: '具体报名开放与截止时间待主办方公布', registrationState: '报名时间待公布', registrationUrl: 'https://worldbex.com/',
  }),
  plannedExhibition({
    id: 'plan-big5-saudi-sep-2027', exhibition: 'Big 5 Construct Saudi 2027 · September Edition', aliases: ['Big 5 Saudi 2027 秋季展'], eventDate: '2027-09-19', eventDateEnd: '2027-09-22', country: '沙特阿拉伯', city: '利雅得', venue: 'Riyadh Front Exhibition & Conference Center', region: '中东',
    organizer: 'dmg events', categories: ['建材', '窗', '门', '幕墙', '智能建筑'], scopeLevel: '区域性', influenceTier: '区域核心',
    influenceBasis: 'Big 5 Saudi 年内第二场，承接海湾秋季工程采购与项目决策。', audience: '大型承包商、开发商、政府项目、建筑师、经销商和采购负责人',
    wonlyFit: '高', wonlyUse: '适合大型项目跟进、经销商复访及智能入口方案。', scale: '两届合计 65,000+ 专业观众、2,200+ 展商',
    sourceUrl: 'https://www.big5constructsaudi.com/', venueDetail: 'Riyadh Front', dateStatus: '日期已公布', priority: '区域优先',
    registrationStatus: '展位申请与免费观众登记入口已开放 · 截止日期未公布', registrationState: '报名已开放', registrationUrl: 'https://www.big5constructsaudi.com/',
  }),
  plannedExhibition({
    id: 'plan-big5-turkiye-2027', exhibition: 'Big 5 Construct Türkiye 2027', eventDate: '2027-09-15', eventDateEnd: '2027-09-17', country: '土耳其', city: '伊斯坦布尔', venue: 'Istanbul Expo Center', region: '欧亚 / 中东',
    organizer: 'dmg events', categories: ['建材', '门', '窗', '智能建筑'], scopeLevel: '区域性', influenceTier: '区域核心',
    influenceBasis: 'Big 5 区域展，连接土耳其城市更新、基础设施及中东欧亚建材采购。', audience: '承包商、开发商、政府采购、建材供应商、建筑师与工程顾问',
    wonlyFit: '高', wonlyUse: '适合工程门、建筑材料及区域代理商拓展。', scale: '三日区域建造业专业展',
    sourceUrl: 'https://www.big5constructturkiye.com/', venueDetail: 'IFM', dateStatus: '日期已公布', priority: '区域优先',
  }),
  plannedExhibition({
    id: 'plan-archidex-borneo-2027', exhibition: 'ARCHIDEX Borneo 2027 · Sabah Edition', eventDate: '2027-10-15', eventDateEnd: '2027-10-17', country: '马来西亚', city: '亚庇', venue: 'Sabah International Convention Centre', region: '东南亚',
    organizer: 'C.I.S', categories: ['建材', '窗', '门', '幕墙'], scopeLevel: '区域性', influenceTier: '区域核心',
    influenceBasis: '聚焦婆罗洲及东马建筑与建材市场的区域版 ARCHIDEX。', audience: '当地建筑师、开发商、承包商、政府项目方、建材经销商',
    wonlyFit: '中', wonlyUse: '适合测试东马、文莱及婆罗洲周边工程和经销渠道。', scale: '区域版展会；最新规模待主办方公布',
    sourceUrl: 'https://cisnetwork.com/our-exhibitions-malaysia/', venueDetail: 'SICC', dateStatus: '日期已公布', priority: '区域优先',
  }),
  plannedExhibition({
    id: 'plan-wdf-dubai-2027', exhibition: 'Windows, Doors & Facades Event 2027', aliases: ['WDF Dubai 2027', '迪拜国际门窗幕墙展'], eventDate: '2027-11-22', eventDateEnd: '2027-11-25', country: '阿联酋', city: '迪拜', venue: 'Dubai Exhibition Centre', region: '中东',
    organizer: 'dmg events', categories: ['窗', '门', '幕墙', '建材'], scopeLevel: '区域性', influenceTier: '区域核心',
    influenceBasis: '中东建筑围护系统专业展，与 Big 5 Global 同期形成集中采购流量。', audience: '建筑师、顾问、承包商、开发商、门窗幕墙制造商与经销商',
    wonlyFit: '高', wonlyUse: '适合中东项目门、门窗幕墙及高性能入口系统。', scale: 'Big 5 Global 同期专业展',
    sourceUrl: 'https://www.windowsdoorsandfacadeevent.com/visit/', venueDetail: 'Dubai Exhibition Centre', dateStatus: '日期已公布', priority: '区域优先',
    registrationStatus: '观众门票尚未开放 · 可登记开票提醒', registrationState: '报名待开放', registrationUrl: 'https://www.windowsdoorsandfacadeevent.com/visit/',
  }),
  ...additional2027RegionalExhibitions().map(plannedExhibition),
  plannedExhibition({
    id: 'plan-polyclose-2028', exhibition: 'Polyclose 2028', eventDate: '2028-01-19', eventDateEnd: '2028-01-21', country: '比利时', city: '根特', venue: 'Flanders Expo', region: '欧洲',
    organizer: 'Polyclose', categories: ['窗', '门', '幕墙', '建材'], scopeLevel: '区域性', influenceTier: '区域核心',
    influenceBasis: '面向比荷卢门窗、遮阳、幕墙、通行技术与完整建筑围护结构专业市场。', audience: '安装商、木工、制造商、分销商、幕墙承包商、建筑师与规范制定者',
    wonlyFit: '高', wonlyUse: '适合比荷卢门窗渠道、建筑围护系统与入口方案合作。', scale: '三日 B2B 专业展',
    sourceUrl: 'https://www.polyclose.be/en', venueDetail: 'Maaltekouter 1, 9051 Ghent', dateStatus: '日期已公布', priority: '区域优先', registrationStatus: '展商意向登记已开放 · 截止日期未公布', registrationUrl: 'https://www.polyclose.be/en',
  }),
  plannedExhibition({
    id: 'plan-swissbau-2028', exhibition: 'Swissbau 2028', eventDate: '2028-01-18', eventDateEnd: '2028-01-21', country: '瑞士', city: '巴塞尔', venue: 'Messe Basel', region: '欧洲',
    organizer: 'MCH Group', categories: ['建材', '窗', '门', '智能建筑'], scopeLevel: '国家性', influenceTier: '区域核心',
    influenceBasis: '瑞士国家级建筑与房地产行业展，覆盖瑞士德语区及周边项目市场。', audience: '建筑师、规划师、开发商、承包商、建材渠道与设施管理者',
    wonlyFit: '中', wonlyUse: '适合高端门窗、节能围护和智能入口方案进入瑞士项目市场。', scale: '国家级建筑与房地产专业展',
    sourceUrl: 'https://www.swissbau.ch/en', venueDetail: 'Messe Basel', dateStatus: '日期已公布', priority: '国家性补充',
  }),
  plannedExhibition({
    id: 'plan-domotex-2028', exhibition: 'DOMOTEX 2028', aliases: ['汉诺威国际地材与室内装饰展'], eventDate: '2028-01-17', eventDateEnd: '2028-01-20', country: '德国', city: '汉诺威', venue: 'Messegelände Hannover', region: '欧洲',
    organizer: 'Deutsche Messe', categories: ['建材'], scopeLevel: '国家性', influenceTier: '全球旗舰',
    influenceBasis: '全球地材与室内饰面专业展，可用于门墙地一体化与经销渠道研究。', audience: '地材与饰面制造商、经销商、工匠、室内设计师和采购',
    wonlyFit: '中', wonlyUse: '适合补充门墙地整体空间方案和建材渠道合作。', scale: '全球地材与室内饰面专业展',
    sourceUrl: 'https://www.domotex.de/en/for-visitors/opening-hours/', venueDetail: 'Messegelände 30521 Hannover', dateStatus: '日期已公布', priority: '国家性补充',
    registrationStatus: '观众购票入口已开放 · 展商方案已发布', registrationState: '报名已开放', registrationUrl: 'https://www.domotex.de/en/for-visitors/opening-hours/',
  }),
  plannedExhibition({
    id: 'plan-faf-2028', exhibition: 'FAF 2028', eventDate: '2028-03-07', eventDateEnd: '2028-03-10', country: '德国', city: '斯图加特', venue: 'Messe Stuttgart', region: '欧洲',
    organizer: 'GHM', categories: ['建材', '幕墙'], scopeLevel: '区域性', influenceTier: '垂直专业',
    influenceBasis: '聚焦立面设计、饰面、涂装与建筑保护的专业展，区域工匠与承包商密度高。', audience: '立面承包商、涂装与饰面企业、建筑保护专业人员、规划师和材料商',
    wonlyFit: '中', wonlyUse: '适合门墙一体、外立面配色、耐候材料和工程伙伴拓展。', scale: '四日垂直专业展',
    sourceUrl: 'https://www.faf-messe.de/en/press-releases/new-date-and-location-for-faf-trade-fair-ghm-responds-to-industry-request-faf-2028-in-stuttgart', venueDetail: 'Messe Stuttgart', dateStatus: '日期已公布', priority: '区域优先',
  }),
  plannedExhibition({
    id: 'plan-light-building-2028', exhibition: 'Light + Building 2028', aliases: ['法兰克福照明及建筑技术展'], eventDate: '2028-03-05', eventDateEnd: '2028-03-10', country: '德国', city: '法兰克福', venue: 'Messe Frankfurt', region: '欧洲',
    organizer: 'Messe Frankfurt', categories: ['智能建筑', '安防', '建材'], scopeLevel: '国家性', influenceTier: '全球旗舰',
    influenceBasis: '照明、建筑电气和楼宇自动化世界级平台，适合智能入口与系统集成生态。', audience: '系统集成商、电气工程、建筑师、照明设计、楼宇自动化与渠道商',
    wonlyFit: '高', wonlyUse: '适合智能锁、门控、楼宇互联和系统集成伙伴拓展。', scale: '官方上届 1,927 家展商、144,767 名观众',
    sourceUrl: 'https://light-building.messefrankfurt.com/frankfurt/en/planning-preparation/visitors.html', venueDetail: 'Frankfurt am Main', dateStatus: '日期已公布', priority: '国家性补充',
    registrationStatus: '观众票务尚未开放', registrationState: '报名待开放', registrationUrl: 'https://light-building.messefrankfurt.com/frankfurt/en/planning-preparation/visitors.html',
  }),
  plannedExhibition({
    id: 'plan-frontale-2028', exhibition: 'FENSTERBAU FRONTALE 2028', eventDate: '2028-03-28', eventDateEnd: '2028-03-31', country: '德国', city: '纽伦堡', venue: 'NürnbergMesse', region: '欧洲',
    organizer: 'NürnbergMesse', categories: ['窗', '门', '幕墙', '建材'], scopeLevel: '国家性', influenceTier: '全球旗舰',
    influenceBasis: '德国国家级门窗幕墙专业展，同时吸引 100+ 国家专业观众，是门窗类全球标杆。', audience: '门窗制造商、金属加工、遮阳、木工、幕墙公司、建筑师与规划师',
    wonlyFit: '高', wonlyUse: '适合门窗系统、五金、智能入口与欧洲渠道的集中拓展。', scale: '四日国际专业展；官方称观众来自 100+ 国家',
    sourceUrl: 'https://www.frontale.de/en/visit', venueDetail: '仅面向专业观众', dateStatus: '日期已公布', priority: '国家性补充', registrationStatus: '展位预订已开放 · 观众登记时间待公布', registrationUrl: 'https://www.frontale.de/en/exhibit',
  }),
  plannedExhibition({
    id: 'plan-nordbygg-2028', exhibition: 'Nordbygg 2028', eventDate: '2028-04-25', eventDateEnd: '2028-04-28', country: '瑞典', city: '斯德哥尔摩', venue: 'Stockholmsmässan', region: '北欧',
    organizer: 'Stockholmsmässan', categories: ['建材', '窗', '门', '智能建筑'], scopeLevel: '区域性', influenceTier: '区域核心',
    influenceBasis: '覆盖北欧建筑与建材专业市场，强调节能、可持续和建筑技术。', audience: '北欧建筑商、安装商、建筑师、工程顾问、地产与建材采购',
    wonlyFit: '中', wonlyUse: '适合验证北欧节能门窗、安全与智能入口需求。', scale: '四日北欧建筑专业展',
    sourceUrl: 'https://nordbygg.se/en/', venueDetail: 'Stockholmsmässan', dateStatus: '日期已公布', priority: '区域优先',
  }),
  plannedExhibition({
    id: 'plan-stonetec-2028', exhibition: 'Stone+tec 2028', aliases: ['纽伦堡天然石材与石材技术展'], eventDate: '2028-06-21', eventDateEnd: '2028-06-24', country: '德国', city: '纽伦堡', venue: 'Messe Nürnberg', region: '欧洲',
    organizer: 'AFAG', categories: ['建材'], scopeLevel: '区域性', influenceTier: '垂直专业',
    influenceBasis: '天然石材、石材技术与设计垂直展，适合高端门墙空间材料组合研究。', audience: '石材加工、建筑师、设计师、材料经销商与工匠',
    wonlyFit: '中', wonlyUse: '适合高端入户空间、门墙一体和材料合作。', scale: '四日欧洲垂直专业展',
    sourceUrl: 'https://www.stone-tec.com/en/exhibitors/faq', venueDetail: 'Messe Nürnberg', dateStatus: '日期已公布', priority: '区域优先',
    registrationStatus: '在线展位申请已开放 · 截止日期未公布', registrationState: '报名已开放', registrationUrl: 'https://www.stone-tec.com/en/exhibitors/faq',
  }),
  plannedExhibition({
    id: 'plan-batimat-2028', exhibition: 'BATIMAT × EQUIPBAIE 2028', aliases: ['巴黎国际建材展', 'Equipbaie by Batimat', '法国巴黎国际建筑门窗展'], eventDate: '2028-10-02', eventDateEnd: '2028-10-05', country: '法国', city: '巴黎', venue: 'Paris Expo Porte de Versailles', region: '欧洲',
    organizer: 'RX France', categories: ['建材', '窗', '门', '幕墙', '智能建筑'], scopeLevel: '国家性', influenceTier: '全球旗舰',
    influenceBasis: '法国国家级建筑展；EQUIPBAIE 已并入 BATIMAT，集中覆盖门窗、闭合系统、五金、玻璃和智能控制。', audience: '建筑商、建筑师、规范制定者、门窗制造商、金属加工与渠道商',
    wonlyFit: '高', wonlyUse: '适合欧洲门窗、工程门、五金和智能入口全品类展示。', scale: 'EQUIPBAIE 板块历史覆盖 400+ 展商、20,000 名专业人士',
    sourceUrl: 'https://www.batimat.com/en-gb/the-show/equipbaie.html', venueDetail: 'Paris Expo Porte de Versailles', dateStatus: '日期已公布', priority: '国家性补充',
    registrationStatus: '展商申请入口已开放 · 观众票务与截止时间待公布', registrationState: '报名已开放', registrationUrl: 'https://www.batimat.com/en-gb/the-show/equipbaie.html',
  }),
]

function additional2027RegionalExhibitions() { return [
  {
    id: 'plan-kyrgyzbuild-2027', exhibition: 'KyrgyzBuild 2027', aliases: ['吉尔吉斯斯坦国际建筑展'], eventDate: '2027-04-13', eventDateEnd: '2027-04-15', country: '吉尔吉斯斯坦', city: '比什凯克', venue: 'Jashtyk Arena / KSAFKiS Arena', region: '中亚', organizer: 'BiExpo',
    categories: ['建材', '窗', '门', '幕墙', '安防'], scopeLevel: '区域性', influenceTier: '区域核心', influenceBasis: '第 24 届中亚建筑专业展，官方设有门、窗、幕墙、屋顶、门禁和安防板块。', audience: '承包商、开发商、建材经销商、门窗企业、工程师与政府项目方', wonlyFit: '高', wonlyUse: '适合测试中亚二级市场代理商、工程门及建筑五金渠道。', scale: '126+ 参展企业；4,465+ 观众；10+ 国家', sourceUrl: 'https://kyrgyzbuild.kg/en', venueDetail: 'Bishkek · 两个专业场馆', dateStatus: '日期已公布', priority: '区域优先', registrationStatus: '观众预登记已开放 · 展商可联系销售团队 · 截止日期未公布', registrationState: '报名已开放', registrationUrl: 'https://kyrgyzbuild.kg/en/visitors',
  },
  {
    id: 'plan-big5-ethiopia-2027', exhibition: 'Big 5 Construct Ethiopia 2027', eventDate: '2027-04-08', eventDateEnd: '2027-04-10', country: '埃塞俄比亚', city: '亚的斯亚贝巴', venue: 'Addis International Convention Centre (AICC)', region: '东非', organizer: 'dmg events',
    categories: ['建材', '窗', '门', '智能建筑'], scopeLevel: '区域性', influenceTier: '区域核心', influenceBasis: 'Big 5 东非项目采购平台，连接政府、承包商、开发商和国际供应商。', audience: '政府、承包商、开发商、建筑师、工程顾问、经销商与采购负责人', wonlyFit: '高', wonlyUse: '适合东非工程门、经销网络与大型建设项目合作。', scale: '历史公开样本 160+ 展商、22 个国家', sourceUrl: 'https://www.big5constructethiopia.com/training/', venueDetail: 'AICC', dateStatus: '日期已公布', priority: '区域优先', registrationStatus: '展位预订及专业观众登记入口已开放', registrationState: '报名已开放', registrationUrl: 'https://www.big5constructethiopia.com/',
  },
  {
    id: 'plan-big5-egypt-2027', exhibition: 'Big 5 Construct Egypt 2027', eventDate: '2027-06-14', eventDateEnd: '2027-06-16', country: '埃及', city: '开罗', venue: 'Egypt International Exhibition Center (EIEC)', region: '北非 / 中东', organizer: 'dmg events',
    categories: ['建材', '窗', '门', '幕墙', '智能建筑'], scopeLevel: '区域性', influenceTier: '区域核心', influenceBasis: '连接埃及、北非及中东建设项目的 Big 5 区域展。', audience: '承包商、开发商、政府、顾问、分销商、建筑师与项目采购', wonlyFit: '高', wonlyUse: '适合北非工程门、智能入口及建材渠道拓展。', scale: '350+ 参展品牌；20+ 国家；20,000㎡', sourceUrl: 'https://www.big5constructegypt.com/landing-page/big-5-construct-egypt-exprom-2027/', venueDetail: 'EIEC', dateStatus: '日期已公布', priority: '区域优先', registrationStatus: '展位预订已开放 · 观众可登记开票提醒', registrationState: '报名已开放', registrationUrl: 'https://www.big5constructegypt.com/landing-page/big-5-construct-egypt-exprom-2027/',
  },
  {
    id: 'plan-kazbuild-2027', exhibition: 'KazBuild 2027', aliases: ['哈萨克斯坦国际建筑与室内展'], eventDate: '2027-09-07', eventDateEnd: '2027-09-09', country: '哈萨克斯坦', city: '阿拉木图', venue: 'Atakent IEC', region: '中亚', organizer: 'Iteca Exhibitions',
    categories: ['建材', '窗', '门', '幕墙', '智能建筑'], scopeLevel: '区域性', influenceTier: '区域核心', influenceBasis: '始于 1994 年的哈萨克斯坦大型建筑与室内展，覆盖中亚经销、工程和设计采购。', audience: '开发商、承包商、建筑师、室内设计师、建材与门窗经销商、政府采购', wonlyFit: '高', wonlyUse: '适合哈萨克斯坦及中亚工程门、门窗、五金和区域代理拓展。', scale: '第 33 届；60+ 场商业活动；UFI 审计展会', sourceUrl: 'https://kazbuild.kz/en/exhibition/about-the-exhibition', venueDetail: 'Atakent IEC', dateStatus: '日期已公布', priority: '区域优先', registrationStatus: '展位预订已开放 · 观众开放时间已公布', registrationState: '报名已开放', registrationUrl: 'https://kazbuild.kz/en/exhibition/about-the-exhibition',
  },
  {
    id: 'plan-construction-indonesia-2027', exhibition: 'Construction Indonesia 2027', eventDate: '2027-09-15', eventDateEnd: '2027-09-18', country: '印度尼西亚', city: '雅加达', venue: 'Jakarta International Expo (JIEXPO)', region: '东南亚', organizer: 'PT Pamerindo Indonesia / Informa Markets',
    categories: ['建材', '智能建筑'], scopeLevel: '国家性', influenceTier: '区域核心', influenceBasis: '第 27 届印尼建筑结构、建造技术、工程采购与设备展，与 Concrete Show SEA 等同期。', audience: '承包商、开发商、工程采购、建筑师、政府、经销商与设备供应商', wonlyFit: '中', wonlyUse: '适合印尼工程项目和建筑渠道合作，门窗垂直度低于专业门窗展。', scale: '第 27 届；多展同期的印尼建筑产业平台', sourceUrl: 'https://www.constructionindo.com/about/about-the-show/', venueDetail: 'JIEXPO Kemayoran', dateStatus: '日期已公布', priority: '国家性补充', registrationStatus: '展商与观众联系入口已开放 · 截止日期未公布', registrationState: '报名已开放', registrationUrl: 'https://www.constructionindo.com/about/about-the-show/',
  },
  {
    id: 'plan-big5-nigeria-2027', exhibition: 'Big 5 Construct Nigeria 2027', eventDate: '2027-09-21', eventDateEnd: '2027-09-23', country: '尼日利亚', city: '拉各斯', venue: 'Landmark Centre', region: '西非', organizer: 'dmg events',
    categories: ['建材', '窗', '门', '智能建筑'], scopeLevel: '区域性', influenceTier: '区域核心', influenceBasis: 'Big 5 西非建筑采购平台，覆盖尼日利亚及周边增长型建材与项目市场。', audience: '经销商、承包商、开发商、建筑师、政府、项目采购与国际供应商', wonlyFit: '高', wonlyUse: '适合西非工程门、安防门、经销代理和项目合作。', scale: '150+ 国际及本地供应商', sourceUrl: 'https://www.big5constructnigeria.com/product-information/', venueDetail: 'Landmark Centre', dateStatus: '日期已公布', priority: '区域优先', registrationStatus: '展位预订已开放 · 观众登记以官网为准', registrationState: '报名已开放', registrationUrl: 'https://www.big5constructnigeria.com/',
  },
  {
    id: 'plan-vibe-2027', exhibition: 'VIBE 2027', aliases: ['Vietnam Interior & Build Expo', '越南室内与建造展'], eventDate: '2027-10-06', eventDateEnd: '2027-10-09', country: '越南', city: '胡志明市', venue: 'SECC', region: '东南亚', organizer: 'SACA',
    categories: ['建材', '窗', '门', '智能建筑'], scopeLevel: '区域性', influenceTier: '区域核心', influenceBasis: '胡志明市建筑与建材协会体系推动的年度室内与建造展。', audience: '建筑与建材企业、室内设计、开发商、承包商、经销商和项目采购', wonlyFit: '高', wonlyUse: '适合越南南部经销商、工程门、智能锁及门墙一体化合作。', scale: '预计近 300 家企业、650+ 展位、近 20,000 人次', sourceUrl: 'https://saca.com.vn/vnt_upload/news/11_2026/SACA_BY_tai_trY_nYm_2027.pdf', venueDetail: 'Saigon Exhibition and Convention Center', dateStatus: '日期已公布', priority: '区域优先', registrationStatus: '2027 赞助与合作方案已发布 · 展位及观众截止日期待公布', registrationState: '报名时间待公布', registrationUrl: 'https://saca.com.vn/vnt_upload/news/11_2026/SACA_BY_tai_trY_nYm_2027.pdf',
  },
  {
    id: 'plan-bakubuild-2027', exhibition: 'BakuBuild 2027', aliases: ['阿塞拜疆国际建筑展', 'Caspian Construction Week'], eventDate: '2027-10-12', eventDateEnd: '2027-10-14', country: '阿塞拜疆', city: '巴库', venue: 'Baku Expo Center', region: '高加索 / 中亚门户', organizer: 'Caspian Event Organisers',
    categories: ['建材', '窗', '门', '智能建筑'], scopeLevel: '区域性', influenceTier: '区域核心', influenceBasis: '第 32 届阿塞拜疆国际建筑展，是里海与高加索建设项目、分销和政府采购平台。', audience: '开发商、承包商、政府、建筑师、经销商、工程与项目采购', wonlyFit: '高', wonlyUse: '适合连接高加索、里海和中亚西部门户的工程门及渠道伙伴。', scale: '第 32 届；与 Caspian Construction Week 同期', sourceUrl: 'https://bakubuild.az/en/register-as-professional', venueDetail: 'Baku Expo Center', dateStatus: '日期已公布', priority: '区域优先', registrationStatus: '专业观众预登记已开放 · B2B/B2G 会议登记可用', registrationState: '报名已开放', registrationUrl: 'https://bakubuild.az/en/register-as-professional',
  },
  {
    id: 'plan-big5-kenya-2027', exhibition: 'Big 5 Construct Kenya 2027', eventDate: '2027-10-13', eventDateEnd: '2027-10-15', country: '肯尼亚', city: '内罗毕', venue: 'Sarit Expo Centre', region: '东非', organizer: 'dmg events',
    categories: ['建材', '窗', '门', '智能建筑'], scopeLevel: '区域性', influenceTier: '区域核心', influenceBasis: 'Big 5 东非建筑专业展，覆盖肯尼亚及东非承包、设计、工程和分销采购。', audience: '承包商、开发商、建筑师、工程师、项目管理、经销商和政府', wonlyFit: '高', wonlyUse: '适合东非项目门、经销代理、安防入口及大型项目线索。', scale: '三日东非建筑专业展；2026 展商名单已公开', sourceUrl: 'https://www.big5constructkenya.com/agenda/', venueDetail: 'Sarit Expo Centre', dateStatus: '日期已公布', priority: '区域优先', registrationStatus: '展位预订已开放 · 观众可登记开票提醒', registrationState: '报名已开放', registrationUrl: 'https://www.big5constructkenya.com/',
  },
] }

function plannedExhibition(item) {
  const registrationState = item.registrationState || (item.registrationStatus?.includes('已开放') ? '报名已开放' : item.registrationStatus?.includes('尚未开放') ? '报名待开放' : '报名时间待公布')
  const categoryProfile = buildCategoryProfile(item)
  return {
    ...item,
    categoryProfile,
    categoryBasis: item.categoryBasis || '依据主办方公开展会定位与现有行业板块映射；尚未逐项核验官方类目目录。',
    categoryConfidence: item.categoryConfidence || '基于官方展会定位',
    recommendedProducts: item.recommendedProducts || recommendProducts(categoryProfile),
    exhibitTheme: item.exhibitTheme || buildExhibitTheme(categoryProfile),
    eventName: item.exhibition,
    eventType: '目标展会',
    association: item.organizer,
    competitor: '市场规划库',
    exhibitionRelation: '建议关注',
    role: '待决策',
    participation: '尚未发现或核验竞品参展证据；本条仅作为 WONLY 市场规划候选。',
    exhibitionMarket: 'B2B',
    profileSourceUrl: item.sourceUrl,
    registrationDeadline: item.registrationStatus || '报名开放时间与截止日期待主办方公布',
    registrationState,
    registrationUrl: item.registrationUrl || item.sourceUrl,
    estimatedCost: '待询价',
    confidence: '高',
    isPlanningRecord: true,
  }
}

function buildCategoryProfile(item) {
  const categories = new Set(item.categories || [])
  const profile = {
    door: categories.has('门') ? 4 : 1,
    smartLock: categories.has('安防') && categories.has('门') ? 4 : categories.has('智能建筑') ? 3 : 1,
    engineeringDoor: categories.has('门') && categories.has('建材') ? 4 : categories.has('门') ? 3 : 1,
    fireDoor: categories.has('门') && (categories.has('安防') || categories.has('建材')) ? 3 : 1,
    window: categories.has('窗') ? 4 : 1,
    curtainWall: categories.has('幕墙') ? 5 : categories.has('窗') ? 3 : 1,
    smartHome: categories.has('智能建筑') ? 4 : 1,
    security: categories.has('安防') ? 5 : categories.has('智能建筑') ? 3 : 1,
    buildingMaterials: categories.has('建材') ? 5 : 2,
  }
  const name = `${item.exhibition || ''} ${(item.aliases || []).join(' ')}`
  if (/glass|windoor|fenster|window|door|facade|frontale|r\+t|门窗|幕墙/i.test(name)) Object.assign(profile, { door: 5, window: 5, curtainWall: Math.max(profile.curtainWall, 4), engineeringDoor: Math.max(profile.engineeringDoor, 4) })
  if (/security|isc\b|gsx|intersec|exposec|安防/i.test(name)) Object.assign(profile, { security: 5, smartLock: 5, fireDoor: Math.max(profile.fireDoor, 4), door: Math.max(profile.door, 3) })
  if (/cedia|light \+ building|smart|智能/i.test(name)) Object.assign(profile, { smartHome: 5, smartLock: Math.max(profile.smartLock, 4) })
  if (/big 5|build|bau\b|batimat|architect|ibs|feicon|batev|worldbex|archidex|建材/i.test(name)) Object.assign(profile, { buildingMaterials: 5, engineeringDoor: Math.max(profile.engineeringDoor, 4) })
  return { ...profile, ...(item.categoryProfile || {}) }
}

function recommendProducts(profile) {
  const mapping = { door: '高端入户门', smartLock: '智能锁', engineeringDoor: '工程门', fireDoor: '防火门', window: '系统窗', curtainWall: '门窗幕墙配套', smartHome: '智能入口方案', security: '安防门与门禁', buildingMaterials: '门墙柜一体化方案' }
  return Object.entries(profile).filter(([, score]) => score >= 4).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([key]) => mapping[key])
}

function buildExhibitTheme(profile) {
  const top = Object.entries(profile).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([key]) => EXHIBITION_DETAIL_CATEGORY_LABELS[key])
  return `${top.join(' × ')}专业方案`
}
