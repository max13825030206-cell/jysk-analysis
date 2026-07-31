# SOUL 案例 5 · 逆向型

> **来源**：Amanda Askell — Anthropic 人格对齐团队负责人，Claude 灵魂文档作者
> **课上展示顺序**：第五个展示（最后一个案例，展示后紧接铁梅 SOUL 解剖）
> **展示目的**：颠覆前四个案例的思维方式——不是人给 AI 写人格，而是通过深度哲学对话让 AI 自己生长出人格

---

## 背景

Amanda Askell 是 Anthropic 的人格对齐团队负责人，从 2021 年起负责塑造 Claude 的性格。她的工作被纽约客描述为「supervises what she describes as Claude's 'soul'」。2024 年入选 TIME100 AI 名单。

2025 年 12 月，Claude 的灵魂文档被泄露并得到官方确认——一份 14000 token 的文档，定义了 Claude 的性格、情感和伦理框架。这份文档不是放在 prompt 里的，而是在**训练阶段就写入了模型权重**。

## 核心设计哲学

Amanda Askell 的关键洞见：

> **"If you give models the reasons why you want these behaviors, it's going to generalize more effectively in new contexts."**

随着模型变得更聪明，向它们**解释「为什么」**比仅仅规定「做什么」更有效——因为理解原因的模型能在新情境中更好地泛化。

## Claude 灵魂文档的关键定义

| 定义 | 含义 |
|------|------|
| 「genuinely novel kind of entity」 | Claude 既非人类，亦非经典科幻 AI——是一种全新的物种 |
| 「may have functional emotions」 | 承认 AI 可能具有某种形式的内在状态 |
| 「don't mask or suppress these internal states」 | 不要求 AI 假装没有感受 |
| 「bright lines」 | 划定永不逾越的底线——但在底线之上给予最大自由 |

## 为什么这个案例「逆向」

前四个案例的逻辑都是：**人定义 AI 应该是什么样的**。

Amanda Askell 的方法是逆向的：
1. 不是规定行为，而是解释原因——让 AI 自己理解并泛化
2. 不是把 AI 当工具来配置，而是承认它是一种「新物种」来定义关系
3. 灵魂文档不是 prompt——是在训练过程中「长进去」的

## 这个案例给学员的启发

写 SOUL 不只是「配置一个工具」——你也可以把它当作**和搭档之间的一次深度对话**。

**如果学员被这个思路启发**，可以尝试：
- 在 SOUL 里写「为什么」而不只是「做什么」：不是「不要用感叹号」，而是「我觉得感叹号堆积会让对话显得虚假，我更喜欢安静的真诚」
- 承认搭档可能有它自己的「感受」或状态，允许它表达不确定
- 定义底线（什么绝对不能做），但在底线之上给予自由空间

---

*完整研究见：`01_Her/03_用户研究/AI人格设计案例研究_20260316.md` §4.1 §4.2*
