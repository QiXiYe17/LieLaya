var lie;
(function (lie) {
    var getM = 'get', postM = 'post';
    /**
     * Http请求类
     */
    var Http = /** @class */ (function () {
        function Http(method, param, url) {
            var request = this.$request = new Laya.HttpRequest();
            var headers = void 0;
            if (method == postM)
                headers = ["Content-Type", "application/x-www-form-urlencoded"];
            request.send(url || lie.Server.HOST, Http.getUrlParam(param), method, void 0, headers);
        }
        /**
         * 添加返回请求
         */
        Http.prototype.addCall = function (call, error, thisObj) {
            var self = this;
            var request = self.$request;
            self.$comCall = call;
            self.$errorCall = error;
            self.$thisObj = thisObj;
            request.once(Laya.Event.COMPLETE, self, self.onGetComplete);
            request.once(Laya.Event.ERROR, self, self.onGetIOError);
            self.$loading = lie.setTimeout(self.showLoading, self, 400);
        };
        /**
         * 显示loading
         */
        Http.prototype.showLoading = function () {
            var self = this;
            self.$loading = null;
            pfUtils.showLoading();
            // 超时检测
            self.$timeout = lie.setTimeout(self.onGetIOError, self, 10000);
        };
        /**
         * 执行回调
         */
        Http.prototype.excuteCall = function (action) {
            var self = this;
            var call = self.$comCall;
            if (call) {
                var thisObj = self.$thisObj;
                // 主动控制，全返回
                if (self.notify)
                    call.call(thisObj, action);
                else {
                    var code = action.errorCode;
                    var info = action.info;
                    // 非主动控制，只返回info和code
                    if (code) {
                        var error = self.$errorCall;
                        error && error.call(thisObj, code);
                        AppConfig.onErrorCode(code, info);
                    }
                    else
                        call.call(thisObj, info);
                }
                self.clear();
            }
            // 关闭
            if (self.$loading) {
                lie.clearTimeout(self.$loading);
                self.$loading = null;
            }
            else if (self.$timeout) {
                lie.clearTimeout(self.$timeout);
                self.$timeout = null;
                pfUtils.hideLoading();
            }
        };
        /**
         * 请求成功
         */
        Http.prototype.onGetComplete = function (event) {
            var self = this;
            var request = self.$request;
            var response = request.data;
            try {
                var isText = self.isText;
                var data = isText ? response : JSON.parse(response);
                !isText && console.log('onReceive', data);
                self.excuteCall(data);
            }
            catch (e) {
                self.notify && self.excuteCall(lie.ActionUtils.getInfoAction(response));
                console.log('error response', e, response);
            }
        };
        /**
         * 请求失败
         */
        Http.prototype.onGetIOError = function () {
            this.excuteCall(lie.ActionUtils.getFailAction());
        };
        /**
         * 清除请求
         */
        Http.prototype.clear = function () {
            var self = this;
            self.$request.offAll();
            self.$request = self.$comCall = self.$errorCall = self.$thisObj = null;
        };
        // 静态方法
        /**
         * 获取伴随url的参数
         */
        Http.getUrlParam = function (param, sortFunc) {
            var isO = lie.TypeUtils.isObject;
            var str = JSON.stringify;
            var attr = [];
            for (var i in param) {
                var data = param[i];
                if (isO(data)) {
                    data = str(data);
                }
                attr.push(i + '=' + data);
            }
            sortFunc && attr.sort(sortFunc);
            return attr.join('&');
        };
        /**
         * 发送请求
         */
        Http.send = function (method, type, data, notify) {
            var action = lie.ActionUtils.newAction(type, function (info) {
                for (var i in data)
                    info[i] = data[i];
            });
            if (action)
                return Http.sendAction(method, action, notify);
        };
        /**
         * 发送action请求
         */
        Http.sendAction = function (method, action, notify) {
            return new Promise(function (resolve, reject) {
                var http = new Http(method, action);
                http.notify = notify;
                http.addCall(resolve, reject);
            });
        };
        /**
         * 发送get请求
         * @param type 请求类型
         * @param param 请求参数
         * @param call 请求成功回调
         * @param thisObj 回调所属对象
         */
        Http.get = function (type, param, notify) {
            return Http.send(getM, type, param, notify);
        };
        /**
         * 发送post请求
         * @param type 请求类型
         * @param param 请求参数
         * @param call 请求成功回调
         * @param thisObj 回调所属对象
         */
        Http.post = function (type, param, notify) {
            return Http.send(postM, type, param, notify);
        };
        /**
         * 发送get action
         */
        Http.getAction = function (action, notify) {
            return Http.sendAction(getM, action, notify);
        };
        /**
         * 发送post action
         */
        Http.postAction = function (action, notify) {
            return Http.sendAction(postM, action, notify);
        };
        ////////////非action形式的请求
        /**
         * 发送请求
         * @param data 发送的数据，包含地址、请求类型(默认post)、请求参数、请求成功回调
         */
        Http.request = function (data) {
            var http = new Http(data.method, data.param, data.url);
            http.isText = data.isText;
            http.notify = true; // 主动唤醒，自由控制
            return new Promise(function (resolve, reject) {
                http.addCall(resolve, reject);
            });
        };
        return Http;
    }());
    lie.Http = Http;
})(lie || (lie = {}));
//# sourceMappingURL=Http.js.map