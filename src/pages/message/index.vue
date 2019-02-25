<template>
    <div class="message">
        <scroll-view
            scroll-y
            @scroll="scroll"
            class="box"
        >
            <p class="place"></p>
            <div class="item" v-for="(item, index) in messageList" :key="index">
                <image class="left" :src="item.url"/>
                <div class="right">
                    <div class="top">
                        <span class="top-l">{{item.name}}</span>
                        <span class="top-r">{{item.time}}</span>
                    </div>
                    <p class="con">{{item.desc}}</p>
                </div>
                <image
                  v-if="item._openid===openId"
                  class="del"
                  @tap="removeMessage(item)"
                  src="../../static/images/close.png"></image>
            </div>
            <p class="place-end"></p>
        </scroll-view>
        <div class="bottom">
            <div class="bottom-message" v-if="messageList.length>0">已经收到 {{messageList.length+10}} 条评论祝福</div>
            <button class="left" lang="zh_CN" open-type="getUserInfo" @getuserinfo="toMessage">来点祝福吧</button>
            <!-- <button class="right" @tap="toForm">我要出席</button>  -->
        </div>
        <div class="dialog" v-show="isOpen">
            <textarea focus="true" maxlength="80" class="desc" placeholder="在这里输入您想要说的话" name="textarea" placeholder-style="color:#ccc;" v-model="desc"/>
            <div class="btn">
                <button class="left" @tap="sendMessage">发送留言</button>
                <button class="right" @tap="cancel">取消</button>
            </div>
        </div>
        <div class="video-dialog" @tap="toVideo">
            <image src="../../static/images/stare.png"/>
        </div>
        <!-- <div class="form-dialog" @tap="lookList">
            <image src="../../static/images/form.png"/>
        </div> -->
        <div class="video" v-show="isVideo">
            <h-video @closeVideo="closeVideo"></h-video>
        </div>
        <div class="form" v-show="isForm">
            <h-form @closeForm="closeForm" @getFromlist="getFromlist"></h-form>
        </div>
        <div class="form-list" v-show="isFormlist">
            <h-formlist @closeFormlist="closeFormlist" :formList="formList"></h-formlist>
        </div>
    </div>
</template>

<script>
import HVideo from 'components/video'
import HForm from 'components/form'
import HFormlist from 'components/formlist'
import tools from 'common/js/h_tools'
import { mapState } from 'vuex'
export default {
  name: 'Message',
  components: {
    HVideo,
    HForm,
    HFormlist
  },
  data () {
    return {
      isOpen: false,
      desc: '',
      messageList: [],
      openId: '',
      userInfo: '',
      isForm: false,
      isVideo: false,
      isFormlist: false,
      formList: []
    }
  },
  onShow () {
    const that = this
    that.isVideo = false
    that.isForm = false
    that.isFormlist = false
    that.getMessageList()
    // that.getOpenId()
    that.getOpenId(false)
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
  computed: {
    ...mapState(['audio'])
  },
  methods: {
    toMessage (e) {
      const that = this
      if (e.target.errMsg === 'getUserInfo:ok') {
        // that.isOpen = true
        wx.getUserInfo({
          success: function (res) {
            that.userInfo = res.userInfo
            that.isOpen = true
            that.getOpenId(true)
          }
        })
      }
    },

    cancel () {
      const that = this
      that.isOpen = false
    },

    removeMessage (item) {
      const that = this
      const db = wx.cloud.database()
      const message = db.collection('message')
      wx.showModal({
        title: '温馨提示',
        content: '确定要删除吗？',
        success: function (sm) {
          if (sm.confirm) {
            message.doc(item._id).remove({
              success (res) {
                that.getMessageList()
                console.log(res.data)
              },
              fail (res) {
                console.log(res)
              }
            })
          } else if (sm.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    },

    sendMessage () {
      const that = this
      if (that.desc) {
        const db = wx.cloud.database()
        const message = db.collection('message')
        message.add({
          data: {
            desc: that.desc,
            type: 'message',
            time: that.getNowFormatDate(),
            url: that.userInfo.avatarUrl,
            name: that.userInfo.nickName
          }
        }).then(res => {
          that.isOpen = false
          that.desc = ''
          that.getMessageList()
        })
      } else {
        tools.showToast('说点什么吧~')
      }
    },

    getNowFormatDate () {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const day = now.getDate()
      const hh = now.getHours()
      const mm = now.getMinutes()
      const ss = now.getSeconds()
      let clock = year + '-'
      if (month < 10) {
        clock += '0'
      }
      clock += month + '-'
      if (day < 10) {
        clock += '0'
      }
      clock += day + ' '
      if (hh < 10) {
        clock += '0'
      }
      clock += hh + ':'
      if (mm < 10) {
        clock += '0'
      }
      clock += mm + ':'
      if (ss < 10) {
        clock += '0'
      }
      clock += ss
      return clock
    },

    getMessageList () {
      wx.showLoading({
        title: '祝福传递中...'
      })
      const that = this
      wx.cloud.callFunction({
        name: 'messageList',
        data: {}
      }).then(res => {
        that.messageList = [...res.result.data.reverse()]
        wx.hideLoading()
      })
    },

    toForm () {
      const that = this
      that.isForm = true
    },

    closeForm () {
      const that = this
      that.isForm = false
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
        console.log(res)
      })
    },

    getOpenId (bool) {
      const that = this
      wx.cloud.callFunction({
        name: 'user',
        data: {}
      }).then(res => {
        that.openId = res.result.openid
        bool && that.getIsExist()
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
        }
      })
    },

    toVideo () {
      const that = this
      that.audio.pause() // 停止音乐
      that.isVideo = true
    },

    closeVideo () {
      const that = this
      that.audio.play() // 开启音乐
      that.isVideo = false
    },
    lookList () {
      const that = this
      that.isFormlist = true
      that.getFromlist()
    },

    closeFormlist () {
      const that = this
      that.isFormlist = false
    },

    getFromlist () {
      const that = this
      wx.cloud.callFunction({
        name: 'presentList',
        data: {}
      }).then(res => {
        that.formList = res.result.data.reverse()
      })
    }
  }
}
</script>

<style scoped lang="stylus">
@-webkit-keyframes rotate
  from
    -webkit-transform:rotate(0deg)
  to
    -webkit-transform:rotate(360deg)
.message
    height 100%
    width 100%
    .box
        height 100%
        background #F9E0D9
        width 100%
        .place
            height 20rpx
        .place-end
            height 200rpx
        .item
            width 630rpx
            margin-left 30rpx
            border-radius 16rpx
            background #fff
            display flex
            justify-content center
            align-items flex-start
            padding 30rpx
            margin-bottom 20rpx
            position relative
            .left
                width 100rpx
                height 100rpx
                border-radius 50rpx
            .del
                position absolute
                width 30rpx
                height 30rpx
                bottom 10rpx
                right 20rpx
            .right
                display flex
                flex-direction column
                justify-content flex-start
                min-height 100rpx
                align-items flex-start
                width 500rpx
                margin-left 20rpx
                .top
                    height 40rpx
                    width 100%
                    display flex
                    justify-content space-between
                    align-items center
                    .top-l
                        height 50rpx
                        max-width 250rpx
                        overflow hidden
                        text-overflow ellipsis
                        white-space nowrap
                        line-height 50rpx
                        color #444
                        font-size 28rpx
                    .top-r
                        height 50rpx
                        line-height 50rpx
                        color #999
                        font-size 24rpx
                .con
                    line-height 50rpx
                    color #666
                    font-size 28rpx
                    white-space pre-wrap
                    width 100%
                    word-wrap break-word
                    text-align justify
    .bottom
        position fixed
        bottom 0
        left 0
        height 200rpx
        background rgba(255, 255, 255, 0.75)
        width 100%
        display flex
        justify-content center
        align-items center
        flex-direction column
        .bottom-message
            margin-bottom 20rpx
            font-size 30rpx
            color #ed695d
        .left, .right
            height 80rpx
            line-height 80rpx
            font-size 28rpx
            width 300rpx
            color #fff
            background #ED695D
        .right
            margin 0
    .dialog
        position fixed
        bottom 0
        left 0
        z-index 99
        background #fff
        width 100%
        textarea
            height 200rpx
            line-height 42rpx
            font-size 30rpx
            color #333
            resize none
            outline none
            padding 30rpx
            width 690rpx
            background #f5f5f5
            &::-webkit-input-placeholder
                font-size 30rpx
                color #999
        .btn
            height 120rpx
            display flex
            justify-content center
            align-items center
            .left, .right
                height 80rpx
                line-height 80rpx
                font-size 28rpx
                flex 2
                color #fff
                background #ED695D
                margin 0 20rpx 0 30rpx
            .right
                flex 1
    .video-dialog
        position fixed
        right 20rpx
        top 200rpx
        width 100rpx
        height 100rpx
        box-shadow 0 0 10rpx rgba(0, 0, 0, 0.1)
        background #fff
        border-radius 16rpx
        animation: 9.5s linear 0s normal none infinite rotate;
        image
            width 100%
            height 100%
    .form-dialog
        position fixed
        right 10rpx
        top 320rpx
        width 100rpx
        height 100rpx
        box-shadow 0 0 10rpx rgba(0, 0, 0, 0.1)
        background #fff
        border-radius 50rpx
        image
            width 100%
            height 100%
    .video, .form, .form-list
        position fixed
        top 0
        bottom 0
        left 0
        right 0
        background #fff
        z-index 99
    .form-list
        background rgba(0, 0, 0, 0.5)
</style>
