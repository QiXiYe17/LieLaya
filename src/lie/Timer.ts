module lie {

	var count = 0;

	/**
	 * 计时器，可启动、停止及统计已运行时间（单位毫秒），默认启动
	 */
	export class Timer {

		private $call: Function;
		private $thisObj: any;

		private $running: boolean;
		private $runTime: number = 0;	// 已运行时间
		private $runCount: number = 0;	// 已运行次数
		private $lastTime: number;		// 上一次时间

		/**
		 * 默认状态就是创建一个每一帧刷新一次的计时器
		 * @param call 回调方法
		 * @param thisObj 回调对象
		 * @param delay 延迟，默认1，isTime为true时表示毫秒，否则表示帧数
		 * @param isTime 是否时间回调，默认false（时间回调、帧回调）
		 * @param isStop 是否不需要直接运行
		 */
		public constructor(call: Function, thisObj?: any, delay: number = 1, isTime?: boolean, isStop?: boolean) {
			this.$call = call;
			this.$thisObj = thisObj;
			isStop || this.start();
			Laya.timer[isTime ? 'loop' : 'frameLoop'](delay, this, this.update);
		}

		/**
		 * 回调
		 */
		protected update(): void {
			var self = this;
			if (self.$running) {
				self.$runCount++;
				self.$call.call(self.$thisObj);
			}
		}

		/**
		 * 开始计时
		 */
		public start(): void {
			var self = this;
			if (!self.$running) {
				self.$lastTime = Date.now();
				self.$running = true;
			}
		}

		/**
		 * 停止计时
		 */
		public stop(): void {
			var self = this;
			if (self.$running) {
				let nowT = Date.now();
				self.$runTime += nowT - self.$lastTime;
				self.$lastTime = nowT;
				self.$running = false;
			}
		}

		/**
		 * 获取是否运行中
		 */
		public get running(): boolean {
			return this.$running;
		}

		/**
		 * 获取运行的时间
		 */
		public get runTime(): number {
			var self = this;
			return self.$runTime + (self.running ?
				Date.now() - self.$lastTime : 0);
		}

		/**
		 * 获取运行的次数（执行回调的次数）
		 */
		public get runCount(): number {
			return this.$runCount;
		}

		/**
		 * 重置时间，归0
		 */
		public reset(): void {
			var self = this;
			self.$runTime = self.$runCount = 0;
			self.$lastTime = Date.now();
		}

		/**
		 * 清除定时器，一经清除，将不可再用
		 */
		public clear(): void {
			var self = this;
			Laya.timer.clear(self, self.update);
			self.$call = self.$thisObj = null;
		}
	}
}