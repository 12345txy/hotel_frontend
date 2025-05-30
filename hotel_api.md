# 酒店管理系统 API 接口文档

## 目录

- 房间管理
- 入住管理
- 退房管理
- 空调控制
- 账单管理

## 房间管理

### 获取所有房间

- **URL**: `/api/rooms`
- **方法**: `GET`
- **描述**: 获取所有房间信息
- **响应**: 房间列表

### 获取指定房间

- **URL**: `/api/rooms/{roomId}`
- **方法**: `GET`
- **描述**: 获取指定 ID 的房间信息
- **参数**:
  - `roomId`：房间 ID（路径参数）
- **响应**: 房间详细信息

## 入住管理

### 获取可用房间

- **URL**: `/api/checkin/available-rooms`
- **方法**: `GET`
- **描述**: 获取所有空闲房间号
- **响应**: 可用房间 ID 列表

### 办理入住

- **URL**: `/api/checkin/{roomId}`
- **方法**: `POST`
- **描述**: 顾客入住指定房间
- **参数**:
  - `roomId`：房间 ID（路径参数）
- **请求体**: `Guest` 对象（JSON 格式），包含：
  ```json
  {
    "id": "身份证号",
    "name": "姓名",
    "phone": "电话号码",
    "stayDays": 入住天数
  }
  ```
- **响应**: 成功/失败信息

## 退房管理

### 办理退房

- **URL**: `/api/checkout/{roomId}`
- **方法**: `POST`
- **描述**: 办理指定房间的退房手续
- **参数**:
  - `roomId`：房间 ID（路径参数）
- **响应**: 成功/失败信息

## 空调控制

### 开启空调

- **URL**: `/api/ac/{roomId}/turnOn`
- **方法**: `POST`
- **描述**: 开启指定房间的空调
- **参数**:
  - `roomId`：房间 ID（路径参数）
  - `mode`：模式（查询参数，`COOLING`/`HEATING`）
  - `fanSpeed`：风速（查询参数，可选，`HIGH`/`MEDIUM`/`LOW`）
  - `targetTemp`：目标温度（查询参数，可选）
- **响应**: 成功/失败信息

### 关闭空调

- **URL**: `/api/ac/{roomId}/turnOff`
- **方法**: `POST`
- **描述**: 关闭指定房间的空调
- **参数**:
  - `roomId`：房间 ID（路径参数）
- **响应**: 成功/失败信息

### 调整温度

- **URL**: `/api/ac/{roomId}/adjustTemp`
- **方法**: `POST`
- **描述**: 调整空调温度
- **参数**:
  - `roomId`：房间 ID（路径参数）
  - `targetTemp`：目标温度（查询参数）
- **响应**: 成功/失败信息

### 调整风速

- **URL**: `/api/ac/{roomId}/adjustFanSpeed`
- **方法**: `POST`
- **描述**: 调整空调风速
- **参数**:
  - `roomId`：房间 ID（路径参数）
  - `fanSpeed`：风速（查询参数，`HIGH`/`MEDIUM`/`LOW`）
- **响应**: 成功/失败信息

### 获取空调状态

- **URL**: `/api/ac/{roomId}`
- **方法**: `GET`
- **描述**: 获取指定房间空调状态
- **参数**:
  - `roomId`：房间 ID（路径参数）
- **响应**: 空调状态信息

## 账单管理

### 获取账单

- **URL**: `/api/billing/{roomId}`
- **方法**: `GET`
- **描述**: 获取指定房间的账单信息
- **参数**:
  - `roomId`：房间 ID（路径参数）
- **响应**: 账单详情

### 下载账单明细

- **URL**: `/api/billing/{roomId}/details`
- **方法**: `GET`
- **描述**: 下载指定房间的账单明细 Excel 文件
- **参数**:
  - `roomId`：房间 ID（路径参数）
- **响应**: Excel 文件下载

### 下载总账单

- **URL**: `/api/billing/{roomId}/bill`
- **方法**: `GET`
- **描述**: 下载指定房间的总账单 Excel 文件
- **参数**:
  - `roomId`：房间 ID（路径参数）
- **响应**: Excel 文件下载
