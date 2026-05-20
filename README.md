# iPhone Jack - 智能短视频生成平台

一个为 iPhone 手机壳产品营销打造的智能短视频生成平台，采用科技风格设计，深色主题 + 霓虹光效 + 粒子背景 + 3D 元素。

## 功能特性

### 核心功能
- **图片上传 + 预览**: 支持拖拽上传，实时预览
- **提示词生成**: 基于 AI 智能生成专业营销提示词
- **短视频生成**: 一键生成营销短视频
- **视频预览 + 编辑**: 查看生成结果，提供基础编辑功能

### 科技风格设计
- 深色主题，视觉舒适
- 霓虹光效（青色/紫色/蓝色）
- 粒子背景动画
- 玻璃拟态效果
- 3D 元素展示
- 流畅的页面过渡动画

## 技术栈

- **前端框架**: Vite + React + TypeScript
- **UI 组件**: Tailwind CSS + 自定义组件
- **路由**: React Router v6
- **文件上传**: react-dropzone
- **动画**: Framer Motion + CSS Animations
- **图标**: Lucide React

## 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 项目结构

```
iphone-jack/
├── src/
│   ├── assets/              # 资源文件
│   │   ├── global.css       # 全局样式
│   │   └── variables.css    # CSS 变量
│   ├── components/          # 组件
│   │   ├── layout/          # 布局组件
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── PageTransition.tsx
│   │   ├── ui/              # UI 组件
│   │   ├── particle-bg/     # 粒子背景
│   │   └── 3d-showcase/     # 3D 展示
│   ├── pages/               # 页面组件
│   │   ├── Home.tsx
│   │   ├── Upload.tsx
│   │   ├── Generate.tsx
│   │   ├── Video.tsx
│   │   └── NotFound.tsx
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useImageUpload.ts
│   │   └── useAppState.ts
│   ├── services/            # API 服务
│   │   ├── api.ts
│   │   ├── imageService.ts
│   │   ├── promptService.ts
│   │   └── videoService.ts
│   ├── types/               # TypeScript 类型
│   ├── utils/               # 工具函数
│   └── App.tsx              # 主应用
├── public/                  # 静态资源
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.js
```

## 核心页面

### 首页 (Home)
- 3D 手机展示
- 粒子背景动画
- 特性介绍
- 快速导航

### 上传页面 (Upload)
- 拖拽图片上传
- 实时预览
- 缩略图画廊
- 文件验证

### 提示词生成 (Generate)
- 模板选择
- AI 提示词生成
- 一键复制
- 视频生成

### 视频页面 (Video)
- 视频生成进度
- 实时状态更新
- 视频预览
- 基础编辑功能

## 开发计划

### Phase 1: 已完成 ✅
- 项目初始化
- 基础架构搭建
- 布局组件实现
- 核心功能页面

### Phase 2: 待完成
- 3D 手机展示组件
- 粒子背景系统
- API 服务真实集成
- 视频生成功能完善

## API 服务架构

项目采用分层架构设计：

```typescript
// API 层
apiClient.get/post/delete() -> 统一请求处理

// 业务服务层
imageService / promptService / videoService
  -> 封装 API 调用

// 业务逻辑层
自定义 Hooks (useImageUpload, useAppState)
  -> 状态管理

// 组件层
React 组件使用 Hooks 和服务
```

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

MIT

## 作者

iPhone Jack Team

