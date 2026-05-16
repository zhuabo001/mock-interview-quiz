# Dashboard 图表修复计划

## Context

Dashboard 页面的两张图表存在渲染问题：
1. 饼图（环形图）标签文字被截断，因为默认渲染在扇区内部，空间不足
2. 折线图数据全为 0，因为 mock handler 用 `new Date()` 动态生成月份范围（2025-12~2026-05），但 mock 跟进数据最晚只到 2025-03，导致时间范围完全不匹配

---

## 修复方案

### 修复 1：饼图标签位置

**文件**: `frontend/src/pages/DashboardPage.tsx`

将 label 的 `position` 设为 `'outside'`，让标签渲染在环形图外侧，避免被截断：

```tsx
label={{
  text: (d) => `${d.type}: ${(d.percentage * 100).toFixed(1)}%`,
  position: 'outside',
  connector: true,
  style: { fontSize: 12 },
}}
```

### 修复 2：折线图数据为空

**文件**: `frontend/src/mocks/handlers/dashboard.ts`

**根因**: handler 第 66 行 `const now = new Date()` 生成的是当前真实日期（2026-05），而 mock 数据中跟进记录的时间范围是 2023-01 ~ 2025-03。两者完全不重叠。

**修复方案**: 将 `now` 改为基于 mock 数据中最晚记录的固定参考日期。mock 数据最晚的跟进记录是 `2025-03-05`，所以参考日期应设为 `2025-03`，这样生成的 6 个月范围是 2024-10 ~ 2025-03，恰好覆盖有数据的时间段。

```typescript
// 使用固定参考日期，与 mock 数据对齐
const now = new Date('2025-03-15')
```

---

## 验证

修复后预期效果：
- 饼图：5 个类型的标签完整显示在环形图外侧，带引导线
- 折线图：6 个月（2024-10 ~ 2025-03）有真实的跟进数据波动，能看出趋势变化
