
---

## 一、数据建模方案

基于业务场景，核心实体关系如下：

**核心概念：**
- 一个客户可以买多个产品（多对多）
- 一个产品可以被多个客户持有（多对多）
- 持有关系有时间维度（持有时长）
- 跟进记录和客户强关联
- 产品状态会变化（募集中 → 运作中 → 已清盘）

### 实体关系设计

1. **产品 (Product/Fund)**
   - id, name, type, nav, totalScale, status, fundManager, establishDate, riskLevel, minInvest, annualReturn, description
   - 产品类型：股票型、债券型、混合型、货币型、指数型
   - 状态：募集中、运作中、已清盘

2. **客户 (Client)**
   - id, name, phone, company, position, tier(L1-L5), totalAssets, source, tags, salesPersonId, createdAt
   - 客户等级：按资产规模分等级（钻石/金/银/铜/潜客）

3. **持有关系 (Holding)**
   - id, clientId, fundId, amount, buyDate, buyNav, currentNav, return, status
   - 这是核心关联表，记录了客户买了什么产品、买了多少、盈亏情况

4. **跟进记录 (FollowUp)**
   - id, clientId, salesPersonId, type(电话/面谈/微信/邮件), content, nextAction, nextActionDate, createdAt
   - 跟进类型区分，方便后续统计

5. **业务员 (SalesPerson)**
   - id, name, department, phone, email, team, avatar

### Mock 数据结构

```
// 产品数据
{
  id: 'F001',
  name: '稳健增长一号',
  type: '混合型',
  nav: 1.2356,
  navDate: '2025-03-15',
  establishNav: 1.0000,
  totalScale: 1250000000,  // 12.5亿
  status: '运作中',
  fundManager: '张明',
  establishDate: '2023-06-01',
  riskLevel: 'R3',
  minInvest: 100000,
  annualReturn: 0.0823,  // 年化8.23%
  description: '...'
}

// 客户数据
{
  id: 'C001',
  name: '张伟',
  phone: '138xxxx',
  company: '华盛投资',
  position: '总经理',
  tier: '钻石',
  totalAssets: 50000000,
  source: '渠道推荐',
  tags: ['高净值', '机构', '长期'],
  salesPersonId: 'S001',
  createdAt: '2024-01-15'
}

// 持有关系
{
  id: 'H001',
  clientId: 'C001',
  fundId: 'F001',
  amount: 3000000,  // 300万
  buyDate: '2024-03-01',
  buyNav: 1.0100,
  return: 0.2233,  // 浮盈22.33%
  status: '持有中'
}

// 跟进记录（至少每个客户3-5条）
{
  id: 'FU001',
  clientId: 'C001',
  type: '面谈',
  content: '在客户公司会议室沟通，详细介绍了稳健增长一号的投资策略和近半年来表现，客户对年化7%以上的预期收益表示认可。'
  salesPersonId: 'S001',
  nextAction: '发送正式认购协议并预约签署时间',
  nextActionDate: '2025-03-20',
  createdAt: '2025-03-15 10:30:00'
}
```
