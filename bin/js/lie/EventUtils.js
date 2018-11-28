var lie;
(function (lie) {
    /**
     * 控件监听工具类
     */
    var EventUtils = /** @class */ (function () {
        function EventUtils() {
        }
        /**
         * 是否有该监听
         * @param type 监听类型
         * @param call 空时只检测类型
         * @param thisObj 回调所属对象
         */
        EventUtils.hasEventListener = function (target, type, call, thisObj) {
            var value = target._events;
            var datas = value && value[type];
            if (datas && call) {
                if (datas instanceof laya.events.EventHandler)
                    return datas.method == call && datas.caller == thisObj;
                // 数组
                for (var i in datas) {
                    var event_1 = datas[i];
                    if (event_1.method == call && event_1.caller == thisObj)
                        return true;
                }
            }
            // datas存在的情况下，call为空返回真
            return !!datas && !call;
        };
        /**
         * 添加缩放监听，记得用removeEventListener来移除这个监听
         */
        EventUtils.addScaleListener = function (target, scale) {
            if (scale === void 0) { scale = 0.95; }
            var self = EventUtils;
            target.$evtScale = scale;
            target.$bgScaleX = target.scaleX;
            target.$bgScaleY = target.scaleY;
            self.addTouchBeginListener(target, self.onScaleBegin, self);
            self.addTouchFinishListener(target, self.onScaleEnd, self);
        };
        /**
         * 缩放开始
         */
        EventUtils.onScaleBegin = function (event) {
            var target = event.currentTarget;
            var tween = lie.Tween;
            var scale = target.$evtScale;
            var scaleX = target.scaleX = target.$bgScaleX;
            var scaleY = target.scaleY = target.$bgScaleY;
            scaleX *= scale;
            scaleY *= scale;
            target.$hashBegin = true;
            tween.get(target).to({ scaleX: scaleX, scaleY: scaleY }, EventUtils.$scaleTime);
        };
        /**
         * 缩放结束
         */
        EventUtils.onScaleEnd = function (event) {
            var target = event.currentTarget;
            var time = EventUtils.$scaleTime;
            var scaleX = target.$bgScaleX;
            var scaleY = target.$bgScaleY;
            var bScaleX = scaleX * 1.1;
            var bScaleY = scaleY * 1.1;
            target.$hashBegin && lie.Tween.get(target).to({ scaleX: bScaleX, scaleY: bScaleY }, time).
                to({ scaleX: scaleX, scaleY: scaleY }, time);
            target.$hashBegin = void 0;
        };
        // 常用的监听类型归类
        /**
         * 添加点击按下监听
         */
        EventUtils.addTouchBeginListener = function (target, call, thisObj) {
            target.on(Laya.Event.MOUSE_DOWN, thisObj, call);
        };
        /**
         * 添加点击移动监听
         */
        EventUtils.addTouchMoveListener = function (target, call, thisObj) {
            target.on(Laya.Event.MOUSE_MOVE, thisObj, call);
        };
        /**
         * 添加点击谈起监听
         */
        EventUtils.addTouchEndListener = function (target, call, thisObj) {
            target.on(Laya.Event.MOUSE_UP, thisObj, call);
        };
        /**
         * 添加click监听
         */
        EventUtils.addClickListener = function (target, call, thisObj, musicType) {
            if (musicType === void 0) { musicType = 0; }
            EventUtils.addClickEffect(target, musicType);
            target.on(Laya.Event.CLICK, thisObj, call);
        };
        /**
         * 在click的基础上进行缩放
         */
        EventUtils.addClickScaleListener = function (target, call, thisObj, musicType, scale) {
            var self = EventUtils;
            self.addScaleListener(target, scale);
            self.addClickListener(target, call, thisObj, musicType);
        };
        /**
         * 添加监听结束监听
         */
        EventUtils.addTouchFinishListener = function (target, finish, thisObj) {
            var event = Laya.Event;
            target.on(Laya.Event.MOUSE_UP, thisObj, finish);
            target.on(Laya.Event.MOUSE_OUT, thisObj, finish);
        };
        /**
         * 添加按住监听
         * @param target
         * @param begin 按住时的回调
         * @param end 松手时的回调，会调用多次，请自己在end里判断
         */
        EventUtils.addTouchingListener = function (target, begin, end, thisObj) {
            var self = EventUtils;
            self.addTouchBeginListener(target, begin, thisObj);
            self.addTouchFinishListener(target, end, thisObj);
        };
        /**
         * 添加移动控件监听
         * @param target 监听控件
         * @param call 移动时的回调，回调参数有俩，横坐标的移动值和纵坐标的移动值
         * @param thisObj 回调的所属对象
         */
        EventUtils.addMovingListener = function (target, call, thisObj) {
            var self = EventUtils;
            var touchX, touchY;
            self.addTouchBeginListener(target, function (e) {
                e.stopPropagation();
                touchX = e.stageX;
                touchY = e.stageY;
            });
            self.addTouchMoveListener(target, function (e) {
                e.stopPropagation();
                var newX = e.stageX, newY = e.stageY;
                call.call(thisObj, newX - touchX, newY - touchY);
                touchX = newX;
                touchY = newY;
            });
        };
        /**
         * 添加点击音效
         */
        EventUtils.addClickEffect = function (target, type) {
            var self = EventUtils;
            var music = self.$musics[type];
            music && self.addTouchBeginListener(target, function () {
                // pfUtils.createEffect(music);
            }, null);
        };
        EventUtils.$scaleTime = 100; // 缩放动画时间
        // 音效相关
        /**
         * 类型说明：普通点击(修改了，原open)、关闭型按钮点击、领取型点击
         */
        EventUtils.$musics = [ /*'icon_close', 'icon_close', 'purchase'*/];
        return EventUtils;
    }());
    lie.EventUtils = EventUtils;
})(lie || (lie = {}));
//# sourceMappingURL=EventUtils.js.map