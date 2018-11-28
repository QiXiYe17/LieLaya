var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var lie;
(function (lie) {
    var code = 0; // 标志
    /**
     * 龙骨精灵
     */
    var DBSprite = /** @class */ (function (_super) {
        __extends(DBSprite, _super);
        /**
         * @param sk 骨骼资源
         */
        function DBSprite(sk) {
            var _this = _super.call(this) || this;
            _this.$message = 'DBS' + (code++); // 唯一标志
            _this.$effects = {};
            sk && (_this.skeleton = sk);
            return _this;
        }
        /**
         * 重写
         */
        DBSprite.prototype.destroy = function (dc) {
            _super.prototype.destroy.call(this, dc);
            this.onDestroy();
        };
        /**
         * 加载完成
         */
        DBSprite.prototype.onComplete = function () {
            var self = this;
            var LEvent = Laya.Event;
            var armature = self.$armature = self.$factory.buildArmature(1);
            self.addChild(armature);
            // 监听
            armature.on(LEvent.STOPPED, self, self.onStop);
            armature.on(LEvent.LABEL, self, self.onLabel);
            self.onInitView();
            // 注册
            lie.Dispatch.register(self.$message, self.onNotice, self);
        };
        /**
         * 销毁
         */
        DBSprite.prototype.onDestroy = function () {
            var self = this;
            self.$factory = self.$armature = self.$effects = null;
        };
        /**
         * 龙骨创建完且播放前触发
         */
        DBSprite.prototype.onInitView = function () {
        };
        /**
         * 文件监听回调
         */
        DBSprite.prototype.onLabel = function (data) {
            var effect = this.$effects[data.name];
            effect && effect[0].call(effect[1]);
        };
        /**
         * 响应
         * @param type 类型，0播放，1设置皮肤
         */
        DBSprite.prototype.onNotice = function (type) {
            var param = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                param[_i - 1] = arguments[_i];
            }
            var self = this, attr;
            if (type == 0)
                attr = 'onPlay';
            else if (type == 1)
                attr = 'onSetDisplay';
            else if (type == 2)
                attr = 'onGotoAndStop';
            attr && self[attr].apply(self, param);
        };
        /**
         * 播放动画
         * @param index 播放的动画下标
         * @param loop 是否循环播放
         */
        DBSprite.prototype.onPlay = function (index, loop) {
            this.$armature.play(index, loop);
        };
        /**
         * 设置插槽的显示内容，旧的将被替换
         * @param slotName 插槽
         * @param display 视图
         */
        DBSprite.prototype.onSetDisplay = function (slotName, display) {
            this.$armature.setSlotSkin(slotName, new Laya.Texture(display.drawToCanvas(display.width, display.height, 0, 0)));
        };
        /**
         * 将动画停在某一时间
         * @param time 时间
         * @param index 动画下标
         */
        DBSprite.prototype.onGotoAndStop = function (time, index) {
            var armature = this.$armature;
            var player = armature.player;
            time /= player.playbackRate; // 根据速率得出准确的单位时间
            // 停留的时间必须小于总时间
            if (time >= 0 && time <= player.playDuration) {
                var frame = time / player.cacheFrameRateInterval | 0; // 实际帧数
                armature.stop(); // 停止当前动画
                if (armature._aniClipIndex != index) {
                    armature._aniClipIndex = index;
                    armature._curOriginalData = new Float32Array(armature._templet.getTotalkeyframesLength(index));
                }
                var graphics = armature._getGrahicsDataWithCache(index, frame);
                graphics ? armature.graphics = graphics : armature._createGraphics(frame);
            }
        };
        /**
         * 播放结束回调
         */
        DBSprite.prototype.onStop = function () {
        };
        /**
         * 执行动画方法
         * @param attr 动画的方法属性
         */
        DBSprite.prototype.$excute = function (attr) {
            var armature = this.$armature;
            armature && armature[attr]();
        };
        /**
         * 播放动画
         * @param index 播放的动画下标，默认0
         * @param loop 是否循环播放
         */
        DBSprite.prototype.play = function (index, loop) {
            if (index === void 0) { index = 0; }
            lie.Dispatch.noticeLater(this.$message, 0, index, loop);
        };
        /**
         * 设置插槽的显示内容，旧的将被替换
         * @param slotName 插槽
         * @param display 视图
         */
        DBSprite.prototype.setDisplay = function (slotName, display) {
            lie.Dispatch.noticeLater(this.$message, 1, slotName, display);
        };
        /**
         * 将动画停在某一时间
         * 注：由Laya导入的骨骼动画生成的文件的帧数不是从源文件来的（懵逼），而是默认30帧，因此源文件的帧数与游戏的帧数是不对等的
         * 因此，假设源文件的播放速度的帧数是24(R)，如果要停在第6帧(F)，使用帧数转时间公式：T = F / R * 1000
         * @param time 时间
         * @param index 动画下标
         */
        DBSprite.prototype.gotoAndStop = function (time, index) {
            if (index === void 0) { index = 0; }
            lie.Dispatch.noticeLater(this.$message, 2, time, index);
        };
        /**
         * 添加龙骨文本监听
         */
        DBSprite.prototype.addLabelListener = function (name, call, thisObj) {
            this.$effects[name] = [call, thisObj];
        };
        /**
         * 停止播放
         */
        DBSprite.prototype.stop = function () {
            this.$excute('stop');
        };
        /**
         * 暂停播放
         */
        DBSprite.prototype.paused = function () {
            this.$excute('paused');
        };
        /**
         * 恢复播放
         */
        DBSprite.prototype.resume = function () {
            this.$excute('resume');
        };
        Object.defineProperty(DBSprite.prototype, "skeleton", {
            //// 适应ui功能 ////
            /**
             * 设置骨骼，适应ui，注意请调用一次即可
             */
            set: function (sk) {
                var self = this;
                var mFactory = self.$factory = new Laya.Templet();
                mFactory.on(Laya.Event.COMPLETE, self, self.onComplete);
                mFactory.loadAni(lie.RES.getUrl(sk));
            },
            enumerable: true,
            configurable: true
        });
        return DBSprite;
    }(Laya.Sprite));
    lie.DBSprite = DBSprite;
})(lie || (lie = {}));
//# sourceMappingURL=DBSprite.js.map