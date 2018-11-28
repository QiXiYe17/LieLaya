var lie;
(function (lie) {
    /**
     * vector3的缓间动画
     */
    var TweenVector3 = /** @class */ (function () {
        function TweenVector3(from, to, time, call, thisObj, ease) {
            var _this = this;
            var vector = this.$vector = from.clone();
            this.$onChange = call;
            this.$thisObj = thisObj;
            lie.Tween.get(vector, {
                frameCall: this.update, frameObj: this
            }).to({
                x: to.x, y: to.y, z: to.z
            }, time, ease).call(function () {
                _this.update();
                _this.clear();
            });
        }
        /**
         * 执行回调
         */
        TweenVector3.prototype.update = function () {
            var self = this;
            var call = self.$onChange;
            call && call.call(self.$thisObj, self.$vector);
        };
        /**
         * 清除
         */
        TweenVector3.prototype.clear = function () {
            var self = this;
            lie.Tween.clear(self.$vector);
            self.$onChange = self.$thisObj = self.$vector = null;
        };
        /**
         * 创建V3d动画对象
         * @param from 当前值
         * @param to 最终值
         * @param time 变化时间
         * @param call 变化回调，参数：当前帧的值
         * @param thisObj 回调所属对象
         */
        TweenVector3.create = function (from, to, time, call, thisObj) {
            return new TweenVector3(from, to, time, call, thisObj);
        };
        /**
         * 创建3D变化对象的属性的动画对象
         * @param transform 3D变化对象
         * @param attr transform的属性值
         * @param to 最终值
         * @param time 变化时间
         * @param ease 变化规律
         */
        TweenVector3.$createTF = function (transform, attr, to, time, ease) {
            return new TweenVector3(transform[attr], to, time, function (v) {
                transform[attr] = v;
            }, null, ease);
        };
        /**
         * 创建3D变化对象position变化动画对象
         * @param transform 3D变化对象
         * @param to 最终值
         * @param time 变化时间
         * @param ease 变化规律
         */
        TweenVector3.createPos = function (transform, to, time, ease) {
            return TweenVector3.$createTF(transform, 'position', to, time, ease);
        };
        /**
         * 创建3D变化对象localRotationEuler变化动画对象
         * @param transform 3D变化对象
         * @param to 最终值
         * @param time 变化时间
         * @param ease 变化规律
         */
        TweenVector3.createLRotE = function (transform, to, time, ease) {
            return TweenVector3.$createTF(transform, 'localRotationEuler', to, time, ease);
        };
        return TweenVector3;
    }());
    lie.TweenVector3 = TweenVector3;
})(lie || (lie = {}));
//# sourceMappingURL=TweenVector3.js.map