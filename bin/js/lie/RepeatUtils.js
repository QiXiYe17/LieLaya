var lie;
(function (lie) {
    /**
     * 重复工具类
     * 功能：定时发起重复操作回调，当回调结果为true时结束回调，并通知成功；
     * 当在规定上限内还未收到true的话也会结束回调，并通知失败
     */
    var RepeatUtils = /** @class */ (function () {
        /**
         * @param repeatTime 单位毫秒，即每隔多久发起一次操作
         * @param repeatCount 操作次数上限，默认一次
         */
        function RepeatUtils(repeatTime, repeatCount) {
            if (repeatCount === void 0) { repeatCount = 1; }
            this.repeatTime = repeatTime;
            this.repeatCount = isNaN(repeatCount) ? 0 : repeatCount;
        }
        /**
         * 定时器回调
         */
        RepeatUtils.prototype.onTimer = function () {
            var self = this;
            var curT = lie.Server.getTime();
            if (curT - self.$startTime >= self.repeatTime && !self.isRunning) {
                var promise = self.$call;
                var endCall_1 = function () {
                    self.isRunning = false;
                    if (!(--self.repeatCount > 0)) {
                        self.onFinish(false);
                    }
                };
                self.$startTime = curT;
                self.isRunning = true;
                if (promise instanceof Promise) {
                    promise.then(function (bool) {
                        bool ? self.onFinish(true) : endCall_1();
                    }).catch(endCall_1);
                }
                else {
                    endCall_1();
                }
            }
        };
        /**
         * 回调结束
         * @param bool 操作结果
         */
        RepeatUtils.prototype.onFinish = function (bool) {
            var self = this;
            var fCall = self.$fCall;
            var timer = self.$timer;
            self.isRunning = false;
            if (timer) {
                fCall.call(self.$fThisObj, bool);
                self.$timer.clear();
                self.$timer = null;
            }
        };
        /**
         * 设置结束回调，不设置也不会怎么样
         * @param call 参数表示是否正常结束
         */
        RepeatUtils.prototype.setFinishCall = function (call, thisObj) {
            var self = this;
            self.$fCall = call;
            self.$fThisObj = thisObj;
        };
        /**
         * 设置重复回调，建议不要重复设置，并自动开始
         */
        RepeatUtils.prototype.setRepeatCall = function (call) {
            var self = this;
            if (!self.$timer) {
                if (self.$call !== call) {
                    self.$call = call;
                    if (call && self.repeatCount > 0) {
                        self.$startTime = lie.Server.getTime();
                        self.$timer = new lie.Timer(self.onTimer, self);
                    }
                }
            }
        };
        return RepeatUtils;
    }());
    lie.RepeatUtils = RepeatUtils;
})(lie || (lie = {}));
//# sourceMappingURL=RepeatUtils.js.map