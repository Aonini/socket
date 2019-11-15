setTimeout(function(){
        var heartCheck = {
            timeout: 10000, //10秒发一次心跳
            timeoutObj: null,
            serverTimeoutObj: null,
            servetInterval:null,
                reset: function() {
                    clearTimeout(this.timeoutObj);
                    clearTimeout(this.serverTimeoutObj);
                    return this;
                },
            start: function(websocket) {
                    var self = this;
                    this.timeoutObj = setTimeout(function() {
                            //这里发送一个心跳，后端收到后，返回一个心跳消息，
                            //onmessage拿到返回的心跳就说明连接正常
                            console.log('发送了心跳数据');
                             var msg = {};
                             msg.messageType = -1;
                             msg.message = '-1';
                            websocket.send(msg);
                            self.serverTimeoutObj = setTimeout(function() { //如果超过一定时间还没重置，说明后端主动断开了
                                    websocket.close();
                            }, self.timeout)
                    }, this.timeout)
            },
            }
        
        var SocketConnect = function socket(url,callback){
            var websocket = null;
            var lockReconnect = false;
            var baseurl = `ws://10.2.1.35:9098/bigScreen/${localStorage.getItem("name")}/2/${localStorage.getItem("userJGDM")}`
            //socket通讯地址
            reconnect();
            
        //     //重新链接
            function reconnect() {
                var context = this;
                if (context.lockReconnect) return;
                context.lockReconnect = true;
                setTimeout(function() { //没连接上会一直重连，设置延迟避免请求过多
                        console.log("重链了");
                        if('WebSocket' in window) {
                                //websocket = new WebSocket("wss://"+url);
                                websocket = new WebSocket(baseurl);
                        }else{
                                alert("该浏览器不支持实时通信功能");
                        }
                        context.lockReconnect = false;
                        
                        //监听窗口关闭事件
                        window.onbeforeunload = function() {
                            console.log("窗口关闭");
                            websocket.close();
                        }
                        
                        websocket.onopen= function() {
                                //重置心跳检测
                                heartCheck.reset().start(websocket);
                                console.log("websocket连接成功");
                        }
                        
                        websocket.onclose= function() {
                            //链接断开后重连
                            console.log("websocket连接关闭");
                            if(heartCheck.servetInterval == null){
                                heartCheck.servetInterval = setInterval(function(){
                                    console.log('当前链接状态'+websocket.readyState);
                                    if(websocket.readyState != 1){
                                        websocket.close();
                                        //若为未链接状态则尝试重新链接未连接状态
                                        reconnect();
                                    }else{
                                        clearInterval(heartCheck.servetInterval);
                                        heartCheck.servetInterval = null;
                                        heartCheck.reset().start(websocket);
                                    }
                                },5000);
                            }
                        }
                        
                        websocket.onmessage= function(evt) {
                                //重置心跳检测
                                var data = JSON.parse(evt.data)
                                heartCheck.reset().start(websocket);
                                 var msg = $.parseJSON(event.data);
                                 if(msg.messageType != -1){
                                     console.log("正在获取报警数据---------------------------------------------------------------");
                                     if (data.token == "1003") { //报警数据
                                        if (!data.data) {
                                            return false
                                        } else {
                                            console.log("报警实时弹窗 数据变化")
                                            $(data.data).each(function (i, item) { //不是空数据  弹报警弹窗
                                                addWarnig(item)
                                            })
                                        }
                                    }
                                 }
                        }
                        websocket.onerror = function() {
                                 console.log("websocket连接出错");
                                reconnect();
                        };
                }, 0);
            }
            
            
        this.sendMsg = function sendMsg(message) {
            try{
                            console.log('发送消息了');
                websocket.send(message);
            }catch(err){
                            console.log('消息发送失败'+err);
                // new ToastMessage('消息发送失败');
            }
        }
        
        this.close = function closeWebSocket(){
            websocket.close();
            reconnect();
        }
            window.onbeforeunload = function(event) {
            websocket.close();
        }
        }
            SocketConnect()
    },60000)