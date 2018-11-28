var lie;
(function (lie) {
    /**
     * 仅首次then有效的Promise
     * 使用场景：在Promise还未返回时同时触发多次promise时，仅想第一次有效或者promise对象只需要一个即可时可采取该类。
     * 例如：微信看视频，由于视频弹出较慢，玩家可能会点击多次按钮，促使弹出多个视频，这很明显不合理。
     *   弹视频需要做到旧视频未关闭新视频不能出来，因此pomise只需要一个对象即可，按钮点击可以继续触发promise，
     *   但由于是同一个对象，且不发生其他操作，简化了UI类的使用。
     */
    var FPromise = /** @class */ (function () {
        function FPromise(executor) {
            /**
             * 模仿Promise对象的空函数对象
             */
            this.$space = {
                then: function () { }, catch: function () { }
            };
            this.$promise = new Promise(executor);
        }
        /**
         * 功能同Promise.then但是没有返回
         */
        FPromise.prototype.then = function (onfulfilled, onrejected) {
            var self = this;
            if (!self.$firstT) {
                self.$firstT = true;
                self.$promise.then(onfulfilled, onrejected);
            }
            return self;
        };
        /**
         * 功能同Promise.catch但是没有返回
         */
        FPromise.prototype.catch = function (onrejected) {
            var self = this;
            if (!self.$firstC) {
                self.$firstC = true;
                self.$promise.catch(onrejected);
            }
            return self;
        };
        return FPromise;
    }());
    lie.FPromise = FPromise;
})(lie || (lie = {}));
//# sourceMappingURL=FPromise.js.map