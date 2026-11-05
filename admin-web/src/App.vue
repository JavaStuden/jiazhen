<script setup>
import { computed, onMounted, ref } from 'vue'

const tab = ref('dashboard')
const loading = ref(false)
const dashboard = ref({})
const orders = ref([])
const providers = ref([])
const services = ref([])
const filter = ref('全部')
const authenticated = ref(false)
const username = ref('')
const password = ref('')
const loginError = ref('')

// 套餐编辑弹窗状态
const showServiceModal = ref(false)
const editingServiceId = ref(null)
const serviceForm = ref({
  name: '',
  category: '家政保洁',
  description: '',
  area: '50-80㎡',
  durationHours: 3,
  durationLabel: '3小时',
  typeTag: '深度清洁',
  price: 168,
  technicalFee: 9.9,
  active: true,
  tagsText: '≤80㎡,客厅/卧室/厨卫,平台标准,可开发票',
  sectionsText: '客厅与卧室|地面清扫拖洗、家具表面除尘\n厨房|台面、水槽、灶台表面及地面清洁\n卫生间|洁具、镜面、台盆及地面清洁\n收尾整理|垃圾归集、物品简单归位',
  includedText: '客厅、卧室地面清扫拖洗\n家具及常用台面表面除尘\n厨房台面、水槽、灶台表面清洁\n卫生间洁具、镜面、台盆清洁\n厨房、卫生间地面清洁\n垃圾归集与物品简单归位',
  disclaimer: '不包含：高空玻璃、重度除垢、家电拆洗；超出套餐范围须先与雇主确认。'
})

// 服务人员编辑弹窗状态
const showProviderModal = ref(false)
const editingProviderId = ref(null)
const providerForm = ref({
  name: '',
  creditScore: 96,
  status: '在线',
  skillsText: '深度保洁,居家照护',
  completedOrders: 100,
  rating: 4.9,
  goodRate: '98%',
  experienceYears: 5,
  hourlyPrice: 42,
  distance: '1.2km',
  healthCertValid: true,
  skillCertValidUntil: '2028-05-16'
})

// 派单选择服务人员弹窗
const showAssignModal = ref(false)
const assigningOrder = ref(null)
const selectedProviderId = ref(1)

const tabs = [
  ['dashboard', '工作台'],
  ['orders', '订单管理'],
  ['providers', '服务人员'],
  ['services', '服务项目与套餐配置']
]

const base = import.meta.env.BASE_URL + 'api/'

async function api(path, opts = {}) {
  const r = await fetch(base + path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...opts
  })
  if (r.status === 401) {
    authenticated.value = false
    throw Error('请先登录管理端')
  }
  if (!r.ok) throw Error('请求失败')
  return r.json()
}

async function login() {
  loginError.value = ''
  try {
    await api('auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: username.value, password: password.value })
    })
    authenticated.value = true
    password.value = ''
    await load()
  } catch {
    loginError.value = '账号或密码错误'
  }
}

async function logout() {
  try {
    await api('auth/logout', { method: 'POST' })
  } finally {
    authenticated.value = false
  }
}

async function load() {
  loading.value = true
  try {
    dashboard.value = await api('admin/dashboard')
    orders.value = await api('admin/orders')
    providers.value = await api('admin/providers')
    services.value = await api('admin/services')
    if (providers.value.length && !selectedProviderId.value) {
      selectedProviderId.value = providers.value[0].id
    }
  } finally {
    loading.value = false
  }
}

const filtered = computed(() =>
  filter.value === '全部'
    ? orders.value
    : orders.value.filter(o => o.status === filter.value)
)

async function status(o, s) {
  await api(`admin/orders/${o.id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: s })
  })
  await load()
}

function openAssignModal(o) {
  assigningOrder.value = o
  if (providers.value.length) {
    selectedProviderId.value = providers.value[0].id
  }
  showAssignModal.value = true
}

async function confirmAssign() {
  if (!assigningOrder.value) return
  await api(`admin/orders/${assigningOrder.value.id}/accept?providerId=${selectedProviderId.value}`, {
    method: 'POST'
  })
  showAssignModal.value = false
  assigningOrder.value = null
  await load()
}

async function handleAnomaly(o, agreed) {
  await api(`admin/orders/${o.id}/anomaly-confirm`, {
    method: 'POST',
    body: JSON.stringify({ agreed })
  })
  await load()
}

function openCreateService() {
  editingServiceId.value = null
  serviceForm.value = {
    name: '',
    category: '家政保洁',
    description: '',
    area: '50-80㎡',
    durationHours: 3,
    durationLabel: '3小时',
    typeTag: '深度清洁',
    price: 168,
    technicalFee: 9.9,
    active: true,
    tagsText: '≤80㎡,客厅/卧室/厨卫,平台标准,可开发票',
    sectionsText: '客厅与卧室|地面清扫拖洗、家具表面除尘\n厨房|台面、水槽、灶台表面及地面清洁\n卫生间|洁具、镜面、台盆及地面清洁\n收尾整理|垃圾归集、物品简单归位',
    includedText: '客厅、卧室地面清扫拖洗\n家具及常用台面表面除尘\n厨房台面、水槽、灶台表面清洁\n卫生间洁具、镜面、台盆清洁\n厨房、卫生间地面清洁\n垃圾归集与物品简单归位',
    disclaimer: '不包含：高空玻璃、重度除垢、家电拆洗；超出套餐范围须先与雇主确认。'
  }
  showServiceModal.value = true
}

function openEditService(s) {
  editingServiceId.value = s.id
  const sectionsLines = (s.serviceSections || [])
    .map(sec => `${sec.area}|${sec.detail}`)
    .join('\n')
  serviceForm.value = {
    name: s.name || '',
    category: s.category || '家政保洁',
    description: s.description || '',
    area: s.area || '50-80㎡',
    durationHours: s.durationHours || 3,
    durationLabel: s.durationLabel || `${s.durationHours || 3}小时`,
    typeTag: s.typeTag || '平台标准',
    price: s.price || 168,
    technicalFee: s.technicalFee ?? 9.9,
    active: s.active !== false,
    tagsText: (s.tags || []).join(','),
    sectionsText: sectionsLines || '客厅与卧室|地面清扫拖洗、家具表面除尘\n厨房|台面、水槽、灶台表面及地面清洁\n卫生间|洁具、镜面、台盆及地面清洁\n收尾整理|垃圾归集、物品简单归位',
    includedText: (s.includedItems || []).join('\n'),
    disclaimer: s.disclaimer || '不包含：高空玻璃、重度除垢、家电拆洗；超出套餐范围须先与雇主确认。'
  }
  showServiceModal.value = true
}

async function saveService() {
  const f = serviceForm.value
  const payload = {
    name: f.name.trim(),
    category: f.category,
    description: f.description.trim(),
    area: f.area.trim(),
    durationHours: Number(f.durationHours) || 3,
    durationLabel: f.durationLabel.trim() || `${f.durationHours || 3}小时`,
    typeTag: f.typeTag.trim(),
    price: Number(f.price) || 168,
    technicalFee: Number(f.technicalFee) || 9.9,
    active: Boolean(f.active),
    tags: f.tagsText.split(/[,，]/).map(x => x.trim()).filter(Boolean),
    sectionEntries: f.sectionsText.split('\n').map(x => x.trim()).filter(Boolean),
    includedItems: f.includedText.split('\n').map(x => x.trim()).filter(Boolean),
    disclaimer: f.disclaimer.trim()
  }
  if (editingServiceId.value) {
    await api(`admin/services/${editingServiceId.value}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  } else {
    await api('admin/services', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }
  showServiceModal.value = false
  await load()
}

async function toggleServiceActive(s) {
  const sectionsLines = (s.serviceSections || []).map(sec => `${sec.area}|${sec.detail}`)
  await api(`admin/services/${s.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...s,
      active: !s.active,
      sectionEntries: sectionsLines
    })
  })
  await load()
}

function openCreateProvider() {
  editingProviderId.value = null
  providerForm.value = {
    name: '',
    creditScore: 95,
    status: '在线',
    skillsText: '深度保洁,居家照护',
    completedOrders: 0,
    rating: 4.9,
    goodRate: '99%',
    experienceYears: 3,
    hourlyPrice: 42,
    distance: '1.5km',
    healthCertValid: true,
    skillCertValidUntil: '2028-12-31'
  }
  showProviderModal.value = true
}

function openEditProvider(p) {
  editingProviderId.value = p.id
  providerForm.value = {
    name: p.name || '',
    creditScore: p.creditScore || 95,
    status: p.status || '在线',
    skillsText: (p.skills || []).join(','),
    completedOrders: p.completedOrders || 0,
    rating: p.rating || 4.9,
    goodRate: p.goodRate || '98%',
    experienceYears: p.experienceYears || 5,
    hourlyPrice: p.hourlyPrice || 42,
    distance: p.distance || '1.2km',
    healthCertValid: p.healthCertValid !== false,
    skillCertValidUntil: p.skillCertValidUntil || '2028-05-16'
  }
  showProviderModal.value = true
}

async function saveProvider() {
  const f = providerForm.value
  const payload = {
    name: f.name.trim(),
    creditScore: Number(f.creditScore) || 95,
    status: f.status,
    skills: f.skillsText.split(/[,，]/).map(x => x.trim()).filter(Boolean),
    completedOrders: Number(f.completedOrders) || 0,
    rating: Number(f.rating) || 4.9,
    goodRate: f.goodRate.trim() || '98%',
    experienceYears: Number(f.experienceYears) || 3,
    hourlyPrice: Number(f.hourlyPrice) || 42,
    distance: f.distance.trim() || '1.2km',
    healthCertValid: Boolean(f.healthCertValid),
    skillCertValidUntil: f.skillCertValidUntil.trim() || '2028-05-16'
  }
  if (editingProviderId.value) {
    await api(`admin/providers/${editingProviderId.value}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  } else {
    await api('admin/providers', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }
  showProviderModal.value = false
  await load()
}

onMounted(async () => {
  try {
    authenticated.value = (await api('auth/me')).authenticated
    if (authenticated.value) await load()
  } catch {
    authenticated.value = false
  }
})
</script>

<template>
  <div v-if="!authenticated" class="login-page">
    <form class="login-card" @submit.prevent="login">
      <div class="logo">太</div>
      <p class="eyebrow">太禾行到家 · 运营中心</p>
      <h1>管理端登录</h1>
      <label>
        管理员账号
        <input v-model="username" autocomplete="username" required />
      </label>
      <label>
        登录密码
        <input v-model="password" type="password" autocomplete="current-password" required />
      </label>
      <p v-if="loginError" class="login-error">{{ loginError }}</p>
      <button class="primary">登录</button>
    </form>
  </div>

  <div v-else class="shell">
    <aside>
      <div class="brand">
        <div class="logo">太</div>
        <div>
          <b>太禾行</b>
          <small>到家管理端</small>
        </div>
      </div>
      <nav>
        <button
          v-for="x in tabs"
          :key="x[0]"
          :class="{ active: tab === x[0] }"
          @click="tab = x[0]"
        >
          {{ x[1] }}
        </button>
      </nav>
      <div class="aside-foot">
        平台运行正常<br />
        <span>Spring Boot API · 套餐实时同步</span>
        <button class="logout-mini" @click="logout">退出登录</button>
      </div>
    </aside>

    <main>
      <header>
        <div>
          <p class="eyebrow">太禾行到家 · 运营中心</p>
          <h1>{{ tabs.find(x => x[0] === tab)?.[1] }}</h1>
        </div>
        <div class="header-actions">
          <button v-if="tab === 'services'" class="primary" @click="openCreateService">
            + 新增服务套餐
          </button>
          <button v-if="tab === 'providers'" class="primary" @click="openCreateProvider">
            + 新增服务人员
          </button>
          <button class="refresh" @click="load">刷新数据</button>
        </div>
      </header>

      <div v-if="loading" class="loading">正在加载...</div>

      <!-- 工作台看板 -->
      <section v-else-if="tab === 'dashboard'">
        <div class="hero">
          <div>
            <span>累计订单</span>
            <strong>{{ dashboard.totalOrders || 0 }}</strong>
            <small>全平台</small>
          </div>
          <div>
            <span>待处理订单</span>
            <strong>{{ dashboard.pendingOrders || 0 }}</strong>
            <small>需要运营跟进</small>
          </div>
          <div>
            <span>服务中 / 待上门</span>
            <strong>{{ dashboard.servingOrders || 0 }}</strong>
            <small>当前履约</small>
          </div>
          <div>
            <span>入驻服务人员</span>
            <strong>{{ dashboard.providerCount || 0 }}</strong>
            <small>实名与技能核验</small>
          </div>
        </div>

        <div class="grid two">
          <article class="card">
            <h2>订单状态分布</h2>
            <div class="bars">
              <div
                v-for="s in ['待匹配', '待接单', '待上门', '服务中', '待结算', '已完成']"
                :key="s"
              >
                <span>{{ s }}</span>
                <i
                  :style="{
                    width:
                      Math.max(
                        8,
                        (orders.filter(o => o.status === s).length /
                          Math.max(1, orders.length)) *
                          100
                      ) + '%'
                  }"
                ></i>
                <b>{{ orders.filter(o => o.status === s).length }}</b>
              </div>
            </div>
          </article>

          <article class="card">
            <h2>运营中心快捷指引</h2>
            <p class="notice">
              前台小程序已取消“固定/任意模式”弹窗，直接读取后台配置的【服务套餐、四大区域内容与 6 项上门服务清单】。新订单可指派任意在线服务人员，服务完成后核验凭证进入结算。
            </p>
            <div class="quick-btns">
              <button class="primary" @click="tab = 'orders'">进入订单调度</button>
              <button class="refresh" @click="tab = 'services'">配置服务套餐与内容</button>
            </div>
          </article>
        </div>
      </section>

      <!-- 订单管理 -->
      <section v-else-if="tab === 'orders'" class="card">
        <div class="card-title">
          <div class="filters">
            <button
              v-for="s in ['全部', '待匹配', '待接单', '待上门', '服务中', '待结算', '已完成']"
              :key="s"
              :class="{ chosen: filter === s }"
              @click="filter = s"
            >
              {{ s }}
            </button>
          </div>
          <span>共 {{ filtered.length }} 条</span>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>订单号</th>
                <th>套餐与服务地址</th>
                <th>雇主信息</th>
                <th>预约时间</th>
                <th>费用明细</th>
                <th>服务人员与打卡</th>
                <th>状态 / 异常</th>
                <th>调度操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in filtered" :key="o.id">
                <td class="mono">{{ o.orderNo }}</td>
                <td>
                  <b>{{ o.serviceName }}</b>
                  <small>{{ o.area || '标准规格' }} · {{ o.durationLabel || '3小时' }}</small>
                  <small>{{ o.address }}</small>
                </td>
                <td>
                  {{ o.customerName }}
                  <small>{{ o.phone }}</small>
                </td>
                <td>{{ o.scheduledAt }}</td>
                <td>
                  <div class="money">¥{{ o.amount }}</div>
                  <small>技服费 ¥{{ o.technicalFee ?? 9.9 }} · 实付 ¥{{ o.payableAmount ?? o.amount }}</small>
                </td>
                <td>
                  <b v-if="o.providerName">{{ o.providerName }}</b>
                  <span v-else class="muted">暂未指派</span>
                  <small v-if="o.checkinTime">打卡：{{ o.checkinTime }} ({{ o.checkinAddress }})</small>
                </td>
                <td>
                  <em class="tag">{{ o.status }}</em>
                  <div v-if="o.anomalyStatus === '待确认'" class="anomaly-box">
                    <small>加时待确认：{{ o.anomalyTargetDuration }} (¥{{ o.anomalyTargetAmount }})</small>
                    <div class="anomaly-actions">
                      <button class="mini primary" @click="handleAnomaly(o, true)">同意调整</button>
                      <button class="mini" @click="handleAnomaly(o, false)">拒绝</button>
                    </div>
                  </div>
                  <small v-else-if="o.anomalyStatus && o.anomalyStatus !== '无'">
                    时长调整：{{ o.anomalyStatus }}
                  </small>
                </td>
                <td>
                  <button
                    v-if="['待匹配', '待接单'].includes(o.status)"
                    class="mini primary"
                    @click="openAssignModal(o)"
                  >
                    指派服务人员
                  </button>
                  <button
                    v-else-if="o.status === '待上门'"
                    class="mini"
                    @click="status(o, '服务中')"
                  >
                    开始服务
                  </button>
                  <button
                    v-else-if="o.status === '服务中'"
                    class="mini"
                    @click="status(o, '待结算')"
                  >
                    提交结算
                  </button>
                  <button
                    v-else-if="o.status === '待结算'"
                    class="mini primary"
                    @click="status(o, '已完成')"
                  >
                    确认完成
                  </button>
                  <span v-else class="muted">已归档</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 服务人员管理 -->
      <section v-else-if="tab === 'providers'">
        <div class="provider-grid">
          <article v-for="p in providers" :key="p.id" class="provider card">
            <div class="avatar">{{ p.name.slice(0, 1) }}</div>
            <div class="provider-main">
              <h2>
                {{ p.name }}
                <em class="tag" :class="{ green: p.status === '在线' }">{{ p.status }}</em>
              </h2>
              <p>
                信用分 {{ p.creditScore }} · 已完成 {{ p.completedOrders }} 单 · 评分 {{ p.rating || 4.9 }} · 好评率 {{ p.goodRate || '98%' }} · 从业 {{ p.experienceYears || 5 }} 年
              </p>
              <p class="cert-meta">
                时薪 ¥{{ p.hourlyPrice || 42 }}/小时起 · 距离 {{ p.distance || '1.2km' }} · 健康证：{{ p.healthCertValid !== false ? '有效' : '待补传' }} · 技能证有效期至 {{ p.skillCertValidUntil || '2028-05-16' }}
              </p>
              <div class="skills">
                <span v-for="s in p.skills" :key="s">{{ s }}</span>
              </div>
            </div>
            <button class="mini" @click="openEditProvider(p)">编辑资料</button>
          </article>
        </div>
      </section>

      <!-- 服务项目与套餐配置 -->
      <section v-else>
        <div class="service-grid">
          <article v-for="s in services" :key="s.id" class="card service-detail-card">
            <div class="service-card-top">
              <div class="service-image">{{ s.category.slice(0, 2) }}</div>
              <div class="service-head-info">
                <div class="service-badges">
                  <span class="eyebrow">{{ s.category }}</span>
                  <em class="tag" :class="{ green: s.active }">{{ s.active ? '上架中' : '已下架' }}</em>
                </div>
                <h2>{{ s.name }}</h2>
                <p>{{ s.area || '标准面积' }} · {{ s.durationLabel || s.durationHours + '小时' }} · {{ s.typeTag || '平台标准' }}</p>
              </div>
              <div class="service-price-col">
                <b>¥{{ s.price }}<small>/次</small></b>
                <small>技术服务费 ¥{{ s.technicalFee ?? 9.9 }}</small>
              </div>
            </div>

            <div class="service-sections-preview" v-if="s.serviceSections && s.serviceSections.length">
              <h4>四大区域服务内容（对应小程序选服务页）：</h4>
              <div class="sec-grid">
                <div v-for="sec in s.serviceSections" :key="sec.area" class="sec-item">
                  <b>· {{ sec.area }}：</b><span>{{ sec.detail }}</span>
                </div>
              </div>
            </div>

            <div class="service-included-preview" v-if="s.includedItems && s.includedItems.length">
              <h4>本次上门服务内容清单（对应小程序发布需求页）：</h4>
              <ul class="inc-list">
                <li v-for="item in s.includedItems" :key="item">{{ item }}</li>
              </ul>
            </div>

            <p class="disclaimer-preview">{{ s.disclaimer }}</p>

            <div class="service-card-actions">
              <button class="mini primary" @click="openEditService(s)">编辑套餐与服务内容</button>
              <button class="mini" @click="toggleServiceActive(s)">
                {{ s.active ? '下架套餐' : '上架套餐' }}
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>

    <!-- 套餐新增/编辑弹窗 -->
    <div v-if="showServiceModal" class="modal-backdrop" @click.self="showServiceModal = false">
      <form class="modal-card" @submit.prevent="saveService">
        <h2>{{ editingServiceId ? '编辑服务套餐与内容' : '新增服务套餐' }}</h2>
        <div class="form-grid">
          <label>
            套餐名称
            <input v-model="serviceForm.name" placeholder="如：3小时深度保洁" required />
          </label>
          <label>
            服务分类
            <select v-model="serviceForm.category">
              <option value="家政保洁">家政保洁</option>
              <option value="养老护理">养老护理</option>
              <option value="上门维修">上门维修</option>
              <option value="陪医陪诊">陪医陪诊</option>
            </select>
          </label>
          <label>
            适用面积
            <input v-model="serviceForm.area" placeholder="如：50-80㎡" required />
          </label>
          <label>
            服务时长（小时数）
            <input v-model="serviceForm.durationHours" type="number" min="1" required />
          </label>
          <label>
            时长展示文字
            <input v-model="serviceForm.durationLabel" placeholder="如：3小时" required />
          </label>
          <label>
            类型标签
            <input v-model="serviceForm.typeTag" placeholder="如：深度清洁" required />
          </label>
          <label>
            套餐价格（元/次）
            <input v-model="serviceForm.price" type="number" min="1" required />
          </label>
          <label>
            技术服务费（平台独立设置，元）
            <input v-model="serviceForm.technicalFee" type="number" step="0.1" min="0" required />
          </label>
        </div>

        <label>
          套餐简述
          <input v-model="serviceForm.description" placeholder="一句话简述" />
        </label>

        <label>
          推荐标签（逗号分隔）
          <input v-model="serviceForm.tagsText" placeholder="如：≤80㎡,客厅/卧室/厨卫,平台标准,可开发票" />
        </label>

        <label>
          本套餐四大区域服务内容（每行一条，格式：区域名称|服务明细）
          <textarea v-model="serviceForm.sectionsText" rows="4" required></textarea>
        </label>

        <label>
          本次上门服务内容 6 项清单（每行一条，将在小程序发布需求页完整调出）
          <textarea v-model="serviceForm.includedText" rows="6" required></textarea>
        </label>

        <label>
          不包含条款与履约说明
          <input v-model="serviceForm.disclaimer" required />
        </label>

        <div class="modal-actions">
          <button type="button" class="refresh" @click="showServiceModal = false">取消</button>
          <button type="submit" class="primary">保存并同步至小程序</button>
        </div>
      </form>
    </div>

    <!-- 服务人员新增/编辑弹窗 -->
    <div v-if="showProviderModal" class="modal-backdrop" @click.self="showProviderModal = false">
      <form class="modal-card" @submit.prevent="saveProvider">
        <h2>{{ editingProviderId ? '编辑服务人员资料' : '新增服务人员' }}</h2>
        <div class="form-grid">
          <label>
            姓名
            <input v-model="providerForm.name" required />
          </label>
          <label>
            接单状态
            <select v-model="providerForm.status">
              <option value="在线">在线</option>
              <option value="待机">待机</option>
              <option value="待审核">待审核</option>
              <option value="服务中">服务中</option>
              <option value="休息">休息</option>
            </select>
          </label>
          <label>
            信用分
            <input v-model="providerForm.creditScore" type="number" min="60" max="100" required />
          </label>
          <label>
            累计完单数
            <input v-model="providerForm.completedOrders" type="number" min="0" required />
          </label>
          <label>
            综合评分
            <input v-model="providerForm.rating" type="number" step="0.1" min="1" max="5" required />
          </label>
          <label>
            好评率
            <input v-model="providerForm.goodRate" placeholder="98%" required />
          </label>
          <label>
            服务经验（年）
            <input v-model="providerForm.experienceYears" type="number" min="1" required />
          </label>
          <label>
            时薪起步价（元/小时）
            <input v-model="providerForm.hourlyPrice" type="number" min="10" required />
          </label>
          <label>
            距离显示
            <input v-model="providerForm.distance" placeholder="1.2km" />
          </label>
          <label>
            技能证书有效期至
            <input v-model="providerForm.skillCertValidUntil" placeholder="2028-05-16" />
          </label>
        </div>

        <label>
          服务技能标签（逗号分隔）
          <input v-model="providerForm.skillsText" placeholder="深度保洁,居家照护,陪伴沟通,助餐整理" required />
        </label>

        <div class="modal-actions">
          <button type="button" class="refresh" @click="showProviderModal = false">取消</button>
          <button type="submit" class="primary">保存人员信息</button>
        </div>
      </form>
    </div>

    <!-- 订单指派服务人员弹窗 -->
    <div v-if="showAssignModal" class="modal-backdrop" @click.self="showAssignModal = false">
      <form class="modal-card small-modal" @submit.prevent="confirmAssign">
        <h2>指派服务人员</h2>
        <p v-if="assigningOrder" class="muted">
          订单号：{{ assigningOrder.orderNo }} · {{ assigningOrder.serviceName }} ({{ assigningOrder.address }})
        </p>
        <label>
          选择接单服务人员
          <select v-model="selectedProviderId">
            <option v-for="p in providers" :key="p.id" :value="p.id">
              {{ p.name }}（{{ p.status }} · 信用分 {{ p.creditScore }} · {{ (p.skills || []).join('/') }}）
            </option>
          </select>
        </label>
        <div class="modal-actions">
          <button type="button" class="refresh" @click="showAssignModal = false">取消</button>
          <button type="submit" class="primary">确认指派</button>
        </div>
      </form>
    </div>
  </div>
</template>
