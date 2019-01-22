const AUDIO = 'audio'
const BINDISPLAY = 'bindIsPlay'
export default {
  [AUDIO] (state, v) {
    state.audio = v
  },
  [BINDISPLAY] (state, v) {
    state.isPlay = v
  }
}
