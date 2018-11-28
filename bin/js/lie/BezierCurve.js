var lie;
(function (lie) {
    /**
     * 贝塞尔曲线
     */
    var BezierCurve = /** @class */ (function () {
        function BezierCurve() {
        }
        /**
         * C(n,i)的值
         */
        BezierCurve.cni = function (n, i) {
            i > n / 2 && (i = n - i); // C(n,i)=C(n,n-i)
            var s0 = 1;
            var s1 = 1;
            for (var k = 0; k < i; k++) {
                s0 *= (n - k);
                s1 *= (k + 1);
            }
            return s0 / s1;
        };
        /**
         * 假设N次贝塞尔曲线，则它需要确定的坐标数是N+1
         * @param points 第一个和最后一个坐标分别为起终点，其余为作用力点，可以没有作用力点，效果是直线
         * @param value 0-1
         */
        BezierCurve.bezierAt = function (points, value) {
            var n = points.length - 1;
            var x = 0;
            var y = 0;
            var cni = BezierCurve.cni;
            var pow = Math.pow;
            for (var i = 0; i <= n; i++) {
                var pi = points[i];
                var xs = cni(n, i) * pow(1 - value, n - i) * pow(value, i);
                x += pi.x * xs;
                y += pi.y * xs;
            }
            return { x: x, y: y };
        };
        /**
         * 运行贝塞尔曲线
         * @param target 运行对象
         * @param points 运行轨迹
         * @param during 运行时间
         * @param onFinish 运行结束回调
         * @param thisObject 回调对象
         * @param params 回调参数
         */
        BezierCurve.run = function (target, points, during, onFinish, thisObject) {
            var params = [];
            for (var _i = 5; _i < arguments.length; _i++) {
                params[_i - 5] = arguments[_i];
            }
            var timer = Laya.timer;
            var startTime = Date.now();
            var method = function () {
                var curPro = Date.now() - startTime;
                var precent = curPro > during ? 1 : curPro / during;
                var point = BezierCurve.bezierAt(points, precent);
                target.x = point.x;
                target.y = point.y;
                if (precent == 1) {
                    timer.clear(null, method);
                    onFinish && onFinish.apply(thisObject, params);
                }
            };
            timer.frameLoop(1, null, method);
        };
        /**
         * 运行多段贝塞尔曲线
         * @param target 运行对象
         * @param points 运行轨迹，二维数组
         * @param durings 运行时间数组，每个数表示每条曲线的运行时间，若是数字则每段曲线时间一样
         * @param onFinish 运行结束回调
         * @param thisObject 回调对象
         * @param params 回调参数
         */
        BezierCurve.runs = function (target, points, durings, onFinish, thisObject) {
            var params = [];
            for (var _i = 5; _i < arguments.length; _i++) {
                params[_i - 5] = arguments[_i];
            }
            var timer = Laya.timer;
            var startTime = Date.now();
            var dur = function (index) {
                if (typeof durings === 'number')
                    return durings;
                return durings[index];
            };
            var count = 0;
            var length = points.length;
            var method = function () {
                var during = dur(count);
                var curPro = Date.now() - startTime;
                var precent = curPro > during ? 1 : curPro / during;
                var point = BezierCurve.bezierAt(points[count], precent);
                target.x = point.x;
                target.y = point.y;
                if (precent == 1) {
                    count++;
                    startTime += during;
                }
                if (count == length) {
                    timer.clear(null, method);
                    onFinish && onFinish.apply(thisObject, params);
                }
            };
            timer.frameLoop(1, null, method);
        };
        return BezierCurve;
    }());
    lie.BezierCurve = BezierCurve;
})(lie || (lie = {}));
//# sourceMappingURL=BezierCurve.js.map