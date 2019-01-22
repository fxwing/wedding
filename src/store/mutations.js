const AUDIO = 'audio'
const BINDISPLAY = 'bindIsPlay'
const SETUSERINFO = 'setUserInfo'
export default {
  [AUDIO] (state, v) {
    state.audio = v
  },
  [BINDISPLAY] (state, v) {
    state.isPlay = v
  },
  [SETUSERINFO] (state, v) {
    state.userInfo = v
  }
}
