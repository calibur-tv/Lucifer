import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import PageState from '~/components/PageState'
import './index.scss'

export default class extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentWillMount() {}

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return <PageState />
  }
}
