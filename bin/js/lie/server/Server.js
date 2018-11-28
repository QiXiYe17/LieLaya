var lie;
(function (lie) {
    /**
     * 服务器属性类
     */
    var Server = /** @class */ (function () {
        function Server() {
        }
        /**
         * 登录回调
         */
        Server.onLogin = function (info) {
            var self = Server;
            var clzz = AppConfig;
            self.uid = info.gameInfo.uid;
            clzz.onLogin(info);
            self.updateTime(info.time);
            clzz.excuteCalls();
        };
        /**
         * 是否登录成功
         */
        Server.isLogin = function () {
            return !!Server.uid;
        };
        /**
         * 获取当前服务器时间，毫秒，功能同本地时间
         */
        Server.getTime = function () {
            var self = Server;
            return self.$serverTime + Date.now() - self.$localTime;
        };
        /**
         * 获取秒数
         */
        Server.getSecond = function () {
            return Server.getTime() / 1000 | 0;
        };
        /**
         * 更新时间
         * @param time 服务器返回它的时间，这里是单位是秒
         */
        Server.updateTime = function (time) {
            var self = this;
            self.$serverTime = time * 1000;
            self.$localTime = Date.now();
        };
        /**
         * CDN域名地址
         */
        Server.CDN = 'https://static.xunguanggame.com/bridge/';
        /**
         * 服务器地址
         */
        // public static HOST: string = 'http://192.168.1.36:8921';
        // public static HOST: string = 'http://192.168.0.104:8921';
        // public static HOST: string = 'https://wxgame.xunguanggame.com/' + appName + '-be/';
        Server.HOST = 'https://wxgame.xunguanggame.com/' + lie.appName + '-be-qa/';
        // 时间相关
        Server.$serverTime = 0; // 服务器时间
        Server.$localTime = 0; // 本地时间
        return Server;
    }());
    lie.Server = Server;
})(lie || (lie = {}));
//# sourceMappingURL=Server.js.map