import Taro, { Component } from '@tarojs/taro'
import http from '~/utils/http'
import cache from '~/utils/cache'
import Index from './pages/index'
import './app.scss'

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

class App extends Component {
  config = {
    pages: [
      'pages/index/index',
      'pages/idol/create/index',
      'pages/idol/edit/index',
      'pages/idol/show/index',
      'pages/idol/link/index',
      'pages/deal/show/index',
      'pages/user/mine/index',
      'pages/user/handbook/index',
      'pages/user/invite/index',
      'pages/user/transaction/index',
      'pages/user/public/index'
    ],
    window: {
      backgroundTextStyle: 'dark',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: '萌市',
      navigationBarTextStyle: 'black',
      enablePullDownRefresh: false
    },
    tabBar: {
      color: '#CCD6DD',
      selectedColor: '#ff6881',
      backgroundColor: '#ffffff',
      borderStyle: 'white',
      position: 'bottom',
      list: [
        {
          pagePath: 'pages/index/index',
          text: '股市',
          iconPath: 'images/icon_home_default.png',
          selectedIconPath: 'images/icon_home_active.png'
        },
        {
          pagePath: 'pages/user/mine/index',
          text: '我',
          iconPath: 'images/icon_mine_default.png',
          selectedIconPath: 'images/icon_mine_active.png'
        }
      ]
    }
  }

  componentDidMount() {
    this.getCurrentUser()
  }

  componentDidShow() {}

  componentDidHide() {}

  componentDidCatchError() {}

  getCurrentUser(isFirst = true) {
    if (isFirst) {
      const token = cache.get('JWT-TOKEN')
      if (!token) {
        return
      }
    }
    http
      .post('door/current_user')
      .then(data => {
        cache.set('USER', data)
      })
      .catch(err => {
        cache.remove('USER')
        if (err.code === 401) {
          if (isFirst) {
            this.refreshAuthToken()
          } else {
            cache.remove('JWT-TOKEN')
          }
        }
      })
  }

  refreshAuthToken() {
    http
      .post('door/refresh_token')
      .then(() => {
        this.getCurrentUser(false)
      })
      .catch(() => {
        cache.remove('JWT-TOKEN')
      })
  }

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return <Index />
  }
}

Taro.render(<App />, document.getElementById('app'))
