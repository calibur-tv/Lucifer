import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import http from '~/utils/http'
import event from '~/utils/event'
import UserPanel from './panel/UserPanel'
import UserContent from './content/UserContent'
import './index.scss'

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      share_data: null
    };
  }

  componentWillMount() {}

  componentDidMount() {
    this.getUser()
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  onReachBottom() {
    event.emit('on-reach-bottom')
  }

  getUser() {
    http.get(`user/${this.$router.params.zone}/show`)
      .then(user => {
        this.setState({
          user,
          share_data: user.share_data
        })
      })
  }

  render() {
    const { user } = this.state
    if (!user) {
      return
    }
    return (
      <View className='public-user-home'>
        <UserPanel user={user}/>
        <UserContent user={user}/>
      </View>
    )
  }
}
