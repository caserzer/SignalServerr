# Siganl Server
This is a demo Signal Server using Typescript , NodeJS , WebSocket 

# Short Description
Streaming video using webrtc please see the example project @ https://github.com/centricular/gstwebrtc-demos.
This demo project focus on the websockt message exchange for the SDP. 

Actors involved in the project.

| Actor  | Description |
|--------|-------------|
| Signal | Signal server which exchange the messages like SDP and other command messages. |
| Host   | Host instance which running at IPC edge gateway. Receiving streaming command from signal server, then start streaming application to stream video to the player.|
|Streamer| Streamer application is the application actually streaming video to player using RTC peer connection. It need exchange SDP message with the player via signal server using websocket. |
|Player  | web component which play video streaming from streamer. This component is based on @ https://github.com/webrtcHacks/adapter |
| TURN Server | The TURN Server is a VoIP media traffic NAT traversal server and gateway.|


## Actor responsibilty
### Signal 
- Maintain the connection between Signal and Host.
- Push commands to host.
- Intermedia of SDP exchange between Streamer and Player.
- Endpoints of other remote commands to host.
- Statistical of the Host connections.

### Host
- Maintain the connection between Signal and Host.
- Receive command from Signal Server (include streaming command)

### Streamer 
- Exchange SDP with Player (via Signal server)
- Stream video to the player.

### Player
- Create SDP exchange channel.
- Play streaming video.

### TURN
- NAT traversal 
- Traffic relay if NAT traversal is not available.

## Design choices
When streaming video ( IPC or gaming , live show etc.) , typically will use these technologies.

|  | Technology | Comment | Pro | Corn |
|--|------------|---------|-----|------|
| Live Streaming | RTMP, HLS, MPEG-DASH | Industry standard. Widely used in video broadcasting, game streaming. <br/> Public Cloud Choose: Azure, AWS, AliCloud. Other like Red5 etc.  | 1. Support massive viewers. <br/> 2. Widely support by all kinds of platforms. <br/> 3. plentiful tools    | 1. Highly depends on the server side encoding / decoding. <br/> 2. Latency is very high. From 5 seconds( flv) to 15 seconds (HLS). <br/> 3. Network bandwidth limitation. <br/> 4. Security issues if we want to control who can view the content. <br/> 5. RTMP is no longer maintained by Adobe and RTMP only support H264 by default.|
| WebRTC | WebRTC, Peer2Peer Connection | Widely used in video conference scenarios. Standardized by [W3C](https://www.w3.org/TR/webrtc/) and [IETF](https://tools.ietf.org/html/rfc7478) | 1. The latency is really low. <br/> 2. Bid-direction video and audio. Can attach new video or audio later after streaming starts.<br/> 3. By default use the p2p connection, minmize the server bandwidth load. <br/> 4. Can choose encoding VP8 and H264. | 1. Complexity <br/> 2. Apple's implementation is late. |

Other rare solutions:
- RTSP to Html
  Redirect IPC's RTSP and use flv.js to display the video. [zhihu](https://www.zhihu.com/question/264999651/answer/976540546)
- Video streaming redirect to HTML and use web assembly to decode. [NodeMedia](http://www.nodemedia.cn/)




  

# Misc. 
## Gstreamer Video Streaming Compatibility on Web 
### Desktop Version
| Browser | Compatiblity |
|---------|--------------|
| Chrome  | OK with 65+ -|
| Edge(EdgeHTML) | Not working ( wired behaviors on setLocalDescription) |
| Edge (Blink) | Working on latest version |
| Firefox | working on latest version |
| IE | NO |


### Mobile Version
| Browser      |    Compatibilty |
|----|----|
| iPhone 6s+ (Safari 11.2 +) | OK |
| Android 7+ Chrome | OK |
| Android default Webview | ? |
| Xiaomi default browser | ? |
| Huawei default browser | ? |
| OnePlus default browser| ? |
| Samsung default browser| ? |
| LG default browser | ? |
| QQ browser | ? |
| UC Browser | ? |

* Since Microsoft will replace EdgeHTML engine with Blink version start from 2020-1-15. No future work will on the EdgeHTML.
* On the iOS Apple forbid any other engine except webkit. And navigator.mediaDevices.getUserMedia only works on Safari. Any other browers on iOS and Webview will fail.
* Since Chrome is not the default browser in most of Chinese vendors' phone. The compatibilty of default browser on the android must be carefully handled.



## Install

