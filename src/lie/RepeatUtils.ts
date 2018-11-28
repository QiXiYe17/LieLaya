module lie {

	/**
	 * 重复工具类
	 * 功能：定时发起重复操作回调，当回调结果为true时结束回调，并通知成功；
	 * 当在规定上限内还未收到true的话也会结束回调，并通知失败
	 */
	export class RepeatUtils {

		private $timer: Timer;					// 定时器
		private $startTime: number;				// 上次启动时间
		private $call: Promise<boolean>;		// 操作函数
		private $fCall: (bool: boolean) => void;// 结束函数
		private $fThisObj: any;					// 结束函数所属对象

		protected isRunning: boolean;			// 是否运行中
		protected repeatTime: number;			// 重复时间间隔，毫秒数
		protected repeatCount: number;			// 当前实时剩余次数，小于等于0会结束回调

		/**
		 * @param repeatTime 单位毫秒，即每隔多久发起一次操作
		 * @param repeatCount 操作次数上限，默认一次
		 */
		public constructor(repeatTime: number, repeatCount: number = 1) {
			this.repeatTime = repeatTime
			this.repeatCount = isNaN(repeatCount) ? 0 : repeatCount;
		}

		/**
		 * 定时器回调
		 */
		protected onTimer(): void {
			var self = this;
			var curT = Server.getTime();
			if (curT - self.$startTime >= self.repeatTime && !self.isRunning) {
				let promise = self.$call;
				let endCall = function () {
					self.isRunning = false;
					if (!(--self.repeatCount > 0)) {
						self.onFinish(false);
					}
				};
				self.$startTime = curT;
				self.isRunning = true;
				if (promise instanceof Promise) {
					promise.then(function (bool) {
						bool ? self.onFinish(true) : endCall();
					}).catch(endCall);
				}
				else {
					endCall();
				}
			}
		}

		/**
		 * 回调结束
		 * @param bool 操作结果
		 */
		protected onFinish(bool: boolean): void {
			var self = this;
			var fCall = self.$fCall;
			var timer = self.$timer;
			self.isRunning = false;
			if (timer) {
				fCall.call(self.$fThisObj, bool);
				self.$timer.clear();
				self.$timer = null;
			}
		}

		/**
		 * 设置结束回调，不设置也不会怎么样
		 * @param call 参数表示是否正常结束
		 */
		public setFinishCall(call: (bool: boolean) => void, thisObj?: any): void {
			var self = this;
			self.$fCall = call;
			self.$fThisObj = thisObj;
		}

		/**
		 * 设置重复回调，建议不要重复设置，并自动开始
		 */
		public setRepeatCall(call: Promise<boolean>): void {
			var self = this;
			if (!self.$timer) {
				if (self.$call !== call) {
					self.$call = call;
					if (call && self.repeatCount > 0) {
						self.$startTime = Server.getTime();
						self.$timer = new Timer(self.onTimer, self);
					}
				}
			}
		}
	}
}