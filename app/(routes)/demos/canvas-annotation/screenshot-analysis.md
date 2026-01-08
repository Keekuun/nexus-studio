# 系统级截图方案可行性分析

## 方案概述

使用 `navigator.mediaDevices.getDisplayMedia()` + `ImageCapture` API 实现系统级截图。

## 技术可行性评估

### ✅ 优点

1. **真实系统截图**
   - 捕获的是浏览器实际渲染的画面
   - 包含所有浏览器扩展、系统 UI 等
   - 与用户看到的完全一致

2. **高质量输出**
   - 原生系统分辨率
   - 不受 CSS 渲染限制
   - 支持高 DPR 设备

3. **支持复杂内容**
   - 可以捕获 iframe、视频等 html2canvas 难以处理的内容
   - 不受跨域限制

### ❌ 缺点和限制

1. **用户体验问题**
   - ⚠️ **每次截图都需要用户手动授权**（弹出系统窗口选择屏幕/窗口）
   - 无法实现自动化截图
   - 用户可能拒绝授权

2. **浏览器兼容性**
   - `getDisplayMedia()`: Chrome 72+, Edge 79+, Firefox 66+, Safari 13+ ✅
   - `ImageCapture` API: **仅 Chrome/Edge 支持** ❌
   - Safari 和 Firefox 不支持 `ImageCapture` API

3. **功能限制**
   - ❌ **无法截取滚动内容**（只能截取当前可见区域）
   - ❌ **无法截取超出视口的内容**
   - 坐标计算可能不准确（需要处理 DPR、缩放等）

4. **隐私和安全**
   - 需要用户授权屏幕共享权限
   - 可能让用户感到不安（担心隐私泄露）
   - 不适合后台自动化场景

5. **代码问题**
   ```javascript
   // 问题1: displaySurface 选项不支持
   displaySurface: captureWholeScreen ? 'monitor' : 'browser'
   // ❌ 这个选项不存在，getDisplayMedia 不支持指定显示表面类型
   
   // 问题2: 坐标计算可能不准确
   rect.left * window.devicePixelRatio  // 需要考虑浏览器缩放、滚动等
   ```

## 与当前 html2canvas 方案对比

| 特性 | getDisplayMedia | html2canvas |
|------|----------------|-------------|
| **用户交互** | 需要每次授权 ❌ | 无需交互 ✅ |
| **滚动内容** | 不支持 ❌ | 支持 ✅ |
| **浏览器兼容** | 部分支持 ⚠️ | 广泛支持 ✅ |
| **样式保真度** | 完美 ✅ | 需要处理 ⚠️ |
| **自动化** | 不支持 ❌ | 支持 ✅ |
| **iframe/视频** | 支持 ✅ | 有限支持 ⚠️ |
| **跨域内容** | 支持 ✅ | 有限支持 ⚠️ |

## 适用场景

### ✅ 适合使用 getDisplayMedia 的场景

1. **用户主动截图**（需要用户交互）
2. **截取可见区域**（不需要滚动内容）
3. **需要捕获 iframe/视频等复杂内容**
4. **Chrome/Edge 环境**（ImageCapture 支持）

### ❌ 不适合的场景

1. **自动化截图**（批量处理）
2. **截取长页面**（滚动内容）
3. **Safari/Firefox 环境**
4. **需要静默截图**（后台处理）

## 改进建议

### 方案1: 混合方案（推荐）

```javascript
async function smartScreenshot(target) {
  // 1. 检测浏览器支持
  if (!window.ImageCapture || !navigator.mediaDevices?.getDisplayMedia) {
    // 降级到 html2canvas
    return html2canvasScreenshot(target);
  }
  
  // 2. 检测是否需要滚动内容
  const needsScroll = target.scrollHeight > target.clientHeight;
  if (needsScroll) {
    // 使用 html2canvas（支持滚动）
    return html2canvasScreenshot(target);
  }
  
  // 3. 用户确认后使用系统截图
  const userConfirmed = await confirm('需要授权屏幕共享权限');
  if (userConfirmed) {
    return systemScreenshot(target);
  }
  
  // 降级到 html2canvas
  return html2canvasScreenshot(target);
}
```

### 方案2: 修复代码问题

```javascript
async function systemScreenshot(target) {
  try {
    // 修复1: 移除不支持的 displaySurface 选项
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: 'always',
        // displaySurface 选项不存在，移除
      }
    });

    const videoTrack = stream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(videoTrack);
    const bitmap = await imageCapture.grabFrame();

    videoTrack.stop();
    stream.getTracks().forEach(track => track.stop());

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (target) {
      const rect = target.getBoundingClientRect();
      // 修复2: 考虑浏览器缩放和滚动
      const scale = bitmap.width / window.screen.width;
      const scrollX = window.scrollX || 0;
      const scrollY = window.scrollY || 0;
      
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      ctx.drawImage(
        bitmap,
        (rect.left + scrollX) * scale,
        (rect.top + scrollY) * scale,
        rect.width * scale,
        rect.height * scale,
        0, 0, rect.width, rect.height
      );
    } else {
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      ctx.drawImage(bitmap, 0, 0);
    }

    return canvas.toDataURL('image/png', 1.0);
  } catch (err) {
    console.error('系统截图失败，降级到 html2canvas:', err);
    // 降级方案
    return html2canvas(target).then(canvas => canvas.toDataURL('image/png'));
  }
}
```

## 关于只截取文章内容（不包含批注蒙层）

### 问题

**getDisplayMedia API 本身不支持只截取文章内容**，因为：

1. 它是系统级截图，会捕获屏幕上**实际显示的所有内容**
2. 如果批注蒙层覆盖在文章上方，系统截图会**同时捕获两者**
3. 无法像 html2canvas 那样只截取特定的 DOM 元素

### 解决方案

可以通过以下方式实现只截取文章内容：

#### 方案1: 临时隐藏蒙层（推荐）

```javascript
async function captureArticleOnly(target, overlayElement) {
  try {
    // 1. 临时隐藏批注蒙层
    const originalDisplay = overlayElement.style.display;
    overlayElement.style.display = 'none';
    
    // 2. 等待 DOM 更新
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // 3. 使用系统截图
    const screenshot = await systemScreenshot(false, target);
    
    // 4. 恢复蒙层显示
    overlayElement.style.display = originalDisplay;
    
    return screenshot;
  } catch (err) {
    // 恢复蒙层显示（即使出错）
    overlayElement.style.display = originalDisplay || '';
    throw err;
  }
}
```

#### 方案2: 使用 html2canvas（当前方案，已实现）

```javascript
// 当前实现：html2canvas 只截取 articleRef.current
// 因为 articleRef 指向文章容器，不包含外部的蒙层
const canvas = await html2canvas(articleRef.current, {
  // ... 配置
});
```

**优势**：
- ✅ 不需要临时隐藏元素
- ✅ 可以截取滚动内容
- ✅ 更精确的元素选择

### 对比

| 方案 | 只截文章 | 截取滚动 | 用户交互 | 兼容性 |
|------|---------|---------|---------|--------|
| **getDisplayMedia + 隐藏蒙层** | ✅ | ❌ | 需要授权 | 部分支持 |
| **html2canvas（当前）** | ✅ | ✅ | 无需交互 | 广泛支持 |

## 结论

### 当前项目建议

**不建议完全替换 html2canvas**，原因：

1. ✅ 当前 html2canvas 方案已经解决了主要问题（样式、滚动内容）
2. ✅ **html2canvas 天然支持只截取文章内容**（通过 ref 选择元素）
3. ❌ getDisplayMedia 需要用户交互，不适合自动化场景
4. ❌ 无法截取滚动内容，这是当前项目的核心需求
5. ⚠️ 浏览器兼容性有限（ImageCapture 仅 Chrome/Edge）

### 推荐方案

**保留 html2canvas 作为主要方案**，原因：

1. **已完美支持只截取文章内容**：通过 `articleRef.current` 只截取文章容器
2. **支持滚动内容**：可以截取完整的长文章
3. **无需用户交互**：自动化截图
4. **广泛兼容**：支持所有主流浏览器

如果确实需要使用 getDisplayMedia，可以考虑：

1. **作为可选功能**：提供"系统截图"选项，让用户选择
2. **混合使用**：短内容用系统截图，长内容用 html2canvas
3. **降级策略**：系统截图失败时自动降级到 html2canvas

## 代码实现建议

如果要在项目中实现，建议：

1. 添加浏览器检测
2. 提供用户选择（系统截图 vs html2canvas）
3. 实现完善的降级机制
4. 处理滚动内容检测

