# Signal Server
This is a demo Signal Server using Typescript , NodeJS , Web Socket 

# Short Description
Streaming video using WebRTC please see the example project @ [GST WebRTC Demo](https://github.com/centricular/gstwebrtc-demos).
This demo project focus on the web socket message exchange for the SDP. 

Actors involved in the project.

| Actor  | Description |
|--------|-------------|
| Signal | Signal server which exchange the messages like SDP and other command messages. |
| Host   | Host instance which running at IPC edge gateway. Receiving streaming command from signal server, then start streaming application to stream video to the player.|
|Streamer| Streamer application is the application actually streaming video to player using RTC peer connection. It need exchange SDP message with the player via signal server using web socket. |
|Player  | web component which play video streaming from streamer. This component is based on @ [Adapter JS](https://github.com/webrtcHacks/adapter) |
| TURN Server | The TURN Server is a VoIP media traffic NAT traversal server and gateway.|


## Actor responsibility
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

# Design choices
## Streaming
When streaming video ( IPC or gaming , live show etc.) , typically will use these technologies.

|  | Technology | Comment | Pro | Corn |
|--|------------|---------|-----|------|
| Live Streaming | RTMP, HLS, MPEG-DASH | Industry standard. Widely used in video broadcasting, game streaming. <br/> Public Cloud Choose: Azure, AWS, AliCloud. Other like Red5 etc. | 1. Support massive viewers. <br/> 2. Widely support by all kinds of platforms. <br/> 3. plentiful tools    | 1. Highly depends on the server side encoding / decoding. <br/> 2. Latency is very high. From 5 seconds( flv) to 15 seconds (HLS). <br/> 3. Network bandwidth limitation. <br/> 4. Security issues if we want to control who can view the content. <br/> 5. RTMP is no longer maintained by Adobe and RTMP only support H264 by default.|
| WebRTC | WebRTC, Peer2Peer Connection | Widely used in video conference scenarios. Standardized by [W3C](https://www.w3.org/TR/webrtc/) and [IETF](https://tools.ietf.org/html/rfc7478) | 1. The latency is really low. <br/> 2. Bid-direction video and audio. Can attach new video or audio later after streaming starts.<br/> 3. By default use the p2p connection, minimize the server bandwidth load. <br/> 4. Can choose encoding VP8 and H264. | 1. Complexity <br/> 2. Apple's implementation is late. |

Other rare solutions:
- RTSP to Html
  Redirect IPC's RTSP and use flv.js to display the video. [zhihu](https://www.zhihu.com/question/264999651/answer/976540546)
- Video streaming redirect to HTML and use web assembly to decode. [NodeMedia](http://www.nodemedia.cn/)

This repository only discuss the WebRTC solution.

## WebRTC & Web Socket

When using WebRTC to stream video, clients involve in the video streaming event need to exchange [SDP](https://tools.ietf.org/html/rfc4566) (Session Description Protocol). The standard don't define how clients to exchange the messages, clients can freely use any protocol to exchange the messages. Web socket is a bid-direction and fast protocol and suitable to SDP exchange. 

Applications can choose how to communicate on the web socket. Generally two communication styles are used on web socket.

1.  Request / Response
   This communication style like RESTful API, every message send from caller need a specified response from callee. Unlike HTTP Restful API, the web socket do not have URI and header support by default. 

2. Asynchronized messages exchange 
   Callers and callees exchange messages via typically "SEND" & "SUBSCRIBE" commands. Usually actors in the system can be labeled as clients and broker. [STOMP over websocket](http://jmesnil.net/stomp-websocket/doc/) is an option.

In this demo project we choose request/response style to keep the simplicity. [JSON-RPC](https://www.jsonrpc.org/specification) and [RPC websocket](https://github.com/elpheria/rpc-websockets) is a good choice, but the implementation does good to the develpers to learn the technical details and not very complex, so we try it from "scratch". 

# Application protocols 
## Tables

| No   | Name        | Description                                                  | Signal | Host | Player | Streamer | TURN |
| ---- | ----------- | ------------------------------------------------------------ | ------ | ---- | ------ | -------- | ---- |
| 1    | HostConnect | Host connecting to Signal, the host is ready to server streaming and other command. | X      | X    |        |          |      |
| 2    |             |                                                              |        |      |        |          |      |
| 3    |             |                                                              |        |      |        |          |      |




# Misc. 
## Authentication



## Gstreamer WebRTC Video Streaming Compatibility on Web 

### Desktop Version
| Browser | Compatibility |
|---------|--------------|
| Chrome  | OK with 65+ -|
| Edge(EdgeHTML) | Not working ( wired behaviors on setLocalDescription) |
| Edge (Blink) | Working on latest version |
| Firefox | working on latest version |
| IE | NO |


### Mobile Version
| Browser      | Compatibility |
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
* Since Chrome is not the default browser in most of Chinese vendors' phone. The compatibility of default browser on the android must be carefully handled.



## Install

