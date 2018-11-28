/**
 * 入口
 */
(function () {
    // 程序入口
    Laya.init(750, 1334, Laya.WebGL);
    // 初始化
    var stage = Laya.stage;
    var clzz = Laya.Stage;
    stage.scaleMode = clzz.SCALE_FIXED_WIDTH;
    stage.screenMode = clzz.SCREEN_VERTICAL;
    stage.alignH = clzz.ALIGN_CENTER;
    stage.alignV = clzz.ALIGN_MIDDLE;
    // 示例

    /**
     * Timer测试
     */
    var timerTest = function () {
        console.log('start', Date.now());
        // 每1帧执行一次，默认不执行
        var timer = new lie.Timer(function () {
            console.log('time: ' + Date.now(), 'runTime And Count: ', timer.runTime, timer.runCount);
            // 运行10秒后清除
            if (timer.runTime > 10000)
                timer.clear();
        }, null, 1, false, true);
        // 2秒后执行
        lie.setTimeout(timer.start, timer, 2000);
    };

    /**
     * 环间动画测试
     */
    var tweenTest = function () {
        var obj = { x: 100, y: 100 };
        console.log('start', Date.now());
        // 先停止200毫秒；1秒内x变化到1000；设置y为1000；执行回调
        var tween = lie.Tween.get(obj, {
            loop: true, frameCall: function () {
                console.log('current obj: ' + obj.x + ',' + obj.y);
            }
        }).wait(200).to({ x: 1000 }, 1000, lie.Ease.elasticOut).set({ y: 1000 }).call(function () {
            console.log('End Time: ' + Date.now());
        });
        // 2秒后停止
        lie.setTimeout(tween.stop, tween, 2000);
        // 4秒后恢复
        lie.setTimeout(tween.resume, tween, 4000);
        // 6秒后清理
        lie.setTimeout(tween.clear, tween, 6000);
    };

    // 执行示例
    timerTest();
    tweenTest();
})();