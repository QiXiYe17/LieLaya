module lie {
	/**
	 * 服务器属性类
	 */
	export class Server {

		/**
		 * CDN域名地址
		 */
		public static CDN: string = 'https://static.xunguanggame.com/bridge/';
		/**
		 * 服务器地址
		 */
		// public static HOST: string = 'http://192.168.1.36:8921';
		// public static HOST: string = 'http://192.168.0.104:8921';
		// public static HOST: string = 'https://wxgame.xunguanggame.com/' + appName + '-be/';
		public static HOST: string = 'https://wxgame.xunguanggame.com/' + appName + '-be-qa/';

		// 需要设置的参数
		public static uid: number;		// 玩家的uid
		public static rid: number;		// 来自谁的分享
		public static scKey: string;	// 玩家保存分数的秘钥

		/**
		 * 登录回调
		 */
		public static onLogin(info: ILoginInfo): void {
			var self = Server;
			var clzz = AppConfig;
			self.uid = info.gameInfo.uid;
			clzz.onLogin(info);
			self.updateTime(info.time);
			clzz.excuteCalls();
		}

		/**
		 * 是否登录成功
		 */
		public static isLogin(): boolean {
			return !!Server.uid;
		}

		// 时间相关

		private static $serverTime: number = 0;	// 服务器时间
		private static $localTime: number = 0;	// 本地时间

		/**
		 * 获取当前服务器时间，毫秒，功能同本地时间
		 */
		public static getTime(): number {
			var self = Server;
			return self.$serverTime + Date.now() - self.$localTime;
		}

		/**
		 * 获取秒数
		 */
		public static getSecond(): number {
			return Server.getTime() / 1000 | 0;
		}

		/**
		 * 更新时间
		 * @param time 服务器返回它的时间，这里是单位是秒
		 */
		public static updateTime(time: number): void {
			var self = this;
			self.$serverTime = time * 1000;
			self.$localTime = Date.now();
		}
	}
}