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


## Main actor responsibilty
### Signal 


### Host

### Streamer 

### Player

### TURN

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

