# 前端页面布局说明
首先酒店有3台空调，5个房间，房间号为1-5，空调号为1-3
## 1. 首页
首页是一个大的展示酒店的页面（偏向于介绍和展示的风格），具有两个选择：用户在这个页面可以选择以酒店管理员的身份进入系统也可以以顾客的身份进入系统。
## 2. 顾客操作页面
### 2.1 办理入住页面
用户在这个页面需要进行以下流程：
1. 输入个人信息（姓名、身份证号、联系方式、预计入住天数）
2. 然后系统会按照空余房间的房间号从小到大进行分配，给顾客分配一个房间号
3. 系统会根据顾客的预计入住天数生成押金，并且顾客可以选择打印入住订单，订单包括用户信息和预计天数、押金的值以及入住时间
### 2.2 使用空调
用户与入住的房间建立联系之后，就可以使用这个房间的空调（之后发送的空调控制信息都会带上房间号作为参数），空调控制页面会显示当前的室温和当前的目标温度(默认为25度)，当前的风速（默认为中分数）和空调运行时间以及空调的累计费用，用户可以调温（更改目标温度）和调风（分低，中，高三档），在调完后点击确认按钮方可提交调控的信息，同时这个界面会有两个按钮，分别是空调关机和退房，点击退房会跳转到退档结账页面
### 2.3 退房结账页面
在这个页面会显示顾客的个人信息和账单信息
账单信息包括住宿账单和空调账单和部分详单
然后有打印详单的按钮，点击可以打印详单
住宿账单样例：
- **入住人信息**：张三（身份证：110101199001011234）  
- **入住时间**：2025-05-10 10:30  
- **房间号**：302  
- **已住时长**：2天12小时  
- **办理退宿时间**：2025-05-12 14:30  
- **住宿费用总计**：¥800  
- **已支付押金**：¥500  
- **还需缴纳**：¥300 
空调使用账单样例：
- **房间号**：302  
- **空调使用时长**：24小时  
- **需缴纳费用**：¥80  
空调详单样例：


| 使用时段          | 温度设置 | 风速 | 时长   | 费用  |
| ----------------- | -------- | ---- | ------ | ----- |
| 08:00 – 12:00     | 24°C     | 低速 | 4分钟  | ¥20   |
| 14:00 – 18:00     | 25°C     | 中速 | 4分钟  | ¥30   |
| 20:00 – 08:00     | 26°C     | 低速 | 12分钟 | ¥30   |
## 3. 管理员监控页面
管理员可以对三台空调进行监控，查看所有空调的信息（风速和目标温度等以及当前是否开机，服务的房间号，累计费用）还可以支持三台空调的总的统计，可以适当进行数据可视化（比如echarts之类的）
 

