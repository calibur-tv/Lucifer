import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import {
  AtTabs,
  AtTabsPane,
  AtLoadMore,
  Swiper,
  SwiperItem,
  AtIcon
} from 'taro-ui'
import http from '~/utils/http'
import helper from '~/utils/helper'
import IdolItem from '~/components/IdolItem/index'
import DealItem from '~/components/DealItem/index'
import './index.scss'

export default class extends Component {
  config = {
    enablePullDownRefresh: true
  }

  constructor(props) {
    super(props)
    this.state = {
      current: 1,
      market_price: {
        loading: false,
        nothing: false,
        noMore: false,
        total: 0
      },
      activity: {
        loading: false,
        nothing: false,
        noMore: false,
        total: 0
      },
      star_count: {
        loading: false,
        nothing: false,
        noMore: false,
        total: 0
      },
      list_0: [],
      list_1: [],
      list_2: [],
      pub_deal_loading: false,
      pub_deal_noMore: false,
      pub_deal_nothing: false,
      pub_deal_total: 0,
      pub_deal_list: [],
      meta: {
        buyer_count: 0,
        money_count: 0,
        deal_count: 0,
        exchang_money_count: 0
      },
      recent: []
    }
  }

  componentWillMount() {}

  componentDidMount() {
    this.getIdols(1)
    this.getStockMeta()
    this.getRecentData()
  }

  onPullDownRefresh() {
    const index = this.state.current
    if (index === 3) {
      this.getDeals(true)
    } else {
      this.getIdols(index, true)
    }
    this.getStockMeta()
    this.getRecentData()
  }

  onReachBottom() {
    const index = this.state.current
    if (index === 3) {
      this.getDeals()
    } else {
      this.getIdols(index)
    }
  }

  onShareAppMessage() {
    return helper.share()
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  tabSwitch(index) {
    this.setState({
      current: index
    })
    if (index === 3) {
      if (!this.state.pub_deal_list.length) {
        this.getDeals()
      }
      return
    }
    if (this.state[`list_${index}`].length) {
      return
    }
    this.getIdols(index)
  }

  getIdols(index, refresh = false) {
    let sort = ''
    if (index === 0) {
      sort = 'market_price'
    } else if (index === 1) {
      sort = 'activity'
    } else {
      sort = 'star_count'
    }
    const data = this.state[sort]
    const field = `list_${index}`
    if (data.loading || data.nothing || (data.noMore && !refresh)) {
      return
    }
    if (refresh) {
      this.setState({
        [sort]: {
          loading: true,
          nothing: false,
          noMore: false,
          total: data.total
        }
      })
      this.setState({
        [field]: []
      })
    } else {
      this.setState({
        [sort]: Object.assign(data, {
          loading: true
        })
      })
    }
    http
      .post('cartoon_role/list/idols', {
        type: 'trending',
        sort,
        take: 10,
        state: sort === 'star_count' ? 0 : 1,
        seenIds: refresh ? '' : this.state[field].map(_ => _.id).join(',')
      })
      .then(res => {
        this.setState({
          [field]: this.state[field].concat(res.list)
        })
        this.setState({
          [sort]: {
            loading: false,
            nothing: false,
            noMore: res.noMore,
            total: res.total
          }
        })
        if (refresh) {
          wx.stopPullDownRefresh()
        }
      })
      .catch(() => {
        this.setState({
          [sort]: Object.assign(data, {
            loading: false
          })
        })
        if (refresh) {
          wx.stopPullDownRefresh()
        }
      })
  }

  getDeals(refresh = false) {
    const { state } = this
    if (
      state.pub_deal_loading ||
      state.pub_deal_nothing ||
      (!refresh && state.pub_deal_noMore)
    ) {
      return
    }
    if (refresh) {
      this.setState({
        pub_deal_loading: true,
        pub_deal_noMore: false,
        pub_deal_nothing: false,
        pub_deal_list: []
      })
    } else {
      this.setState({
        pub_deal_loading: true
      })
    }
    http
      .get('cartoon_role/deal_list', {
        seenIds: refresh ? '' : state.pub_deal_list.map(_ => _.id).join(','),
        take: 10
      })
      .then(data => {
        this.setState({
          pub_deal_list: state.pub_deal_list.concat(data.list),
          pub_deal_noMore: data.noMore,
          pub_deal_total: data.total,
          pub_deal_loading: false
        })
        if (refresh) {
          wx.stopPullDownRefresh()
        }
      })
      .catch(() => {
        this.setState({
          pub_deal_loading: false
        })
        if (refresh) {
          wx.stopPullDownRefresh()
        }
      })
  }

  getStockMeta() {
    http
      .get('cartoon_role/stock_meta')
      .then(meta => {
        this.setState({ meta })
      })
      .catch(() => {})
  }

  getRecentData() {
    Promise.all([
      http.get('cartoon_role/recent_buy'),
      http.get('cartoon_role/recent_deal')
    ])
      .then(data => {
        const buys = data[0].list.map(_ =>
          Object.assign(_, {
            type: 'buy'
          })
        )
        const deal = data[1].list.map(_ =>
          Object.assign(_, {
            type: 'deal'
          })
        )
        const recent = deal
          .concat(buys)
          .sort((prev, next) => next.time - prev.time)
        this.setState({ recent })
      })
      .catch(() => {})
  }

  render() {
    const tabList = [
      { title: '市值榜' },
      { title: '活跃榜' },
      { title: '新创榜' },
      { title: '交易所' }
    ]
    const { list_0, list_1, list_2, pub_deal_list, meta, recent } = this.state
    const idolList_0 = list_0.map(idol => (
      <IdolItem
        key={String(idol.id)}
        sort='hot'
        taroKey={String(idol.id)}
        idol={idol}
      />
    ))
    const idolList_1 = list_1.map(idol => (
      <IdolItem
        key={String(idol.id)}
        sort='active'
        taroKey={String(idol.id)}
        idol={idol}
      />
    ))
    const idolList_2 = list_2.map(idol => (
      <IdolItem
        key={String(idol.id)}
        sort='new'
        taroKey={String(idol.id)}
        idol={idol}
      />
    ))
    const DealList = pub_deal_list.map(deal => (
      <DealItem key={String(deal.id)} taroKey={String(deal.id)} deal={deal} />
    ))
    const list_0_state = this.state.market_price
    const list_1_state = this.state.activity
    const list_2_state = this.state.star_count

    const notice =
      recent.length &&
      recent.map(item => {
        const key = Math.random()
          .toString(36)
          .slice(2, -1)
        return (
          <SwiperItem key={key} taroKey={key} className='swiper-item'>
            {item.type === 'buy' ? (
              <View className='notice-item'>
                <Text className='tail'>{helper.ago(item.time * 1000)}</Text>
                <View className='content'>
                  <navigator
                    url={`/pages/user/public/index?zone=${item.user && item.user.zone}`}
                    hover-class='none'
                    class='link'
                  >
                    <image
                      src={helper.resize(item.user && item.user.avatar, {
                        width: 60
                      })}
                      mode='aspectFit'
                    />
                    <Text>{item.user.nickname}</Text>
                  </navigator>
                  <Text>入股了</Text>
                  <navigator
                    url={`/pages/idol/show/index?id=${item.idol.id}`}
                    hover-class='none'
                    class='link'
                  >
                    「{item.idol.name}」
                  </navigator>
                </View>
              </View>
            ) : (
              <View className='notice-item'>
                <Text className='tail'>{helper.ago(item.time * 1000)}</Text>
                <View className='content'>
                  <navigator
                    url={`/pages/user/public/index?zone=${item.buyer && item.buyer.zone}`}
                    hover-class='none'
                    class='link'
                  >
                    <image
                      src={helper.resize(item.buyer && item.buyer.avatar, {
                        width: 60
                      })}
                      mode='aspectFit'
                    />
                    <Text>{item.buyer.nickname}</Text>
                  </navigator>
                  <Text>购买了</Text>
                  <navigator
                    url={`/pages/user/public/index?zone=${item.dealer && item.dealer.zone}`}
                    hover-class='none'
                    class='link'
                  >
                    <Text>{item.dealer.nickname}</Text>
                  </navigator>
                  <Text>的</Text>
                  <navigator
                    url={`/pages/idol/show/index?id=${item.idol.id}`}
                    hover-class='none'
                    class='link'
                  >
                    「{item.idol.name}」
                  </navigator>
                  <Text>股</Text>
                </View>
              </View>
            )}
          </SwiperItem>
        )
      })

    return (
      <View className='idol-list'>
        <View className='intro'>
          <image
            src='https://image.calibur.tv/owner/image/stock-banner.jpeg?imageMogr2/auto-orient/strip|imageView2/2/h/200'
            mode='aspectFit'
          />
          <View className='list'>
            <View className='li'>
              投资人数：
              {meta.buyer_count}
            </View>
            <View className='li'>
              总交易额：￥
              {parseFloat(meta.money_count).toFixed(2)}
            </View>
            <View className='li'>
              成交笔数：
              {meta.deal_count}
            </View>
            <View className='li'>
              总成交额：￥
              {parseFloat(meta.exchang_money_count).toFixed(2)}
            </View>
          </View>
        </View>
        <View className='notice'>
          <View className='icon'>
            <AtIcon value='bell' size='18' color='#ff6881' />
          </View>
          <Swiper
            className='swiper'
            vertical
            circular
            autoplay
            skipHiddenItemLayout
          >
            {notice}
          </Swiper>
        </View>
        <AtTabs
          current={this.state.current}
          tabList={tabList}
          onClick={this.tabSwitch}
          swipeable={false}
          scroll
        >
          <AtTabsPane current={this.state.current} index={0}>
            {idolList_0}
            <AtLoadMore
              status={
                list_0_state.loading
                  ? 'loading'
                  : list_0_state.noMore
                    ? 'noMore'
                    : 'more'
              }
            />
          </AtTabsPane>
          <AtTabsPane current={this.state.current} index={1}>
            {idolList_1}
            <AtLoadMore
              status={
                list_1_state.loading
                  ? 'loading'
                  : list_1_state.noMore
                    ? 'noMore'
                    : 'more'
              }
            />
          </AtTabsPane>
          <AtTabsPane current={this.state.current} index={2}>
            {idolList_2}
            <AtLoadMore
              status={
                list_2_state.loading
                  ? 'loading'
                  : list_2_state.noMore
                    ? 'noMore'
                    : 'more'
              }
            />
          </AtTabsPane>
          <AtTabsPane current={this.state.current} index={3}>
            {DealList}
            <AtLoadMore
              status={
                this.state.pub_deal_loading
                  ? 'loading'
                  : this.state.pub_deal_noMore
                    ? 'noMore'
                    : 'more'
              }
            />
          </AtTabsPane>
        </AtTabs>
      </View>
    )
  }
}
