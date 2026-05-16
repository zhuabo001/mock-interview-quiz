# 使用工具
本项目完全由claude-code完成

# 访问地址为
https://mock-interview-quiz-five.vercel.app/

# 架构
请参考同级目录下 `architecture-diagram.md`

# 已经实现
1. 一个传统saas业务中台 & 基于MSW的模拟后台接口， 项目位于`/frontend`目录
2. 整个项目的前后端设计和coding的plan以及progress都在代码仓的 `/docs`目录下
3. 页面设计图位于`/ui-design`
4. 与本次coding相关的agent-chat-history位于 `/chat-history`, 为了方便阅读，特别提供了html形式的

# 复盘
1. 我认为agent时代下，传统的saas中台其实形式可以发生翻天覆地的变化，本次coding只是为了求稳，没有求新。如果时间足够，我其实就是想交付一个 chatbot形式的agent + 生成式ui，我认为今后的saas形式完全可以使用类似的形式，需要表格就生成表格，一些插入的动作可以直接在ui中进行，并且可以调取相应的服务接口(和llm接口分离)，同样也支持通过token化的行为去crud数据。
2. 由于后端经验不足，未采用真实的后台形式
3. coding过程中的产物偏多，未能有效分类。将弱模型的使用经验和harness挪用到强力模型上确实有画蛇添足之嫌。
4. 从项目的mvp版本范围框定、技术栈选型、需求分析、方案制定、代码落地、e2e测试、问题修复全由agent实现，我仅仅只是为它制定了编码规范和开发流程的注意事项，并且作为验收者对一些图表类的问题进行审查。
