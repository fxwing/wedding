<template>
    <div class="section">
        <video id="myVideo" :src="src" :danmu-list="danmuList" enable-danmu danmu-btn controls poster="cloud://test-fxwing.a897-test-fxwing/image/微信图片_201901251009333.jpg"></video>
        <div class="btn-area">
            <input @blur="bindInputBlur" placeholder="请输入临时弹幕，真实弹幕来自留言" placeholder-style="color:#bbb"/>
            <button @tap="bindSendDanmu">点击生成临时弹幕</button>
            <div class="text">
                <p>从大学到婚姻</p>
                <p>即将要结束三年多的爱情长跑</p>
                <p>修成正果 步入婚姻的殿堂</p>
                <p>亲自写了个小程序 恭候各位光临</p>
            </div>
            <image src="../../static/images/close1.png" @tap="close"/>
        </div>
    </div>
</template>

<script>
export default {
  name: 'Video',
  data () {
    return {
      inputValue: '',
      danmuList: [],
      src: ''
    }
  },

  onLoad () {
    const that = this
    that.getMessageList()
    that.getVideo()
    that.videoContext = wx.createVideoContext('myVideo')
  },
  onHide () {
    this.close()
  },
  methods: {
    bindInputBlur (e) {
      let that = this
      that.inputValue = e.mp.detail.value
    },
    getVideo () {
      const that = this
      const db = wx.cloud.database()
      const video = db.collection('video')
      video.get().then(res => {
        that.src = res.data[0].video
      })
    },
    bindSendDanmu: function () {
      let that = this
      that.videoContext.sendDanmu({
        text: that.inputValue,
        color: that.getRandomColor()
      })
    },

    getRandomColor () {
      let rgb = []
      for (let i = 0; i < 3; ++i) {
        let color = Math.floor(Math.random() * 256).toString(16)
        color = color.length === 1 ? '0' + color : color
        rgb.push(color)
      }
      return '#' + rgb.join('')
    },

    getMessageList () {
      const that = this
      const db = wx.cloud.database()
      const message = db.collection('message')
      message.get().then(res => {
        let data = res.data.reverse()
        let arr = []
        if (data.length > 0) {
          data.forEach((item, index) => {
            arr.push({
              text: item.desc,
              color: that.getRandomColor(),
              time: 1 + (index * 2)
            })
          })
          that.danmuList = arr
        }
      })
    },

    close () {
      const that = this
      that.videoContext.pause()
      that.$emit('closeVideo')
    }
  }
}
</script>

<style lang="stylus" scoped>
.section
    width 750rpx
    position relative
    #myVideo
        height 422rpx
        width 100%
        margin-bottom 20rpx
    .btn-area
        .text
            color #ff586e
            font-size 38rpx
            display flex
            align-items center
            flex-direction column
            justify-content center
            line-height 50rpx
            margin-bottom 30rpx
        input
            width 660rpx
            border 1rpx solid #e5e5e5
            padding-left 30rpx
            height 80rpx
            line-height 80rpx
            font-size 30rpx
            color #ccc
            margin-bottom 30rpx
            margin-left 30rpx
            border-radius 16rpx
        button
            height 92rpx
            width 690rpx
            border-radius 16rpx
            background #1AAD19
            color #fff
            line-height 92rpx
            text-align center
            font-size 36rpx
            margin-bottom 40rpx
        image
            width 80rpx
            height 80rpx
            background #fff
            margin 0 auto
</style>
