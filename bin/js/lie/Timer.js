var lie;
(function (lie) {
    var count = 0;
    /**
     * 计时器，可启动、停止及统计已运行时间（单位毫秒），默认启动
     */
    var Timer = /** @class */ (function () {
        /**
         * 默认状态就是创建一个每一帧刷新一次的计时器
         * @param call 回调方法
         * @param thisObj 回调对象
         * @param delay 延迟，默认1，isTime为true时表示毫秒，否则表示帧数
         * @param isTime 是否时间回调，默认false（时间回调、帧回调）
         * @param isStop 是否不需要直接运行
         */
        function Timer(call, thisObj, delay, isTime, isStop) {
            if (delay === void 0) { delay = 1; }
            this.$runTime = 0; // 已运行时间
            this.$runCount = 0; // 已运行次数
            this.$call = call;
            this.$thisObj = thisObj;
            isStop || this.start();
            Laya.timer[isTime ? 'loop' : 'frameLoop'](delay, this, this.update);
        }
        /**
         * 回调
         */
        Timer.prototype.update = function () {
            var self = this;
            if (self.$running) {
                self.$runCount++;
                self.$call.call(self.$thisObj);
            }
        };
        /**
         * 开始计时
         */
        Timer.prototype.start = function () {
            var self = this;
            if (!self.$running) {
                self.$lastTime = Date.now();
                self.$running = true;
            }
        };
        /**
         * 停止计时
         */
        Timer.prototype.stop = function () {
            var self = this;
            if (self.$running) {
                var nowT = Date.now();
                self.$runTime += nowT - self.$lastTime;
                self.$lastTime = nowT;
                self.$running = false;
            }
        };
        Object.defineProperty(Timer.prototype, "running", {
            /**
             * 获取是否运行中
             */
            get: function () {
                return this.$running;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Timer.prototype, "runTime", {
            /**
             * 获取运行的时间
             */
            get: function () {
                var self = this;
                return self.$runTime + (self.running ?
                    Date.now() - self.$lastTime : 0);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Timer.prototype, "runCount", {
            /**
             * 获取运行的次数（执行回调的次数）
             */
            get: function () {
                return this.$runCount;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 重置时间，归0
         */
        Timer.prototype.reset = function () {
            var self = this;
            self.$runTime = self.$runCount = 0;
            self.$lastTime = Date.now();
        };
        /**
         * 清除定时器，一经清除，将不可再用
         */
        Timer.prototype.clear = function () {
            var self = this;
            Laya.timer.clear(self, self.update);
            self.$call = self.$thisObj = null;
        };
        return Timer;
    }());
    lie.Timer = Timer;
})(lie || (lie = {}));
//# sourceMappingURL=Timer.js.map