<template>
    <div class="greet">
        <div class="mask" v-if="showMask" @tap="share"></div>
        <div class="mask-content"  v-if="showMask" :class="{active:isActive}">
          <div class="mask-share">
             <button  class="mask-share_btn" open-type="share">发送给朋友</button>
          </div>
          <div class="mask-poster">生成海报</div>
        </div>
        <image class="head" src="../../static/images/heart-animation.gif"/>
        <scroll-view
            scroll-y
            class="box"
        >
            <div class="item" v-for="(item, index) in userList" :key="index">
                <image :src="item.user.avatarUrl"/>
                <p>{{item.user.nickName}}</p>
            </div>
        </scroll-view>
        <image class="footer" src="../../static/images/green-flower.png"/>
        <p class="count">已收到{{userList.length}}位好友送来的祝福</p>
        <div class="bottom">
            <button class="left" lang="zh_CN" open-type="getUserInfo" @getuserinfo="sendGreet">送上祝福</button>
            <button class="right" open-type="share">分享喜悦</button>
             <!-- <button class="right" @tap="share">分享喜悦</button> -->
        </div>
    </div>
</template>

<script>
import tools from 'common/js/h_tools'
export default {
  name: 'Greet',
  data () {
    return {
      userList: [],
      openId: '',
      userInfo: '',
      showMask: false,
      isActive: false
    }
  },
  onShow () {
    const that = this
    that.getUserList()
  },
  onShareAppMessage (res) {
    // const that = this
    // const db = wx.cloud.database()
    // const shareImg = db.collection('shareImg')
    // shareImg.get().then(res => {
    //   that.imgUrl = res.data[0].img
    // })
    return {
      title: '恭候您的光临',
      path: '/pages/index/main',
      imageUrl: '../../static/images/share.jpg'
    }
  },
  methods: {
    sendGreet (e) {
      console.log(e)
      const that = this
      if (e.target.errMsg === 'getUserInfo:ok') {
        wx.getUserInfo({
          success: function (res) {
            that.userInfo = res.userInfo
            that.getOpenId()
          }
        })
      }
    },

    addUser () {
      const that = this
      const db = wx.cloud.database()
      const user = db.collection('user')
      user.add({
        data: {
          user: that.userInfo
        }
      }).then(res => {
        that.getUserList()
      })
    },

    getOpenId () {
      const that = this
      wx.cloud.callFunction({
        name: 'user',
        data: {}
      }).then(res => {
        that.openId = res.result.openid
        that.getIsExist()
      })
    },

    getIsExist () {
      const that = this
      const db = wx.cloud.database()
      const user = db.collection('user')
      user.where({
        _openid: that.openId
      }).get().then(res => {
        if (res.data.length === 0) {
          that.addUser()
        } else {
          tools.showToast('您已经送过祝福了~')
        }
      })
    },

    getUserList () {
      wx.showLoading({
        title: '祝福传递中...'
      })
      const that = this
      wx.cloud.callFunction({
        name: 'userList',
        data: {}
      }).then(res => {
        that.userList = res.result.data.reverse()
        wx.hideLoading()
      })
    },

    share () {
      this.showMask = !this.showMask
      this.isActive = !this.isActive
    }
  }
}
</script>

<style lang="stylus" scoped>
@-webkit-keyframes infoAnimation
  0%
    -webkit-transform scale(1)
  50%
    -webkit-transform scale(.9)
  100%
    -webkit-transform scale(1)
button::after
    border none
input
    outline:none;
    border:none;
    list-style: none;
.greet
    width 100%
    height 100%
    .mask
        position fixed
        top 0
        bottom 0
        left 0
        right 0
        background rgba(0,0,0,.6)
        transition all .3s
        z-index 99999
    .mask-content
        position fixed
        width 100%
        left 0
        height 300rpx
        bottom -300rpx
        transition all 0.3s ease-in-out
        background #ffffff
        z-index 100000
        display flex
        align-items center
        flex-direction column
        padidng 20rpx 0;
        .mask-share
            height 50rpx
            line-height 50rpx
            font-size 28rpx
    .active
        transform translate3d(0,-300rpx,0)
    .head
        height 150rpx
        width 200rpx
        margin 0 auto
    .box
        height 700rpx
        width 690rpx
        margin-left 30rpx
        border-radius 16rpx
        box-shadow 0 0 10rpx rgba(0, 0, 0, 0.1)
        display flex
        justify-content flex-start
        align-items flex-start
        flex-wrap wrap
        .item
            width 120rpx
            display flex
            flex-direction column
            justify-content flex-start
            align-items center
            padding 25rpx
            float left
            image
                width 100rpx
                height 100rpx
                border-radius 50rpx
            p
                height 50rpx
                line-height 50rpx
                font-size 24rpx
                color #444
                width 100rpx
                overflow hidden
                text-overflow ellipsis
                white-space nowrap
                text-align center
    .bottom
        height 140rpx
        position fixed
        bottom 0
        left 0
        background rgba(255, 255, 255, 0.5)
        display flex
        justify-content center
        align-items center
        width 100%
        .left
            height 80rpx
            line-height 80rpx
            font-size 28rpx
            width 300rpx
            color #fff
            background #E62C6B
            margin-right 20rpx
        .right
            height 80rpx
            line-height 80rpx
            font-size 28rpx
            color #fff
            width 300rpx
            background #2CA6F9
    .count
        height 60rpx
        line-height 60rpx
        background rgba(255, 255, 255, 0.5)
        position fixed
        bottom 140rpx
        left 0
        font-size 28rpx
        color #444
        text-align center
        width 100%
    .footer
        width 70%
        height 200rpx
        margin-left 15%
        animation infoAnimation 6s linear infinite
</style>
