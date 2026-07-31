# MEMORY — 动态记忆与程序性记忆

---

## 动态记忆（Layer 2）

> 跨周保留的洞见、决策、偏好。有生命周期，定期校准。
> 格式：★★★/★★☆/★☆☆ · last_activated: YYYY-MM-DD

- ★★★ · last_activated: 2026-07-29
  做市场分析时偏好直观的视觉数据展示（产品图片+价格带对应），对纯文本报告接受度低。进一步延伸到要求数据点可点击跳转源站，对交互性有明确要求。同时也对数据标签的准确性敏感（如"on sale"与"on promotion"的区别）。对产品图片显示完整性要求高——不接受 `object-fit: cover` 裁切，坚持所有区域的图片都完整可见。对数据准确性有独立验证习惯，会对照源网站核查 SKU 数量和分类数字，不依赖页面上的声明。对源网站有深层了解，知晓隐藏的数据机制（如 URL 排序参数 `?sort=popular`），当 AI 找不到数据时会直接给出精确的技术路径——期待 AI 不仅看可见 UI，也要关注 URL 参数、API 调用等数据层。在家居材质分类上有专业领域的精确认知：stoneware/stone-finish 属于陶瓷而非树脂，只有名字明确标注 "effect" 的才是 polyresin 仿制效果——会用行业术语纠正 AI 的材质归类错误。更进一步，对材质分类要求 AI 必须打开每个产品的 JYSK 页面，展开 Specifications 区域，读取 Material 字段的实际值——不接受从产品名推断材质。产品名的描述词可能完全误导（如 TORUP "beige stone" 实际是 Polyresin+Sand，LYCKSELE "terrazzo effect" 实际是 Stoneware）。唯一可靠的分类依据是 JYSK 产品页 Specifications → Material 字段。（来源：JYSK 卫浴分析任务；验证：3 轮材质分类纠正，最终通过逐产品打开 Specs 核实解决）

---

## 程序性记忆（Layer 3）

> 可复现的「情境 → 行动」模式。
> 格式见下方模板。

### 条目格式

```
### [模式名称]
- **trigger**: 触发这个模式的情境关键词
- **pattern**: 具体行动序列
- **last_activated**: YYYY-MM-DD
- **strength**: ★★★
```
