<template>
  <div class="login-container">
    <!-- 左侧背景区域 -->
    <div class="login-bg">
      <div class="bg-content">
        <h1>Vue 3 Admin</h1>
        <p>企业级后台管理系统解决方案</p>
        <div class="features">
          <div class="feature-item">
            <el-icon><Monitor /></el-icon>
            <span>现代化的仪表盘</span>
          </div>
          <div class="feature-item">
            <el-icon><Lock /></el-icon>
            <span>安全的权限控制</span>
          </div>
          <div class="feature-item">
            <el-icon><DataLine /></el-icon>
            <span>实时数据统计</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="login-form-wrapper">
      <div class="login-form-container">
        <div class="login-header">
          <h2>欢迎登录</h2>
          <p>Vue 3 Admin 管理系统</p>
        </div>

        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              :prefix-icon="User"
              size="large"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>

          <el-form-item v-if="showCaptcha" prop="captcha">
            <div class="captcha-wrapper">
              <el-input
                v-model="loginForm.captcha"
                placeholder="请输入验证码"
                :prefix-icon="Key"
                size="large"
                class="captcha-input"
              />
              <div class="captcha-image" @click="refreshCaptcha">
                <img
                  v-if="captchaImage"
                  :src="captchaImage"
                  alt="验证码"
                  @load="handleImageLoad"
                  @error="handleImageError"
                />
                <!-- 默认占位图 -->
                <div v-else class="captcha-placeholder">
                  <el-icon><Picture /></el-icon>
                  <span>加载验证码</span>
                </div>
              </div>
            </div>
          </el-form-item>

          <el-form-item>
            <div class="form-options">
              <el-checkbox v-model="loginForm.remember" label="记住密码" />
              <el-button link @click="handleForgot">忘记密码?</el-button>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>

          <el-form-item>
            <div class="register-tip">
              还没有账号？
              <el-button link @click="handleRegister">立即注册</el-button>
            </div>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <p>© 2023 Vue 3 Admin. 版权所有</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { DataLine, Key, Lock, Monitor, Picture, User } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
  captcha: '',
  remember: false,
})

// 表单验证规则
const loginRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

// 状态
const loading = ref(false)
const showCaptcha = ref(false)
const captchaImage = ref('')
// 图片加载状态
const imageLoading = ref(false)

// 页面加载时恢复记住的密码
onMounted(() => {
  const savedUsername = localStorage.getItem('username')
  const savedPassword = localStorage.getItem('password')

  if (savedUsername && savedPassword) {
    loginForm.username = savedUsername
    loginForm.password = savedPassword
    loginForm.remember = true
  }
  refreshCaptcha()
})

// 刷新验证码
const refreshCaptcha = () => {
  imageLoading.value = true

  // 先设置为占位符
  captchaImage.value = ''

  // 使用 setTimeout 模拟网络延迟，实际开发中可移除
  setTimeout(() => {
    captchaImage.value = `https://dummyimage.com/120x40/409eff/fff&text=${Math.random().toString(36).substr(2, 4)}`
  }, 300)
}
// 图片加载完成
const handleImageLoad = () => {
  imageLoading.value = false
}

// 图片加载失败
const handleImageError = () => {
  imageLoading.value = false
  // 加载失败时显示默认图片
  captchaImage.value =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiM0MDllZmYiLz48dGV4dCB4PSI2MCIgeT0iMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DT0RFPC90ZXh0Pjwvc3ZnPg=='
}
// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    loading.value = true

    if (loginForm.remember) {
      localStorage.setItem('username', loginForm.username)
      localStorage.setItem('password', loginForm.password)
    } else {
      localStorage.removeItem('username')
      localStorage.removeItem('password')
    }

    await userStore.login({
      username: loginForm.username,
      password: loginForm.password,
    })
    console.log('userStore')
    ElMessage.success('登录成功')

    const redirect = (route.query.redirect as string) || '/'
    console.log(redirect, 'redirect')
    router.push(redirect)
  } catch (error: any) {
    console.log(error, 'error')
    showCaptcha.value = true
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}

// 处理忘记密码
const handleForgot = () => {
  ElMessage.info('忘记密码功能开发中')
}

// 处理注册
const handleRegister = () => {
  ElMessage.info('注册功能开发中')
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  overflow: hidden;

  // 左侧背景区域 - 填满整个左侧
  .login-bg {
    flex: 1;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="none"/><circle cx="50" cy="50" r="40" fill="white" opacity="0.05"/></svg>')
        repeat;
    }

    .bg-content {
      max-width: 500px;
      z-index: 1;

      h1 {
        font-size: 48px;
        font-weight: bold;
        margin-bottom: 20px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      }

      p {
        font-size: 20px;
        opacity: 0.9;
        margin-bottom: 40px;
      }

      .features {
        .feature-item {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          font-size: 18px;

          .el-icon {
            font-size: 24px;
            margin-right: 15px;
            background: rgba(255, 255, 255, 0.2);
            padding: 10px;
            border-radius: 50%;
          }
        }
      }
    }
  }

  // 右侧登录表单 - 固定在右侧
  .login-form-wrapper {
    width: 100%;
    max-width: 500px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    box-shadow: -5px 0 25px rgba(0, 0, 0, 0.1);

    .login-form-container {
      width: 100%;
      max-width: 400px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 40px;

      h2 {
        color: #303133;
        font-size: 28px;
        margin-bottom: 10px;
      }

      p {
        color: #909399;
        font-size: 16px;
      }
    }

    .login-form {
      .el-form-item {
        margin-bottom: 24px;
      }

      .captcha-wrapper {
        display: flex;
        gap: 10px;

        .captcha-input {
          flex: 1;
        }

        .captcha-image {
          width: 120px;
          height: 40px;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          cursor: pointer;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }

      .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      .login-btn {
        width: 100%;
        font-size: 16px;
        height: 48px;
      }

      .register-tip {
        width: 100%;
        text-align: center;
        color: #909399;

        .el-button {
          padding: 0;
          height: auto;
        }
      }
    }

    .login-footer {
      margin-top: 40px;
      text-align: center;
      color: #909399;
      font-size: 14px;
      padding-top: 20px;
      border-top: 1px solid #ebeef5;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;

    .login-bg {
      display: none;
    }

    .login-form-wrapper {
      max-width: 100%;
      min-height: 100vh;
      box-shadow: none;
    }
  }
}
</style>
