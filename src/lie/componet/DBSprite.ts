module lie {

	var code = 0;	// 标志

	/**
	 * 龙骨精灵
	 */
	export class DBSprite extends Laya.Sprite {

		private $message: string = 'DBS' + (code++);	// 唯一标志

		protected $factory: Laya.Templet;
		protected $armature: Laya.Skeleton;

		private $effects: any = {};

		/**
		 * @param sk 骨骼资源
		 */
		constructor(sk?: string) {
			super();
			sk && (this.skeleton = sk);
		}

		/**
		 * 重写
		 */
		public destroy(dc?: boolean): void {
			super.destroy(dc);
			this.onDestroy();
		}

		/**
		 * 加载完成
		 */
		protected onComplete(): void {
			var self = this;
			var LEvent = Laya.Event;
			var armature = self.$armature = self.$factory.buildArmature(1);
			self.addChild(armature);
			// 监听
			armature.on(LEvent.STOPPED, self, self.onStop);
			armature.on(LEvent.LABEL, self, self.onLabel);
			self.onInitView();
			// 注册
			Dispatch.register(self.$message, self.onNotice, self);
		}

		/**
		 * 销毁
		 */
		protected onDestroy(): void {
			var self = this;
			self.$factory = self.$armature = self.$effects = null;
		}

		/**
		 * 龙骨创建完且播放前触发
		 */
		protected onInitView(): void {

		}

		/**
		 * 文件监听回调
		 */
		protected onLabel(data: Laya.EventData): void {
			var effect = this.$effects[data.name];
			effect && effect[0].call(effect[1]);
		}

		/**
		 * 响应
		 * @param type 类型，0播放，1设置皮肤
		 */
		protected onNotice(type: number, ...param: any[]): void {
			var self = this, attr;
			if (type == 0)
				attr = 'onPlay';
			else if (type == 1)
				attr = 'onSetDisplay';
			else if (type == 2)
				attr = 'onGotoAndStop';
			attr && self[attr].apply(self, param);
		}

		/**
		 * 播放动画
		 * @param index 播放的动画下标
		 * @param loop 是否循环播放
		 */
		protected onPlay(index?: number, loop?: boolean): void {
			this.$armature.play(index, loop);
		}

		/**
		 * 设置插槽的显示内容，旧的将被替换
		 * @param slotName 插槽
		 * @param display 视图
		 */
		protected onSetDisplay(slotName: string, display: Laya.Sprite): void {
			this.$armature.setSlotSkin(slotName, new Laya.Texture(display.drawToCanvas(display.width, display.height, 0, 0)));
		}

		/**
		 * 将动画停在某一时间
		 * @param time 时间
		 * @param index 动画下标
		 */
		protected onGotoAndStop(time: number, index: number): void {
			var armature = <any>this.$armature;
			var player = armature.player;
			time /= player.playbackRate;	// 根据速率得出准确的单位时间
			// 停留的时间必须小于总时间
			if (time >= 0 && time <= player.playDuration) {
				let frame = time / player.cacheFrameRateInterval | 0;	// 实际帧数
				armature.stop();			// 停止当前动画
				if (armature._aniClipIndex != index) {
					armature._aniClipIndex = index;
					armature._curOriginalData = new Float32Array(armature._templet.getTotalkeyframesLength(index));
				}
				let graphics = armature._getGrahicsDataWithCache(index, frame);
				graphics ? armature.graphics = graphics : armature._createGraphics(frame);
			}
		}

		/**
		 * 播放结束回调
		 */
		protected onStop(): void {
		}

		/**
		 * 执行动画方法
		 * @param attr 动画的方法属性
		 */
		private $excute(attr: string): void {
			var armature = this.$armature;
			armature && armature[attr]();
		}

		/**
		 * 播放动画
		 * @param index 播放的动画下标，默认0
		 * @param loop 是否循环播放
		 */
		public play(index: number = 0, loop?: boolean): void {
			Dispatch.noticeLater(this.$message, 0, index, loop);
		}

		/**
		 * 设置插槽的显示内容，旧的将被替换
		 * @param slotName 插槽
		 * @param display 视图
		 */
		public setDisplay(slotName: string, display: Laya.Sprite): void {
			Dispatch.noticeLater(this.$message, 1, slotName, display);
		}

		/**
		 * 将动画停在某一时间
		 * 注：由Laya导入的骨骼动画生成的文件的帧数不是从源文件来的（懵逼），而是默认30帧，因此源文件的帧数与游戏的帧数是不对等的
		 * 因此，假设源文件的播放速度的帧数是24(R)，如果要停在第6帧(F)，使用帧数转时间公式：T = F / R * 1000
		 * @param time 时间
		 * @param index 动画下标
		 */
		public gotoAndStop(time: number, index: number = 0): void {
			Dispatch.noticeLater(this.$message, 2, time, index);
		}

		/**
		 * 添加龙骨文本监听
		 */
		public addLabelListener(name: string, call: Function, thisObj?: any): void {
			this.$effects[name] = [call, thisObj];
		}

		/**
		 * 停止播放
		 */
		public stop(): void {
			this.$excute('stop');
		}

		/**
		 * 暂停播放
		 */
		public paused(): void {
			this.$excute('paused');
		}

		/**
		 * 恢复播放
		 */
		public resume(): void {
			this.$excute('resume');
		}

		//// 适应ui功能 ////

		/**
		 * 设置骨骼，适应ui，注意请调用一次即可
		 */
		public set skeleton(sk: string) {
			var self = this;
			var mFactory = self.$factory = new Laya.Templet();
			mFactory.on(Laya.Event.COMPLETE, self, self.onComplete);
			mFactory.loadAni(RES.getUrl(sk));
		}
	}
}